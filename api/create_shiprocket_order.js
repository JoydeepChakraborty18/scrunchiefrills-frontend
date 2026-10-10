import axios from "axios";
import path from "path";
import dotenv from "dotenv";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Load environment variables locally
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 🛡️ Pre-launch audit guard
const IS_PRODUCTION_LIVE = process.env.STORE_LIVE_STATUS === "TRUE";

function getFormattedPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key || typeof key !== "string") return undefined;
  let formattedKey = key.trim();
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.slice(1, -1);
  }
  return formattedKey.replace(/\\n/g, "\n");
}

// 🛡️ Initialize Firebase Admin SDK using modern modular imports
let db = null;
try {
  if (!getApps().length) {
    const privateKey = getFormattedPrivateKey();
    const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").replace(/"/g, "").trim();
    const projectId = (process.env.FIREBASE_PROJECT_ID || "").replace(/"/g, "").trim();

    if (privateKey && clientEmail && projectId) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin successfully initialized in Shiprocket handler.");
    } else {
      console.warn("Firebase Admin credentials incomplete in environment. Initializing default app.");
      initializeApp();
    }
  }
  db = getFirestore();
} catch (error) {
  console.warn("Firebase Admin warning in Shiprocket handler:", error.message);
}

/**
 * 🕒 Shiprocket mandates exact "YYYY-MM-DD HH:mm" format.
 */
function formatShiprocketDate(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { 
    orderId, 
    customer = {}, 
    items = [], 
    pricing = {}, 
    packaging = {}, 
    courierName = "Delhivery Surface" 
  } = body || {};

  // 🛡️ SHIELD: Never create real Shiprocket consignments or schedule pickups during test mode / audit
  if (!IS_PRODUCTION_LIVE) {
    console.log("🛡️ Audit Mode Active: Bypassing Shiprocket dispatch.");
    return res.status(200).json({
      success: true,
      message: "Order recorded in audit mode. Shiprocket dispatch bypassed.",
    });
  }

  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      console.warn("Shiprocket credentials not configured in environment. Skipping dispatch.");
      return res.status(200).json({ success: true, message: "Skipped: Shiprocket credentials not set." });
    }

    // 1. Authenticate with Shiprocket API
    const authRes = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email: email.trim(),
      password: password.trim(),
    });

    const token = authRes.data.token;
    if (!token) {
      throw new Error("Shiprocket authentication failed: No bearer token returned.");
    }

    // 2. Format items safely for Shiprocket
    const safeItems = Array.isArray(items) ? items : [];
    const orderItems = safeItems.length > 0 
      ? safeItems.map((item) => ({
          name: item.name || "Scrunchie",
          sku: item.sku || item.id || "SKU-DEFAULT",
          units: Number(item.quantity || 1),
          selling_price: Number(item.price || 249),
          discount: 0,
          tax: 0,
        }))
      : [{
          name: "Scrunchie Assorted",
          sku: "SF-SCRUNCHIE-SET",
          units: 1,
          selling_price: Number(pricing.finalOrderValue || 846),
          discount: 0,
          tax: 0,
        }];

    // 3. Build Adhoc Order Payload
    const cleanCustomerPin = String(customer.pinCode || "700001").replace(/\D/g, "");
    const cleanCustomerPhone = String(customer.phone || "9999999999").replace(/\D/g, "");

    // Must match the exact nickname in Shiprocket panel: "Warehouse"
    const pickupLocationNickname = (
      process.env.SHIPROCKET_PICKUP_LOCATION_NAME || "Warehouse"
    ).trim();

    const payload = {
      order_id: String(orderId),
      order_date: formatShiprocketDate(),
      pickup_location: pickupLocationNickname,
      billing_customer_name: customer.name || "Valued Customer",
      billing_last_name: "",
      billing_address: customer.shippingAddress || "India",
      billing_city: customer.city || "Kolkata",
      billing_pincode: cleanCustomerPin,
      billing_state: customer.state || "West Bengal",
      billing_country: "India",
      billing_email: customer.email || "order@scrunchiefrills.com",
      billing_phone: cleanCustomerPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: "Prepaid",
      sub_total: Number(pricing.finalOrderValue || 0),
      length: Math.max(1, Number(packaging.length || 12.7)),
      breadth: Math.max(1, Number(packaging.breadth || 12.7)),
      height: Math.max(1, Number(packaging.height || 12.7)),
      weight: Math.max(0.1, Number(packaging.weight || 0.45)),
    };

    console.log("Submitting order to Shiprocket payload:", JSON.stringify(payload, null, 2));

    const shiprocketRes = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      }
    );

    console.log("Shiprocket Order Creation Response:", JSON.stringify(shiprocketRes.data, null, 2));

    const sId = shiprocketRes.data?.order_id || shiprocketRes.data?.shipment_id || shiprocketRes.data?.id;

    // 4. Update Firestore orders document safely
    if (db && orderId && sId) {
      try {
        await db.collection("orders").doc(orderId).update({
          shiprocketOrderId: String(sId),
          shipmentId: String(shiprocketRes.data?.shipment_id || sId),
          orderStatus: "PROCESSING",
          courierPartner: courierName,
        });
        console.log(`✅ Firestore updated with Shiprocket order ID: ${sId}`);
      } catch (dbErr) {
        console.warn("Could not update order in Firestore:", dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      shiprocketOrderId: shiprocketRes.data?.order_id,
      shipmentId: shiprocketRes.data?.shipment_id,
    });
  } catch (error) {
    const errorData = error?.response?.data || error.message;
    console.error("Shiprocket Order Creation Error:", JSON.stringify(errorData, null, 2));
    return res.status(200).json({ 
      success: false, 
      warning: "Order recorded in Firestore, Shiprocket dispatch pending.",
      details: errorData
    });
  }
}