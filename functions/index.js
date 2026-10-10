const functions = require("firebase-functions");
const Razorpay = require("razorpay");

// 💳 Initialize Razorpay with your Test Keys
const razorpay = new Razorpay({
  key_id: "rzp_test_SjjpqpRxg9RFnR", // ✅ Your Razorpay Test Key ID
  key_secret: "Tf6jla37AQNTY7L4l1veqCEz", // ✅ Your Razorpay Test Key Secret
});

/**
 * 🔥 createRazorpayOrder
 * This function is called by your Cart.jsx to generate a secure Order ID.
 */
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Security check: Ensure the user is logged in[cite: 11]
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated", 
      "You must be logged in to place an order. 💖"
    );
  }

  const options = {
    amount: Math.round(data.amount * 100), // Convert ₹ to Paisa (Razorpay requirement)
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    throw new functions.https.HttpsError("internal", "Failed to create Razorpay order.");
  }
});