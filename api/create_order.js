import Razorpay from "razorpay";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        error: "Malformed request body.",
      });
    }
  }

  const {
    amount,
    notes = {},
  } = body || {};

  // Enterprise Guard 1: Validate numeric value
  const parsedAmount = Number(amount);

  if (
    isNaN(parsedAmount) ||
    parsedAmount <= 0
  ) {
    return res.status(400).json({
      error:
        "Valid numeric order amount is required.",
    });
  }

  // Enterprise Guard 2: Enforce Scrunchiefrills ₹499 minimum floor
  if (parsedAmount < 499) {
    return res.status(400).json({
      error:
        "Minimum order value is ₹499 as per Scrunchiefrills store policy.",
    });
  }

  // Enterprise Guard 3: Environment keys
  const key_id =
    process.env.RAZORPAY_KEY_ID;

  const key_secret =
    process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error(
      "Razorpay environment variables missing on server."
    );

    return res.status(500).json({
      error:
        "Payment gateway credentials are not configured in the server environment.",
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: key_id.trim(),
      key_secret: key_secret.trim(),
    });

    // Razorpay requires amounts in paise
    // ₹1 = 100 paise
    const amountInPaise = Math.round(
      parsedAmount * 100
    );

    const orderPayload = {
      amount: amountInPaise,

      currency: "INR",

      receipt:
        `SF_${Date.now()}_${Math.random()
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

    const order =
      await razorpay.orders.create(
        orderPayload
      );

    /*
     * IMPORTANT:
     * Return ONLY the public Razorpay Key ID
     * to the frontend.
     *
     * NEVER return RAZORPAY_KEY_SECRET.
     */
    return res.status(200).json({
      id: order.id,

      amount: order.amount,

      currency: order.currency,

      receipt: order.receipt,

      status: order.status,

      key_id: key_id.trim(),
    });
  } catch (error) {
    console.error(
      "Razorpay Order Creation Failure:",
      error?.error ||
        error.message
    );

    return res.status(502).json({
      error:
        error?.error?.description ||
        error.message ||
        "Failed to initialize Razorpay order token.",
    });
  }
}