import axios from "axios";
import path from "path";
import dotenv from "dotenv";

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

  return Number.isFinite(number)
    ? number
    : fallback;
}

function roundUpRate(value) {
  return Math.ceil(toNumber(value, 0));
}

/**
 * Convert Shiprocket's ETA information into a
 * customer-facing delivery estimate.
 *
 * Priority:
 * 1. etd_hours
 * 2. estimated_delivery_days
 * 3. safe fallback
 *
 * We deliberately do not add arbitrary extra days
 * to Shiprocket's ETA.
 */
function buildDeliveryTime(
  courier,
  fallbackMinDays,
  fallbackMaxDays
) {
  const courierName =
    courier?.courier_name || "Courier";

  const etdHours = toNumber(
    courier?.etd_hours,
    0
  );

  if (etdHours > 0) {
    const estimatedDays = Math.max(
      1,
      Math.ceil(etdHours / 24)
    );

    return `Estimated ${estimatedDays} day${
      estimatedDays === 1 ? "" : "s"
    } (${courierName})`;
  }

  const estimatedDeliveryDays = toNumber(
    courier?.estimated_delivery_days,
    0
  );

  if (estimatedDeliveryDays > 0) {
    const estimatedDays = Math.max(
      1,
      Math.ceil(estimatedDeliveryDays)
    );

    return `Estimated ${estimatedDays} day${
      estimatedDays === 1 ? "" : "s"
    } (${courierName})`;
  }

  return `Estimated ${fallbackMinDays}–${fallbackMaxDays} days (${courierName})`;
}

/**
 * Returns the best numeric ETA available from
 * Shiprocket.
 *
 * Lower is faster.
 *
 * etd_hours is preferred because it is more precise.
 */
function getCourierEtaHours(courier) {
  const etdHours = toNumber(
    courier?.etd_hours,
    0
  );

  if (etdHours > 0) {
    return etdHours;
  }

  const estimatedDays = toNumber(
    courier?.estimated_delivery_days,
    0
  );

  if (estimatedDays > 0) {
    return estimatedDays * 24;
  }

  return null;
}

/**
 * Compare two courier ETAs.
 *
 * Returns true only when courierA is actually faster
 * than courierB and both have usable ETA information.
 */
function isCourierFaster(courierA, courierB) {
  const etaA = getCourierEtaHours(courierA);
  const etaB = getCourierEtaHours(courierB);

  if (
    etaA === null ||
    etaB === null
  ) {
    return false;
  }

  return etaA < etaB;
}

/* -------------------------------------------------------
   Shiprocket Authentication
------------------------------------------------------- */

async function getShiprocketToken() {
  const now = Date.now();

  if (
    cachedToken &&
    now - cachedTokenAt <
      TOKEN_CACHE_DURATION_MS
  ) {
    return cachedToken;
  }

  const email =
    process.env.SHIPROCKET_EMAIL;

  const password =
    process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Shiprocket credentials are missing. Please check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD."
    );
  }

  const response = await axios.post(
    SHIPROCKET_AUTH_URL,
    {
      email,
      password,
    },
    {
      timeout: 15000,
    }
  );

  const token =
    response?.data?.token;

  if (!token) {
    throw new Error(
      "Shiprocket authentication succeeded but no token was returned."
    );
  }

  cachedToken = token;
  cachedTokenAt = now;

  return token;
}

