import axios from "axios";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const SHIPROCKET_AUTH_URL =
  "https://apiv2.shiprocket.in/v1/external/auth/login";

const SHIPROCKET_SERVICEABILITY_URL =
  "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";

const TOKEN_CACHE_DURATION_MS =
  9 * 24 * 60 * 60 * 1000;

let cachedToken = null;
let cachedTokenAt = 0;

const DEFAULT_PICKUP_PIN = "700008";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundUpRate(value) {
  return Math.ceil(toNumber(value, 0));
}

function buildDeliveryTime(courier, fallbackMinDays, fallbackMaxDays) {
  const courierName = courier?.courier_name || "Courier";
  const etdHours = toNumber(courier?.etd_hours, 0);

  if (etdHours > 0) {
    const estimatedDays = Math.max(1, Math.ceil(etdHours / 24));
    return `Estimated ${estimatedDays} day${estimatedDays === 1 ? "" : "s"} (${courierName})`;
  }

  const estimatedDeliveryDays = toNumber(courier?.estimated_delivery_days, 0);
  if (estimatedDeliveryDays > 0) {
    const estimatedDays = Math.max(1, Math.ceil(estimatedDeliveryDays));
    return `Estimated ${estimatedDays} day${estimatedDays === 1 ? "" : "s"} (${courierName})`;
  }

  return `Estimated ${fallbackMinDays}–${fallbackMaxDays} days (${courierName})`;
}

function getCourierEtaHours(courier) {
  const etdHours = toNumber(courier?.etd_hours, 0);
  if (etdHours > 0) return etdHours;

  const estimatedDays = toNumber(courier?.estimated_delivery_days, 0);
  if (estimatedDays > 0) return estimatedDays * 24;

  return null;
}

function isCourierFaster(courierA, courierB) {
  const etaA = getCourierEtaHours(courierA);
  const etaB = getCourierEtaHours(courierB);
  if (etaA === null || etaB === null) return false;
  return etaA < etaB;
}

async function getShiprocketToken() {
  const now = Date.now();
  if (cachedToken && now - cachedTokenAt < TOKEN_CACHE_DURATION_MS) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Shiprocket credentials are missing from environment."
    );
  }

  const response = await axios.post(
    SHIPROCKET_AUTH_URL,
    { email, password },
    { timeout: 15000 }
  );

  const token = response?.data?.token;
  if (!token) {
    throw new Error("Shiprocket authentication failed: no token returned.");
  }

  cachedToken = token;
  cachedTokenAt = now;
  return token;
}

/* -------------------------------------------------------
   Handler (Universal: Netlify v2, Netlify v1, & Express)
------------------------------------------------------- */

