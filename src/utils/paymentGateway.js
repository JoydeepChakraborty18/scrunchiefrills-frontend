/**
 * 📦 MODULAR ROUTING SWITCH CONSOLE
 * Abstracts integrations into simple decoupled functions.
 */
export const PaymentGatewayRouter = {
  /**
   * 1. Razorpay Core SDK Bridge
   */
  async processRazorpay({ orderId, amount, currency = "INR", userProfile, onSuccess, onFailure }) {
    console.log(`Initializing Razorpay routing pipeline. Allocation: ₹${amount}`);
    
    const options = {
      key: "rzp_live_xxxxxxxxxxxxxx", // Ship live transaction tokens here
      amount: amount * 100, // Convert into subunits
      currency,
      name: "Scrunchiefrills™",
      description: `PREPAID ORDER FOR SECURING VAULT BOXES`,
      order_id: orderId,
      handler: function (response) {
        onSuccess({ gateway: "razorpay", transactionToken: response.razorpay_payment_id });
      },
      prefill: {
        name: userProfile?.name || "",
        email: userProfile?.email || "",
        contact: userProfile?.phone || ""
      },
      theme: { color: "#f02d8d" }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      onFailure({ error: "Razorpay script context missing or timed out", log: err });
    }
  },

  /**
   * 2. PhonePe Standard Checkout Pipeline API Redirect
   */
  async processPhonePe({ orderId, amount, userProfile, onSuccess, redirectCallback }) {
    console.log(`Routing transaction directly to PhonePe payment page environment API framework: ₹${amount}`);
    // Simulate server side token signature callback allocations
    const payload = {
      merchantId: "MERCHANT_ID_SHELL",
      transactionId: `TXN-${orderId}-${Date.now()}`,
      amount: amount * 100,
      redirectUrl: `https://scrunchiefrills.com/order-success?id=${orderId}`
    };
    
    if (redirectCallback) {
      redirectCallback(payload);
    }
  },

  /**
   * 3. Cashfree Custom Dropin Integration Engine
   */
  async processCashfree({ sessionSessionToken, orderId, onSuccess, onFailure }) {
    console.log(`Mounting Cashfree dropin payment components for Order profile link: ${orderId}`);
    try {
      const cashfree = window.Cashfree({ mode: "production" });
      await cashfree.initialiseDropin(document.getElementById("cashfree-anchor-root"), {
        paymentSessionId: sessionSessionToken,
        onSuccess: (cfData) => onSuccess({ gateway: "cashfree", rawData: cfData }),
        onFailure: (cfErr) => onFailure({ gateway: "cashfree", error: cfErr })
      });
    } catch (err) {
      onFailure({ error: "Cashfree context binding core script collision error", details: err });
    }
  }
};

/**
 * 🧪 RISK-FREE SANDBOX INTERFACE FOR DYNAMIC PRICING SYSTEM RUNS
 * Connects calculation contexts cleanly to Razorpay's Test Dashboard overlay layer.
 */
export const initializeRazorpayTestCheckout = (pricingData, userAuth, onSuccess, onFailure) => {
  console.log(`[SANDBOX INITIALIZED] Dispatching test gateway window for amount: ₹${pricingData.finalTotal}`);
  
  const options = {
    // 🔑 Replace this string parameter with your personal Public Key ID from Razorpay (e.g. rzp_test_...)
    key: "rzp_test_SjjpqpRxg9RFnR", 
    amount: Math.round(pricingData.finalTotal * 100), // Converts calculation outputs seamlessly into Indian Paisa
    currency: "INR",
    name: "Scrunchiefrills™",
    description: "Sandbox Environment Integration Testing Run",
    image: "/images/ScrunchiefrillsTMLogoLarge.png", 
    handler: function (response) {
      // Fires securely when a mock transaction passes sandbox criteria
      onSuccess({ status: "success", paymentId: response.razorpay_payment_id });
    },
    prefill: {
      name: userAuth?.displayName || "Joydeep Chakraborty",
      email: userAuth?.email || "customer@scrunchiefrills.com",
    },
    theme: {
      color: "#f02d8d", // Scrunchiefrills Hot Pink Accent Aesthetic
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Razorpay UI Canvas injection failed:", err);
    onFailure({ status: "failed", error: err });
  }
};