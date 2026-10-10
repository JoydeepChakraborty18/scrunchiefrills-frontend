import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

let db = null;
try {
  if (!getApps().length) {
    const privateKey = getFormattedPrivateKey();
    const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").replace(/"/g, "").trim();
    const projectId = (process.env.FIREBASE_PROJECT_ID || "").replace(/"/g, "").trim();

    if (privateKey && clientEmail && projectId) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } else {
      initializeApp();
    }
  }
  db = getFirestore();
} catch (error) {
  console.warn("Firebase Admin Initialization Notice:", error.message);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON format." });
    }
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customer = {},
    items = [],
    pricing = {},
  } = body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing Razorpay verification parameters (order_id, payment_id, or signature)." 
    });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("RAZORPAY_KEY_SECRET missing in server environment.");
    return res.status(500).json({ success: false, error: "Server authentication error." });
  }

  try {
    // 🛡️️ 1. Cryptographic Signature Verification (Timing-Safe)
    const hmac = crypto.createHmac("sha256", secret.trim());
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    const expectedBuffer = Buffer.from(generatedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.error(`🚨 Payment Signature Tampering Attempt! Order: ${razorpay_order_id}`);
      return res.status(400).json({ 
        success: false, 
        error: "Invalid payment signature. Transaction verification failed." 
      });
    }

    const orderDocId = `SF-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 🛡️ 2. Prevent Replay Attacks
    if (db) {
      const existingQuery = await db.collection("orders")
        .where("razorpayPaymentId", "==", razorpay_payment_id)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        const existingDoc = existingQuery.docs[0];
        return res.status(200).json({
          success: true,
          orderId: existingDoc.id,
          message: "Order already verified and recorded.",
        });
      }

      const now = FieldValue.serverTimestamp();
      const batch = db.batch();

      // 🛡️ 3. Atomic Database Commit: orders/{orderId}
      const normalizedOrderRecord = {
        orderId: orderDocId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "PAID",
        paymentMethod: "Razorpay (UPI / Netbanking / Cards)",
        customer: {
          uid: customer.uid || "guest",
          name: customer.name || "Customer",
          email: customer.email || "",
          phone: customer.phone || "",
          shippingAddress: customer.shippingAddress || "",
          city: customer.city || "",
          state: customer.state || "",
          pinCode: customer.pinCode || "",
          sameAsBilling: customer.sameAsBilling ?? true,
          billingAddress: customer.billingAddress || customer.shippingAddress || "",
          billingCity: customer.billingCity || customer.city || "",
          billingState: customer.billingState || customer.state || "",
          billingPinCode: customer.billingPinCode || customer.pinCode || "",
        },
        items: Array.isArray(items) ? items.map((it) => ({
          id: it.id || "",
          name: it.name || "Scrunchie",
          sku: it.sku || it.id || "SF-SKU",
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
          image: it.image || "",
        })) : [],
        pricing: {
          subtotal: Number(pricing.subtotal || 0),
          discountAmount: Number(pricing.discountAmount || 0),
          discountCode: pricing.discountCode || null,
          shippingCharge: Number(pricing.shippingCharge || 0),
          finalOrderValue: Number(pricing.finalOrderValue || 0),
        },
        orderStatus: "CONFIRMED",
        fulfillmentStatus: "UNFULFILLED",
        orderDateTime: now,
        createdAt: now,
      };

      const orderRef = db.collection("orders").doc(orderDocId);
      batch.set(orderRef, normalizedOrderRecord);

      // 👤 4. Atomic Database Commit: customers/{uid}
      const customerUid = customer.uid;
      if (customerUid && !customerUid.startsWith("guest")) {
        const customerRef = db.collection("customers").doc(customerUid);
        batch.set(
          customerRef,
          {
            uid: customerUid,
            customerName: customer.name || "Customer",
            email: customer.email || "",
            phone: customer.phone || "",
            shippingAddress: customer.shippingAddress || "",
            city: customer.city || "",
            state: customer.state || "",
            pinCode: customer.pinCode || "",
            billingAddress: customer.billingAddress || customer.shippingAddress || "",
            billingCity: customer.billingCity || customer.city || "",
            billingState: customer.billingState || customer.state || "",
            billingPinCode: customer.billingPinCode || customer.pinCode || "",
            totalOrders: FieldValue.increment(1),
            totalSpent: FieldValue.increment(Number(pricing.finalOrderValue || 0)),
            lastOrderDate: now,
            updatedAt: now,
          },
          { merge: true }
        );
      }

      // 📦 5. Atomic Stock Decrement: products/{productId}
      if (IS_PRODUCTION_LIVE) {
        if (Array.isArray(items)) {
          for (const item of items) {
            const qty = Math.max(1, Number(item.quantity) || 1);
            let targetProductRef = null;

            if (item.id) {
              const directDoc = await db.collection("products").doc(item.id).get();
              if (directDoc.exists) {
                targetProductRef = directDoc.ref;
              }
            }

            if (!targetProductRef && item.sku) {
              const skuQuery = await db.collection("products").where("sku", "==", item.sku).limit(1).get();
              if (!skuQuery.empty) {
                targetProductRef = skuQuery.docs[0].ref;
              }
            }

            if (targetProductRef) {
              batch.update(targetProductRef, {
                stockCount: FieldValue.increment(-qty),
                updatedAt: now,
              });
            }
          }
        }
      } else {
        console.log("🛡️ Audit Mode: Inventory decrement skipped.");
      }

      // Execute all document updates together atomically
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      orderId: orderDocId,
      message: "Payment verified and recorded successfully.",
    });
  } catch (err) {
    console.error("Verification Handler Error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error during payment verification.",
    });
  }
}