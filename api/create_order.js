import Razorpay from "razorpay";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export default async function handler(reqOrEvent, resOrContext) {
  // 1. Universal Environment Detection (Netlify v2 vs Express / Vercel / Local)
  const isExpress = typeof resOrContext?.status === "function";
  const isWebStandard = typeof Response !== "undefined";

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const sendResponse = (statusCode, payload) => {
    // A. Express / Vercel / Local dev
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
      error: "Method Not Allowed",
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

  const { amount, notes = {} } = body || {};

  // Enterprise Guard 1: Validate numeric value
  const parsedAmount = Number(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return sendResponse(400, {
      error: "Valid numeric order amount is required.",
    });
  }

  // Enterprise Guard 2: Enforce Scrunchiefrills ₹499 minimum floor
  if (parsedAmount < 499) {
    return sendResponse(400, {
      error: "Minimum order value is ₹499 as per Scrunchiefrills store policy.",
    });
  }

  // Enterprise Guard 3: Environment keys with robust sanitization
  const rawKeyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.VITE_RAZORPAY_KEY_ID ||
    process.env.REACT_APP_RAZORPAY_KEY_ID;

  const rawKeySecret =
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.VITE_RAZORPAY_KEY_SECRET ||
    process.env.REACT_APP_RAZORPAY_KEY_SECRET;

  const key_id = rawKeyId ? rawKeyId.replace(/["'\s]/g, "").trim() : "";
  const key_secret = rawKeySecret ? rawKeySecret.replace(/["'\s]/g, "").trim() : "";

  if (!key_id || !key_secret) {
    console.error("Razorpay environment variables missing on server.");
    return sendResponse(500, {
      error: "Payment gateway credentials are not configured in the server environment.",
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // Razorpay requires amounts in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(parsedAmount * 100);

    const orderPayload = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `SF_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`
        .toUpperCase()
        .slice(0, 40),
      notes: {
        store: "Scrunchiefrills",
        platform: "Web",
        ...notes,
      },
    };

    const order = await razorpay.orders.create(orderPayload);

    return sendResponse(200, {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      key_id,
    });
  } catch (error) {
    console.error(
      "Razorpay Order Creation Failure:",
      error?.error || error.message
    );

    return sendResponse(502, {
      error:
        error?.error?.description ||
        error.message ||
        "Failed to initialize Razorpay order token.",
    });
  }
}