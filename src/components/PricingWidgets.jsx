import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePricing } from '../context/PricingContext';
import { useCart } from '../context/CartContext';
import { CONFIG } from '../utils/pricingEngine';
import { X, Info } from 'lucide-react';

/**
 * 👑 HUD MODULE Component 1: Pack-of-3 Milestone & Progression Tracker
 * (Guides users strictly to fulfill the Pack-of-3 constraint; shipping is calculated at checkout)
 */
export const FrillProgressTracker = () => {
  const { totalScrunchies } = usePricing();

  if (totalScrunchies === 0) return null;

  const remainder = totalScrunchies % 3;
  const isPackComplete = totalScrunchies >= 3 && remainder === 0;
  const neededToAdd = remainder === 0 ? 0 : 3 - remainder;

  return (
    <div className="w-full bg-[#FFF0F6] border-2 border-pink-200 rounded-2xl p-3.5 sm:p-4 shadow-sm mb-4">
      <div className="text-center">
        {totalScrunchies < 3 ? (
          <p className="text-xs font-black text-[#E02171]">
            🎀 Add <span className="underline">{3 - totalScrunchies} more scrunchies</span> to unlock your Pack of 3!
          </p>
        ) : !isPackComplete ? (
          <p className="text-xs font-black text-amber-700">
            🎀 Add <span className="underline">{neededToAdd} more</span> to complete your next Pack of 3!
          </p>
        ) : (
          <p className="text-xs font-black text-emerald-700">
            ✨ Perfect Pack of {totalScrunchies} Complete! Ready for checkout. 🎀
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * 💖 HUD MODULE Component 2: The Savings Vault
 * (Focuses strictly on MRP Launch Offer Savings; shipping omitted on Cart)
 */
export const SavingsVaultPanel = () => {
  const { cart } = useCart();
  const { subtotal } = usePricing();

  const totalMrp = cart.reduce((acc, item) => acc + (Number(item.compareAtPrice) || 315) * item.quantity, 0);
  const launchSavings = Math.max(0, totalMrp - subtotal);

  if (launchSavings <= 0) return null;

  return (
    <div className="border-4 border-black bg-gradient-to-b from-[#fff2f8] to-white p-4 sm:p-5 rounded-2xl sm:rounded-[28px] shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] uppercase text-left relative overflow-hidden">
      <div className="absolute right-3 top-3 text-2xl sm:text-3xl opacity-20 pointer-events-none select-none">💖</div>
      <h3 className="text-xs sm:text-sm font-black text-black tracking-widest flex items-center gap-1.5 border-b-4 border-black border-dashed pb-2 mb-3.5 sm:mb-4">
        <span>💖</span> Your Savings Vault
      </h3>

      <div className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs font-black text-gray-700">
        <div className="flex justify-between items-center text-gray-600 font-bold border-b border-pink-100 pb-2">
          <span>ORIGINAL LOT VALUE (MRP)</span>
          <span className="line-through text-gray-400">₹{totalMrp}</span>
        </div>

        <div className="flex justify-between items-center text-[#f02d8d]">
          <span>LAUNCH MRP SAVINGS</span>
          <span>- ₹{launchSavings}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t-2 border-black border-dashed text-black font-black text-xs sm:text-sm">
          <span className="tracking-widest text-[#f02d8d]">TOTAL SAVED</span>
          <span className="text-lg sm:text-xl font-black bg-pink-100 border-2 border-black px-2 sm:px-2.5 py-0.5 rounded-xl text-[#f02d8d] shadow-[2px_2px_0px_#000]">
            ₹{launchSavings}
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
 * 🛒 HUD MODULE Component 4: Master Summary Drawer Box Panel with "See Details" modal
 */
export const CartSummaryDetailsBox = ({ onCheckoutTrigger }) => {
  const { cart } = useCart();
  const { subtotal, totalScrunchies } = usePricing();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Compute Total MRP mathematically: Total MRP - Discount = Subtotal
  const totalMrp = cart.reduce((acc, item) => acc + (Number(item.compareAtPrice) || 315) * item.quantity, 0);
  const launchSavings = Math.max(0, totalMrp - subtotal);

  // 🔒 Strict Pack-of-3 (3, 6, 9, 12, 15, 18+ with no upper cap) and ₹499 floor check
  const isPackOfThree = totalScrunchies >= 3 && totalScrunchies % 3 === 0;
  const isCheckoutDisabled = 
    totalScrunchies < 3 || 
    !isPackOfThree || 
    subtotal < (CONFIG.MIN_ORDER_VALUE || 499);

  return (
    <>
      <div className="border-4 border-black bg-white p-5 rounded-[28px] shadow-[6px_6px_0px_#000] uppercase text-left flex flex-col gap-4">
        <h3 className="text-xs font-black text-black tracking-widest border-b-2 border-gray-100 pb-2">
          ORDER CONSOLE PROFILE
        </h3>
        
        <div className="space-y-2 text-xs font-black text-gray-600">
          {/* Row 1: Total MRP */}
          <div className="flex justify-between items-center">
            <span>TOTAL MRP ({totalScrunchies} ITEMS)</span>
            <span className="text-gray-400 font-bold line-through">₹{totalMrp}</span>
          </div>

          {/* Row 2: Launch MRP Savings with "See Details" trigger */}
          {launchSavings > 0 && (
            <div className="flex justify-between items-center text-[#f02d8d] font-black animate-fade-in">
              <div className="flex items-center gap-1.5">
                <span>LAUNCH MRP SAVINGS</span>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(true)}
                  className="lowercase text-[11px] underline font-bold text-gray-500 hover:text-black cursor-pointer flex items-center gap-0.5"
                >
                  <Info size={11} />
                  see details
                </button>
              </div>
              <span className="font-black">- ₹{launchSavings}</span>
            </div>
          )}

          {/* 🚚 DELIVERY COURIER row omitted from Cart */}

          {/* Row 3: Final Payable Subtotal */}
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

        {/* 🛑 Real-time Guidance / Restriction Alerts (No Upper Limit) */}
        {totalScrunchies < 3 && totalScrunchies > 0 && (
          <p className="text-[10px] text-rose-500 font-black tracking-widest text-center animate-pulse">
            🚨 MUST ORDER AT LEAST 3 SCRUNCHIES. ADD {3 - totalScrunchies} MORE TO CHECKOUT.
          </p>
        )}

        {totalScrunchies >= 3 && totalScrunchies % 3 !== 0 && (
          <p className="text-[10px] text-[#E02171] font-black tracking-widest text-center animate-pulse">
            🎀 PACK OF 3 RULE: ADD {3 - (totalScrunchies % 3)} MORE TO COMPLETE PACK!
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
            : totalScrunchies % 3 !== 0
            ? `ADD ${3 - (totalScrunchies % 3)} MORE FOR PACK`
            : subtotal < (CONFIG.MIN_ORDER_VALUE || 499)
            ? `MIN ORDER ₹${CONFIG.MIN_ORDER_VALUE || 499}`
            : "PROCEED TO CHECKOUT 🚀"}
        </button>
      </div>

      {/* 🧾 Popover / Modal: "See Details" Breakdown */}
      <AnimatePresence>
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-black relative text-left"
            >
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>

              <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>🎀</span> Launch Pricing Breakdown
              </h4>
              <p className="text-[11px] text-gray-500 mb-4">
                During our Debut Lot Launch, every Cloud (XXL) scrunchie enjoys a flat promotional privilege!
              </p>

              <div className="space-y-3 border-y border-gray-100 py-3 text-xs">
                {cart.map((item) => {
                  const mrp = Number(item.compareAtPrice) || 315;
                  const price = Number(item.price) || 249;
                  const itemSavings = (mrp - price) * item.quantity;
                  return (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-800">{item.name}</span>
                        <span className="text-[10px] text-gray-400 block">
                          ₹{mrp} → ₹{price} (Save ₹{mrp - price} × {item.quantity})
                        </span>
                      </div>
                      <span className="font-black text-[#E02171]">- ₹{itemSavings}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 space-y-1.5 text-xs font-black">
                <div className="flex justify-between text-gray-500">
                  <span>Total MRP Value:</span>
                  <span className="line-through">₹{totalMrp}</span>
                </div>
                <div className="flex justify-between text-[#E02171]">
                  <span>Total Promotional Discount:</span>
                  <span>- ₹{launchSavings}</span>
                </div>
                <div className="flex justify-between text-black text-sm pt-2 border-t-2 border-black">
                  <span>Final Payable Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="mt-5 w-full bg-[#E02171] text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-black transition cursor-pointer"
              >
                Got It! 💖
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export const RewardsCelebrationOverlay = () => null;