export default async function handler(reqOrEvent, resOrContext) {
  // 1. Detect runtime environment
  const isExpress = typeof resOrContext?.status === "function";
  const isWebStandard = typeof Response !== "undefined";

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const sendResponse = (statusCode, payload) => {
    // A. Express / local dev server
    if (isExpress) {
      return resOrContext.status(statusCode).json(payload);
    }
    // B. Netlify v2 (Standard Web Response)
    if (isWebStandard) {
      return new Response(JSON.stringify(payload), {
        status: statusCode,
        headers: corsHeaders,
      });
    }
    // C. Legacy Lambda object fallback
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify(payload),
    };
  };

  // 2. Parse Method
  const method = reqOrEvent?.method || reqOrEvent?.httpMethod || "POST";

  if (method === "OPTIONS") {
    return sendResponse(200, {});
  }

  if (method !== "POST") {
    return sendResponse(405, {
      serviceable: false,
      message: "Method not allowed.",
    });
  }

  // 3. Parse Body (supports Web Request, Express parsed body, and Lambda string body)
  let body = {};
  try {
    if (typeof reqOrEvent?.json === "function") {
      body = await reqOrEvent.json();
    } else if (typeof reqOrEvent?.body === "string") {
      body = JSON.parse(reqOrEvent.body);
    } else if (reqOrEvent?.body) {
      body = reqOrEvent.body;
    }
  } catch {
    body = {};
  }

  try {
    const {
      deliveryPinCode,
      weight,
      length,
      breadth,
      height,
      subtotal,
    } = body || {};

    const cleanDeliveryPinCode = String(deliveryPinCode || "").replace(/\D/g, "");

    if (!/^\d{6}$/.test(cleanDeliveryPinCode)) {
      return sendResponse(400, {
        serviceable: false,
        message: "Please enter a valid 6-digit PIN code.",
      });
    }

    const safeWeight = Math.max(0.1, toNumber(weight, 0.2));
    const safeLength = Math.max(1, toNumber(length, 20));
    const safeBreadth = Math.max(1, toNumber(breadth, 15));
    const safeHeight = Math.max(1, toNumber(height, 3));
    const safeSubtotal = Math.max(0, toNumber(subtotal, 0));
    const pickupPinCode = DEFAULT_PICKUP_PIN;

    const isWestBengal = ["70", "71", "72", "73", "74"].some((prefix) =>
      cleanDeliveryPinCode.startsWith(prefix)
    );
    const freeShippingThreshold = isWestBengal ? 999 : 1999;

    let token = await getShiprocketToken();
    let response;

    const serviceabilityParams = {
      pickup_postcode: pickupPinCode,
      delivery_postcode: cleanDeliveryPinCode,
      weight: safeWeight,
      cod: 0,
      length: safeLength,
      breadth: safeBreadth,
      height: safeHeight,
    };

    try {
      response = await axios.get(SHIPROCKET_SERVICEABILITY_URL, {
        params: serviceabilityParams,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20000,
      });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        cachedToken = null;
        cachedTokenAt = 0;
        token = await getShiprocketToken();
        response = await axios.get(SHIPROCKET_SERVICEABILITY_URL, {
          params: serviceabilityParams,
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000,
        });
      } else {
        throw error;
      }
    }

    const availableCouriers =
      response?.data?.data?.available_courier_companies || [];

    if (!availableCouriers.length) {
      return sendResponse(200, {
        serviceable: false,
        isWestBengal,
        isFreeShipping: false,
        freeShippingThreshold,
        options: {},
        message: "This PIN code is currently not serviceable.",
      });
    }

    const surfaceCouriers = availableCouriers.filter(
      (courier) => courier?.is_surface === true
    );
    const airCouriers = availableCouriers.filter(
      (courier) => courier?.is_surface === false
    );

    const sortedSurfaceCouriers = [...surfaceCouriers].sort(
      (a, b) => toNumber(a?.rate) - toNumber(b?.rate)
    );
    const standardCourier = sortedSurfaceCouriers[0] || null;

    const sortedAirCouriers = [...airCouriers].sort((a, b) => {
      const etaA = getCourierEtaHours(a);
      const etaB = getCourierEtaHours(b);
      if (etaA !== null && etaB === null) return -1;
      if (etaA === null && etaB !== null) return 1;
      if (etaA !== null && etaB !== null && etaA !== etaB) return etaA - etaB;
      return toNumber(a?.rate) - toNumber(b?.rate);
    });

    let expressCourier = null;
    const fastestAirCourier = sortedAirCouriers[0] || null;

    if (fastestAirCourier && standardCourier) {
      if (isCourierFaster(fastestAirCourier, standardCourier)) {
        expressCourier = fastestAirCourier;
      }
    } else if (fastestAirCourier && !standardCourier) {
      expressCourier = fastestAirCourier;
    }

    const isFreeShipping =
      Boolean(standardCourier) && safeSubtotal >= freeShippingThreshold;

    const options = {};
    let standardRawRate = null;

    if (standardCourier) {
      standardRawRate = toNumber(standardCourier.rate, 0);
      const standardRate = isFreeShipping ? 0 : roundUpRate(standardRawRate);

      options.standard = {
        id: standardCourier.courier_company_id || "standard",
        label: "Standard",
        courierName: standardCourier.courier_name || "Standard Delivery",
        courierCompanyId: standardCourier.courier_company_id || null,
        rate: standardRate,
        rawRate: standardRawRate,
        deliveryTime: buildDeliveryTime(standardCourier, 3, 5),
        isSurface: standardCourier.is_surface === true,
        isAir: standardCourier.is_surface === false,
        isFallbackAir: false,
      };
    }

    if (expressCourier) {
      const expressRawRate = toNumber(expressCourier.rate, 0);
      let expressRate;

      if (standardCourier && isFreeShipping) {
        expressRate = Math.max(
          21,
          roundUpRate(expressRawRate - toNumber(standardRawRate, 0))
        );
      } else {
        expressRate = roundUpRate(expressRawRate);
      }

      options.express = {
        id: expressCourier.courier_company_id || "express",
        label: "Express",
        courierName: expressCourier.courier_name || "Express Delivery",
        courierCompanyId: expressCourier.courier_company_id || null,
        rate: expressRate,
        rawRate: expressRawRate,
        deliveryTime: buildDeliveryTime(expressCourier, 1, 3),
        isSurface: expressCourier.is_surface === true,
        isAir: expressCourier.is_surface === false,
        isFallbackAir: false,
      };
    }

    const serviceable = Boolean(options.standard || options.express);

    if (!serviceable) {
      return sendResponse(200, {
        serviceable: false,
        isWestBengal,
        isFreeShipping: false,
        freeShippingThreshold,
        options: {},
        message: "This PIN code is currently not serviceable.",
      });
    }

    return sendResponse(200, {
      serviceable: true,
      isWestBengal,
      isFreeShipping,
      freeShippingThreshold,
      options,
    });
  } catch (error) {
    console.error(
      "Shiprocket shipping-rate error:",
      error?.response?.data || error?.message || error
    );

    return sendResponse(500, {
      serviceable: false,
      isFreeShipping: false,
      options: {},
      message:
        "We couldn't check shipping availability right now. Please try again.",
    });
  }
}