/* -------------------------------------------------------
   API Handler
------------------------------------------------------- */

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      serviceable: false,
      message: "Method not allowed.",
    });
  }

  try {
    const {
      deliveryPinCode,
      weight,
      length,
      breadth,
      height,
      subtotal,
    } = req.body || {};

    const cleanDeliveryPinCode =
      String(deliveryPinCode || "")
        .replace(/\D/g, "");

    if (
      !/^\d{6}$/.test(
        cleanDeliveryPinCode
      )
    ) {
      return res.status(400).json({
        serviceable: false,
        message:
          "Please enter a valid 6-digit PIN code.",
      });
    }

    const safeWeight = Math.max(
      0.1,
      toNumber(weight, 0.2)
    );

    const safeLength = Math.max(
      1,
      toNumber(length, 20)
    );

    const safeBreadth = Math.max(
      1,
      toNumber(breadth, 15)
    );

    const safeHeight = Math.max(
      1,
      toNumber(height, 3)
    );

    const safeSubtotal = Math.max(
      0,
      toNumber(subtotal, 0)
    );

    const pickupPinCode =
      DEFAULT_PICKUP_PIN;

    /* ---------------------------------------------------
       West Bengal detection
    --------------------------------------------------- */

    const isWestBengal = [
      "70",
      "71",
      "72",
      "73",
      "74",
    ].some((prefix) =>
      cleanDeliveryPinCode.startsWith(
        prefix
      )
    );

    const freeShippingThreshold =
      isWestBengal
        ? 999
        : 1999;

    /* ---------------------------------------------------
       Shiprocket Serviceability Request
    --------------------------------------------------- */

    let token =
      await getShiprocketToken();

    let response;

    try {
      response = await axios.get(
        SHIPROCKET_SERVICEABILITY_URL,
        {
          params: {
            pickup_postcode:
              pickupPinCode,

            delivery_postcode:
              cleanDeliveryPinCode,

            weight: safeWeight,

            cod: 0,

            length: safeLength,

            breadth: safeBreadth,

            height: safeHeight,
          },

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          timeout: 20000,
        }
      );
    } catch (error) {
      /*
       * If Shiprocket rejects the token,
       * clear the cache and retry once.
       */
      const status =
        error?.response?.status;

      if (
        status === 401 ||
        status === 403
      ) {
        cachedToken = null;
        cachedTokenAt = 0;

        token =
          await getShiprocketToken();

        response = await axios.get(
          SHIPROCKET_SERVICEABILITY_URL,
          {
            params: {
              pickup_postcode:
                pickupPinCode,

              delivery_postcode:
                cleanDeliveryPinCode,

              weight: safeWeight,

              cod: 0,

              length: safeLength,

              breadth: safeBreadth,

              height: safeHeight,
            },

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            timeout: 20000,
          }
        );
      } else {
        throw error;
      }
    }

    const availableCouriers =
      response?.data
        ?.data
        ?.available_courier_companies ||
      [];

    /* ---------------------------------------------------
       Debug logging
    --------------------------------------------------- */

    console.log(
      "\n========== SHIPROCKET SERVICEABILITY =========="
    );

    console.log(
      "HTTP Status:",
      response?.status
    );

    console.log(
      "Request:",
      JSON.stringify(
        {
          pickup_postcode:
            pickupPinCode,

          delivery_postcode:
            cleanDeliveryPinCode,

          weight: safeWeight,

          cod: 0,

          length: safeLength,

          breadth: safeBreadth,

          height: safeHeight,
        },
        null,
        2
      )
    );

    console.log(
      "Courier Count:",
      availableCouriers.length
    );

    console.log(
      "Couriers:",
      JSON.stringify(
        availableCouriers.map(
          (courier) => ({
            courier_name:
              courier?.courier_name,

            courier_company_id:
              courier?.courier_company_id,

            rate:
              courier?.rate,

            etd_hours:
              courier?.etd_hours,

            estimated_delivery_days:
              courier
                ?.estimated_delivery_days,

            is_surface:
              courier?.is_surface,
          })
        ),
        null,
        2
      )
    );

    console.log(
      "================================================"
    );

    /* ---------------------------------------------------
       No couriers
    --------------------------------------------------- */

    if (!availableCouriers.length) {
      return res.status(200).json({
        serviceable: false,

        isWestBengal,

        isFreeShipping: false,

        freeShippingThreshold,

        options: {},

        message:
          "This PIN code is currently not serviceable.",
      });
    }

    /* ---------------------------------------------------
       Separate Surface and Air couriers
    --------------------------------------------------- */

    const surfaceCouriers =
      availableCouriers.filter(
        (courier) =>
          courier?.is_surface === true
      );

    const airCouriers =
      availableCouriers.filter(
        (courier) =>
          courier?.is_surface === false
      );

    /* ---------------------------------------------------
       STANDARD
       
       Standard means:
       - Surface only
       - Cheapest available Surface courier
       
       We NEVER use Air as a Standard fallback.
       --------------------------------------------------- */

    const sortedSurfaceCouriers = [
      ...surfaceCouriers,
    ].sort(
      (a, b) =>
        toNumber(a?.rate) -
        toNumber(b?.rate)
    );

    const standardCourier =
      sortedSurfaceCouriers[0] ||
      null;

    /* ---------------------------------------------------
       AIR COURIERS
       
       We sort Air couriers by ETA first because
       Express is speed-based.
       
       If multiple Air couriers have the same ETA,
       the cheaper one wins.
       --------------------------------------------------- */

    const sortedAirCouriers = [
      ...airCouriers,
    ].sort((a, b) => {
      const etaA =
        getCourierEtaHours(a);

      const etaB =
        getCourierEtaHours(b);

      /*
       * Couriers with a known ETA are preferred
       * over couriers without ETA information.
       */
      if (
        etaA !== null &&
        etaB === null
      ) {
        return -1;
      }

      if (
        etaA === null &&
        etaB !== null
      ) {
        return 1;
      }

      if (
        etaA !== null &&
        etaB !== null &&
        etaA !== etaB
      ) {
        return etaA - etaB;
      }

      /*
       * Same ETA -> cheapest Air courier.
       */
      return (
        toNumber(a?.rate) -
        toNumber(b?.rate)
      );
    });

    /* ---------------------------------------------------
       Determine Express courier
       
       Rules:
       
       1. If Standard exists:
          - Find fastest Air courier.
          - Show Express ONLY if Air is genuinely
            faster than Standard.
       
       2. If Standard does not exist:
          - Air-only destination.
          - Fastest Air becomes Express.
       
       This prevents an Air courier with the SAME
       ETA as Surface from being misleadingly called
       "Express".
       --------------------------------------------------- */

    let expressCourier = null;

    const fastestAirCourier =
      sortedAirCouriers[0] ||
      null;

    if (
      fastestAirCourier &&
      standardCourier
    ) {
      if (
        isCourierFaster(
          fastestAirCourier,
          standardCourier
        )
      ) {
        expressCourier =
          fastestAirCourier;
      }
    } else if (
      fastestAirCourier &&
      !standardCourier
    ) {
      /*
       * Express-only destination.
       *
       * Since no Surface courier exists, the fastest
       * available Air courier becomes Express.
       */
      expressCourier =
        fastestAirCourier;
    }

    /* ---------------------------------------------------
       Free Standard Shipping
       
       Free shipping ONLY exists when:
       - Standard actually exists
       - Subtotal reaches threshold
       --------------------------------------------------- */

    const isFreeShipping =
      Boolean(standardCourier) &&
      safeSubtotal >=
        freeShippingThreshold;

    const options = {};

    /* ---------------------------------------------------
       STANDARD OPTION
    --------------------------------------------------- */

    let standardRawRate = null;

    if (standardCourier) {
      standardRawRate =
        toNumber(
          standardCourier.rate,
          0
        );

      const standardRate =
        isFreeShipping
          ? 0
          : roundUpRate(
              standardRawRate
            );

      options.standard = {
        id:
          standardCourier
            .courier_company_id ||
          "standard",

        label: "Standard",

        courierName:
          standardCourier
            .courier_name ||
          "Standard Delivery",

        courierCompanyId:
          standardCourier
            .courier_company_id ||
          null,

        rate: standardRate,

        rawRate:
          standardRawRate,

        deliveryTime:
          buildDeliveryTime(
            standardCourier,
            3,
            5
          ),

        isSurface:
          standardCourier
            .is_surface === true,

        isAir:
          standardCourier
            .is_surface === false,

        isFallbackAir: false,
      };
    }

    /* ---------------------------------------------------
       EXPRESS OPTION
    --------------------------------------------------- */

    if (expressCourier) {
      const expressRawRate =
        toNumber(
          expressCourier.rate,
          0
        );

      let expressRate;

      if (
        standardCourier &&
        isFreeShipping
      ) {
        /*
         * Standard is free.
         *
         * Express becomes a paid upgrade.
         *
         * We charge the Air rate minus the original
         * Standard rate, with a minimum ₹21 upgrade.
         */
        expressRate =
          Math.max(
            21,
            roundUpRate(
              expressRawRate -
                toNumber(
                  standardRawRate,
                  0
                )
            )
          );
      } else {
        /*
         * Normal paid shipping OR Express-only
         * destination.
         *
         * Express-only destinations pay the full
         * Shiprocket Air rate.
         */
        expressRate =
          roundUpRate(
            expressRawRate
          );
      }

      options.express = {
        id:
          expressCourier
            .courier_company_id ||
          "express",

        label: "Express",

        courierName:
          expressCourier
            .courier_name ||
          "Express Delivery",

        courierCompanyId:
          expressCourier
            .courier_company_id ||
          null,

        rate: expressRate,

        rawRate:
          expressRawRate,

        deliveryTime:
          buildDeliveryTime(
            expressCourier,
            1,
            3
          ),

        isSurface:
          expressCourier
            .is_surface === true,

        isAir:
          expressCourier
            .is_surface === false,

        isFallbackAir: false,
      };
    }

    /* ---------------------------------------------------
       SERVICEABILITY
       
       Serviceable means at least one legitimate
       shipping option exists.
       
       Possible outcomes:
       
       Surface + faster Air
         -> Standard + Express
       
       Surface + Air same/slower
         -> Standard only
       
       Surface only
         -> Standard only
       
       Air only
         -> Express only
       
       Neither
         -> Unserviceable
       --------------------------------------------------- */

    const serviceable =
      Boolean(
        options.standard ||
        options.express
      );

    if (!serviceable) {
      return res.status(200).json({
        serviceable: false,

        isWestBengal,

        isFreeShipping: false,

        freeShippingThreshold,

        options: {},

        message:
          "This PIN code is currently not serviceable.",
      });
    }

    /* ---------------------------------------------------
       Additional debug information
       
       These fields are useful during development and
       do not affect Checkout's existing logic.
       --------------------------------------------------- */

    console.log(
      "Selected Standard:",
      standardCourier
        ? {
            courier:
              standardCourier.courier_name,

            rate:
              standardCourier.rate,

            etaHours:
              getCourierEtaHours(
                standardCourier
              ),
          }
        : null
    );

    console.log(
      "Selected Express:",
      expressCourier
        ? {
            courier:
              expressCourier.courier_name,

            rate:
              expressCourier.rate,

            etaHours:
              getCourierEtaHours(
                expressCourier
              ),
          }
        : null
    );

    /* ---------------------------------------------------
       Final response
    --------------------------------------------------- */

    return res.status(200).json({
      serviceable: true,

      isWestBengal,

      isFreeShipping,

      freeShippingThreshold,

      options,
    });
  } catch (error) {
    console.error(
      "Shiprocket shipping-rate error:",
      error?.response?.data ||
        error?.message ||
        error
    );

    const status =
      error?.response?.status ||
      500;

    return res.status(
      status >= 400
        ? status
        : 500
    ).json({
      serviceable: false,

      isFreeShipping: false,

      options: {},

      message:
        "We couldn't check shipping availability right now. Please try again.",
    });
  }
}