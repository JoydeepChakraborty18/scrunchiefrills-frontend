import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { calculateCartMetrics } from '../utils/pricingEngine';
import { useCart } from './CartContext'; // Hooks directly into your existing global core hook

// 👑 Keep this internal (remove the 'export' keyword from the raw context object)
const PricingContext = createContext(null);

export const PricingProvider = ({ children }) => {
  const { cart } = useCart(); // Read item arrays in real time
  const [lastUnlockedTierId, setLastUnlockedTierId] = useState(null);
  const [triggerCelebration, setTriggerCelebration] = useState(null);

  // Memoize calculations block to preserve excellent performance metrics
  const pricingMetrics = useMemo(() => {
    return calculateCartMetrics(cart);
  }, [cart]);

  // Monitor milestone unlocks (Neutralized gracefully for zero extra discounts)
  useEffect(() => {
    if (pricingMetrics.totalScrunchies === 0) {
      setLastUnlockedTierId(null);
      return;
    }

    const currentId = pricingMetrics.currentTier ? pricingMetrics.currentTier.id : 'none';
    
    if (lastUnlockedTierId !== null && currentId !== lastUnlockedTierId && currentId !== 'none') {
      setTriggerCelebration({
        tier: pricingMetrics.currentTier.name,
        badge: pricingMetrics.currentTier.badge,
        timestamp: Date.now()
      });
    }
    setLastUnlockedTierId(currentId);
  }, [pricingMetrics.currentTier, pricingMetrics.totalScrunchies, lastUnlockedTierId]);

  return (
    <PricingContext.Provider value={{ ...pricingMetrics, triggerCelebration, setTriggerCelebration }}>
      {children}
    </PricingContext.Provider>
  );
};

// 👑 This is the single, clean, authorized entry point for other components to read pricing data
export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) throw new Error('usePricing must be utilized inside a PricingProvider canvas wrapper');
  return context;
};