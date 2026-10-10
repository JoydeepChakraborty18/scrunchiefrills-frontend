/**
 * 📊 SCRUNCHIEFRILLS™ MASTER PRICING ENGINE
 * Pure mathematical calculation engine.
 * Shipping is decoupled from the cart and handled strictly on the Checkout page.
 */

const BASE_MRP_XXL = 315;
const ACTIVE_LAUNCH_PRICE_XXL = 249;

export const PRICE_TABLE = {
  XXL: ACTIVE_LAUNCH_PRICE_XXL,
  cloud: ACTIVE_LAUNCH_PRICE_XXL,
  "cloud (xxl)": ACTIVE_LAUNCH_PRICE_XXL,
  "xxl cloud": ACTIVE_LAUNCH_PRICE_XXL,
};

export const MRP_TABLE = {
  XXL: BASE_MRP_XXL,
  cloud: BASE_MRP_XXL,
  "cloud (xxl)": BASE_MRP_XXL,
  "xxl cloud": BASE_MRP_XXL,
};

export const REWARD_TIERS = [];

export const CONFIG = {
  MIN_ORDER_VALUE: 499, // Minimum store checkout threshold
  WB_FREE_SHIPPING_THRESHOLD: 999, // Free shipping for West Bengal
  INTERSTATE_FREE_SHIPPING_THRESHOLD: 1999, // Free shipping for Rest of India
};

/**
 * 🎛️ Evaluates raw subtotal and launch MRP savings without guessing courier rates.
 */
export const calculateCartMetrics = (cartItems = []) => {
  const safeItems = Array.isArray(cartItems) ? cartItems : [];

  let totalScrunchies = 0;
  let subtotal = 0;

  for (const item of safeItems) {
    const rawSize = (item.sizeTier || item.size || "cloud").trim().toLowerCase();
    const resolvedPrice = Number(item.price || PRICE_TABLE[rawSize] || ACTIVE_LAUNCH_PRICE_XXL);
    const qty = Math.max(1, Number(item.quantity) || 1);

    totalScrunchies += qty;
    subtotal += resolvedPrice * qty;
  }

  // 👑 Evaluate Launch Offer Savings (Compare-at MRP vs Active Price)
  const estimatedBundleSavings = safeItems.reduce((acc, item) => {
    const rawSize = (item.sizeTier || item.size || "cloud").trim().toLowerCase();
    const effectiveMRP = Number(item.compareAtPrice || MRP_TABLE[rawSize] || item.price || BASE_MRP_XXL);
    const effectivePrice = Number(item.price || PRICE_TABLE[rawSize] || ACTIVE_LAUNCH_PRICE_XXL);

    if (effectiveMRP > effectivePrice) {
      return acc + (effectiveMRP - effectivePrice) * (Number(item.quantity) || 1);
    }
    return acc;
  }, 0);

  const isCheckoutDisabled = subtotal < CONFIG.MIN_ORDER_VALUE || totalScrunchies < 3 || totalScrunchies % 3 !== 0;

  return {
    subtotal,
    totalScrunchies,
    currentTier: null,
    nextTier: null,
    rewardDiscountAmount: 0,
    estimatedBundleSavings: Math.round(estimatedBundleSavings),
    shippingCharge: 0, // Deferred to Checkout after PIN entry
    shippingSavings: 0,
    finalTotal: subtotal, // In cart, displays subtotal
    totalSavedInVault: Math.round(estimatedBundleSavings),
    isCheckoutDisabled,
    scrunchiesNeededForNext: 0,
    shippingNeededAmount: 0,
  };
};