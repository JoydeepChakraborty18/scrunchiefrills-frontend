import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { calculateCartMetrics } from '../utils/pricingEngine';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';

const PricingContext = createContext(null);

export const PricingProvider = ({ children }) => {
  const { cart } = useCart();
  const [lastUnlockedTierId, setLastUnlockedTierId] = useState(null);
  const [triggerCelebration, setTriggerCelebration] = useState(null);

  // 🎀 Bundle Offer State (Pack of 3, 6, 9, 12)
  const [selectedBundle, setSelectedBundle] = useState(() => {
    try {
      const saved = localStorage.getItem("sf_selected_bundle");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 🌪️ Applied Cyclone Voucher (CYCLONE10 or CYCLONE20)
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem("sf_applied_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Base pricing engine metrics
  const baseMetrics = useMemo(() => {
    return calculateCartMetrics(cart);
  }, [cart]);

  // Total count of scrunchie items
  const totalScrunchies = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cart]);

  // Total MRP
  const totalMrp = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (Number(item.compareAtPrice) || 315) * (Number(item.quantity) || 0),
      0
    );
  }, [cart]);

  // Standard Launch subtotal (₹249 per unit)
  const launchSubtotal = baseMetrics.subtotal;
  const launchSavings = Math.max(0, totalMrp - launchSubtotal);

  // 🛡️ Strict Bundle Savings: ONLY applied if count strictly equals bundle count
  const bundleSavings = useMemo(() => {
    if (selectedBundle && totalScrunchies === selectedBundle.count) {
      return Number(selectedBundle.savings) || 0;
    }
    return 0;
  }, [selectedBundle, totalScrunchies]);

  // 🌪️ Dynamic Cyclone Coupon Savings with Pack-Specific Matching
  const couponSavings = useMemo(() => {
    if (selectedBundle || !appliedCoupon) return 0;

    const code = appliedCoupon.code;
    const isPack3or6 = totalScrunchies === 3 || totalScrunchies === 6;
    const isPack9Plus = totalScrunchies >= 9;

    if (code === "CYCLONE10" && isPack3or6) {
      return Math.round(launchSubtotal * 0.10);
    }

    if (code === "CYCLONE20" && isPack9Plus) {
      return Math.round(launchSubtotal * 0.20);
    }

    return 0;
  }, [selectedBundle, appliedCoupon, totalScrunchies, launchSubtotal]);

  // Final subtotal
  const finalSubtotal = Math.max(0, launchSubtotal - bundleSavings - couponSavings);
  const totalSavings = launchSavings + bundleSavings + couponSavings;

  // 🛡️ Automatic Bundle Eviction if count changes away from tier
  useEffect(() => {
    if (selectedBundle && totalScrunchies !== selectedBundle.count) {
      setSelectedBundle(null);
      localStorage.removeItem("sf_selected_bundle");
    }
  }, [totalScrunchies, selectedBundle]);

  // 🛡️ Auto-evict applied coupon if cart item count deviates from coupon rules
  useEffect(() => {
    if (!appliedCoupon) return;

    const code = appliedCoupon.code;
    const isPack3or6 = totalScrunchies === 3 || totalScrunchies === 6;
    const isPack9Plus = totalScrunchies >= 9;

    if (code === "CYCLONE10" && !isPack3or6) {
      toast("Coupon removed: CYCLONE10 is only applicable on Pack of 3 or Pack of 6. 🎀", { icon: "ℹ️" });
      setAppliedCoupon(null);
      localStorage.removeItem("sf_applied_coupon");
    } else if (code === "CYCLONE20" && !isPack9Plus) {
      toast("Coupon removed: CYCLONE20 is only applicable on packs of 9 and up. 🎀", { icon: "ℹ️" });
      setAppliedCoupon(null);
      localStorage.removeItem("sf_applied_coupon");
    }
  }, [totalScrunchies, appliedCoupon]);

  const applyBundle = useCallback((bundle) => {
    // If a bundle is applied, unseat any active coupon
    if (appliedCoupon) {
      setAppliedCoupon(null);
      localStorage.removeItem("sf_applied_coupon");
      toast("Coupon replaced with bundle offer! 🎀", { icon: "ℹ️" });
    }
    setSelectedBundle(bundle);
    try {
      localStorage.setItem("sf_selected_bundle", JSON.stringify(bundle));
    } catch {}
  }, [appliedCoupon]);

  const removeBundle = useCallback(() => {
    setSelectedBundle(null);
    try {
      localStorage.removeItem("sf_selected_bundle");
    } catch {}
  }, []);

  const applyCoupon = useCallback((coupon) => {
    const code = coupon.code;
    const isPack3or6 = totalScrunchies === 3 || totalScrunchies === 6;
    const isPack9Plus = totalScrunchies >= 9;

    if (code === "CYCLONE10" && !isPack3or6) {
      toast.error("CYCLONE10 is only valid on Pack of 3 or Pack of 6! 🎀");
      return false;
    }

    if (code === "CYCLONE20" && !isPack9Plus) {
      toast.error("CYCLONE20 is only valid on packs of 9 and up! 🌪️");
      return false;
    }

    if (selectedBundle) {
      toast.error("Please uncheck the bundle offer below before activating this coupon! 🎀");
      return false;
    }

    setAppliedCoupon(coupon);
    try {
      localStorage.setItem("sf_applied_coupon", JSON.stringify(coupon));
    } catch {}
    const pct = code === "CYCLONE10" ? 10 : 20;
    toast.success(`🎉 ${code} applied! Saved ${pct}% OFF!`);
    return true;
  }, [totalScrunchies, selectedBundle]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("sf_applied_coupon");
    } catch {}
    toast("Coupon removed.", { icon: "↩️" });
  }, []);

  return (
    <PricingContext.Provider
      value={{
        ...baseMetrics,
        totalScrunchies,
        totalMrp,
        launchSubtotal,
        launchSavings,
        bundleSavings,
        couponSavings,
        totalSavings,
        subtotal: finalSubtotal,
        selectedBundle,
        appliedCoupon,
        isBundleApplied: Boolean(selectedBundle && totalScrunchies === selectedBundle.count),
        applyBundle,
        removeBundle,
        applyCoupon,
        removeCoupon,
        triggerCelebration,
        setTriggerCelebration
      }}
    >
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) throw new Error('usePricing must be utilized inside a PricingProvider canvas wrapper');
  return context;
};