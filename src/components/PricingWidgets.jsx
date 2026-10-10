import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePricing } from '../context/PricingContext';
import { CONFIG } from '../utils/pricingEngine';

/**
 * 👑 HUD MODULE Component 1: Dynamic Progress & Micro Interaction Tracker
 * (Hidden/commented out for launch; returns null to avoid layout breaks)
 */
export const FrillProgressTracker = () => null;

/**
 * 💖 HUD MODULE Component 2: The Savings Vault
 * (Focuses strictly on MRP Launch Offer Savings; shipping omitted on Cart)
 */
export const SavingsVaultPanel = () => {
  const { estimatedBundleSavings } = usePricing();

  // Only render if there are actual product/bundle savings
  if (!estimatedBundleSavings || estimatedBundleSavings <= 0) return null;

  return (
    <div className="border-4 border-black bg-gradient-to-b from-[#fff2f8] to-white p-4 sm:p-5 rounded-2xl sm:rounded-[28px] shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] uppercase text-left relative overflow-hidden">
      <div className="absolute right-3 top-3 text-2xl sm:text-3xl opacity-20 pointer-events-none select-none">💖</div>
      <h3 className="text-xs sm:text-sm font-black text-black tracking-widest flex items-center gap-1.5 border-b-4 border-black border-dashed pb-2 mb-3.5 sm:mb-4">
        <span>💖</span> Your Savings Vault
      </h3>

      <div className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs font-black text-gray-700">
        <div className="flex justify-between items-center border-b-2 border-black border-dashed pb-2.5 sm:pb-3">
          <span>LAUNCH MRP SAVINGS</span>
          <span className="text-[#f02d8d] text-xs sm:text-sm">₹{estimatedBundleSavings}</span>
        </div>
        
        <div className="flex justify-between items-center pt-1 text-black font-black text-xs sm:text-sm">
          <span className="tracking-widest text-[#f02d8d]">TOTAL SAVED</span>
          <span className="text-lg sm:text-xl font-black bg-pink-100 border-2 border-black px-2 sm:px-2.5 py-0.5 rounded-xl text-[#f02d8d] shadow-[2px_2px_0px_#000]">
            ₹{estimatedBundleSavings}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 🚚 HUD MODULE Component 3: Free Shipping Matrix Widget
 * (Omitted on Cart per shipping privacy policy)
 */
export const ShippingProgressWidget = () => null;

/**
 * 🛒 HUD MODULE Component 4: Master Summary Drawer Box Panel
 */
export const CartSummaryDetailsBox = ({ onCheckoutTrigger }) => {
  const { subtotal, estimatedBundleSavings, totalScrunchies } = usePricing();

  // 🔒 Strict Pack-of-3 (3, 6, 9 only) and ₹499 floor check
  const isPackOfThree = totalScrunchies > 0 && totalScrunchies % 3 === 0;
  const isUnderMaxCap = totalScrunchies <= 9;
  const isCheckoutDisabled = 
    totalScrunchies < 3 || 
    !isUnderMaxCap || 
    !isPackOfThree || 
    subtotal < (CONFIG.MIN_ORDER_VALUE || 499);

  return (
    <div className="border-4 border-black bg-white p-5 rounded-[28px] shadow-[6px_6px_0px_#000] uppercase text-left flex flex-col gap-4">
      <h3 className="text-xs font-black text-black tracking-widest border-b-2 border-gray-100 pb-2">ORDER CONSOLE PROFILE</h3>
      
      <div className="space-y-2 text-xs font-black text-gray-600">
        <div className="flex justify-between items-center">
          <span>SUBTOTAL ({totalScrunchies} ITEMS)</span>
          <span className="text-black font-black">₹{subtotal}</span>
        </div>

        {/* Dynamic Launch MRP Savings Representation */}
        {estimatedBundleSavings > 0 && (
          <div className="flex justify-between items-center text-[#f02d8d] font-black animate-fade-in">
            <span>LAUNCH MRP SAVINGS</span>
            <span className="font-black">- ₹{estimatedBundleSavings}</span>
          </div>
        )}

        {/* 🚚 DELIVERY COURIER row omitted from Cart */}

        <div className="flex justify-between items-center pt-3 border-t-4 border-black text-black font-black text-sm">
          <div className="flex flex-col">
            <span className="tracking-widest font-black">SUBTOTAL</span>
            <span className="text-[9px] text-gray-400 font-bold lowercase tracking-normal">
              *shipping calculated at checkout
            </span>
          </div>
          <span className="text-lg font-black text-black">₹{subtotal}</span>
        </div>
      </div>

      {/* Hygiene Policy Guard Frame Anchor */}
      <div className="bg-amber-50 border-2 border-amber-300 p-2.5 rounded-xl text-[9px] text-amber-800 font-extrabold leading-tight shadow-sm uppercase tracking-tight">
        ⚠️ Hygiene Notice Policy: Non-returnable & No COD. Every package is strictly quality-verified before shipping.
      </div>

      {/* 🛑 Real-time Guidance / Restriction Alerts */}
      {totalScrunchies > 9 && (
        <p className="text-[10px] text-rose-500 font-black tracking-widest text-center animate-pulse">
          🚨 MAX 9 SCRUNCHIES PER BOX! REMOVE {totalScrunchies - 9} TO PROCEED.
        </p>
      )}

      {totalScrunchies < 3 && totalScrunchies > 0 && (
        <p className="text-[10px] text-rose-500 font-black tracking-widest text-center animate-pulse">
          🚨 MUST ORDER AT LEAST 3 SCRUNCHIES. ADD {3 - totalScrunchies} MORE TO CHECKOUT.
        </p>
      )}

      {totalScrunchies >= 3 && totalScrunchies <= 9 && totalScrunchies % 3 !== 0 && (
        <p className="text-[10px] text-[#E02171] font-black tracking-widest text-center animate-pulse">
          🎀 PACK OF 3 RULE: ADD {3 - (totalScrunchies % 3)} MORE (OR REMOVE {totalScrunchies % 3}) TO COMPLETE PACK!
        </p>
      )}

      {subtotal < (CONFIG.MIN_ORDER_VALUE || 499) && isPackOfThree && (
        <p className="text-[10px] text-rose-500 font-black tracking-widest text-center animate-pulse">
          🚨 MIN SUBTOTAL IS ₹{CONFIG.MIN_ORDER_VALUE || 499}. NEED: ₹{(CONFIG.MIN_ORDER_VALUE || 499) - subtotal} MORE.
        </p>
      )}

      {/* 👑 Checkout Action Button */}
      <button
        disabled={isCheckoutDisabled}
        onClick={onCheckoutTrigger}
        className={`w-full py-4 rounded-xl border-4 border-black text-sm font-black tracking-widest text-white uppercase text-center shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] transition-all duration-150 ${
          isCheckoutDisabled 
            ? "bg-gray-300 text-gray-400 shadow-none border-gray-400 translate-y-1 cursor-not-allowed" 
            : "bg-[#f02d8d] hover:bg-black cursor-pointer"
        }`}
      >
        {totalScrunchies < 3
          ? `ADD ${3 - totalScrunchies} MORE SCRUNCHIES`
          : totalScrunchies > 9
          ? `REMOVE ${totalScrunchies - 9} ITEMS (MAX 9)`
          : totalScrunchies % 3 !== 0
          ? `ADD ${3 - (totalScrunchies % 3)} MORE FOR PACK`
          : subtotal < (CONFIG.MIN_ORDER_VALUE || 499)
          ? `MIN ORDER ₹${CONFIG.MIN_ORDER_VALUE || 499}`
          : "PROCEED TO CHECKOUT 🚀"}
      </button>
    </div>
  );
};

export const RewardsCelebrationOverlay = () => null;