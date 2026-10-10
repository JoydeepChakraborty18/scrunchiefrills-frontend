import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { usePricing } from "../context/PricingContext";
import { 
  SavingsVaultPanel, 
  CartSummaryDetailsBox as CheckoutSummaryDetailsBox 
} from "../components/PricingWidgets";
import { auth } from "../firebase";
import Footer from "../sections/Footer";
import AuthModal from "../components/AuthModal";
import toast from "react-hot-toast";

/**
 * ✨ CART COMPONENT ✨
 * Designed for: Scrunchiefrills™ 
 * Features: Itemized List, Subtotal Calculation, Pack of 3 Rule, AuthModal & Guest Audit Access
 */
const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const user = auth.currentUser;
  const { subtotal } = usePricing();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const totalScrunchiesCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // 🧮 Pack of 3 Validation Rule
  const isPackOfThreeValid = totalScrunchiesCount >= 3 && totalScrunchiesCount % 3 === 0;
  
  // 💳 CHECKOUT HANDLER
  const handleCheckout = () => {
    // 🛑 Rule 1: Minimum 3 scrunchies constraint check
    if (totalScrunchiesCount < 3) {
      toast.error(`Orders must have at least 3 scrunchies! Add ${3 - totalScrunchiesCount} more. 🎀`);
      return;
    }

    // 🛑 Rule 2: Pack of 3 exact multiple check
    if (totalScrunchiesCount % 3 !== 0) {
      const neededToAdd = 3 - (totalScrunchiesCount % 3);
      toast.error(`Scrunchies are sold in packs of 3! Add ${neededToAdd} more to complete your pack. 🎀`);
      return;
    }

    // 🛑 Rule 3: Minimum Amount Boundary Check
    if (subtotal < 499) {
      toast.error("Orders must be at least ₹499 to proceed to checkout!");
      return;
    }

    // 🚀 Audit-Friendly Navigation: Proceed directly to checkout
    // If not logged in, checkout handles guest credentials seamlessly
    navigate("/checkout");
  };

  return (
    <div 
      className="min-h-screen w-full bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: "url('/images/SFBestsellers.png')" }}
    >

      <main className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
        {/* 🔙 Back to Shop Link */}
        <button 
          onClick={() => navigate("/shop")}
          className="flex items-center gap-2 text-pink-600 font-bold text-xs sm:text-sm mb-5 sm:mb-6 hover:translate-x-[-4px] transition-transform uppercase cursor-pointer select-none"
        >
          <ArrowLeft size={18} />
          CONTINUE SHOPPING
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* 🛒 ITEM LIST SECTION */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-pink-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 sm:mb-6 pb-3 border-b border-gray-100">
                <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight uppercase">
                  Your Scrunchie Case ({totalScrunchiesCount} {totalScrunchiesCount === 1 ? "Item" : "Items"})
                </h1>

                {/* Status Badges */}
                {totalScrunchiesCount < 3 && totalScrunchiesCount > 0 ? (
                  <span className="text-[9px] sm:text-[10px] font-black text-rose-500 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-tight self-start sm:self-auto">
                    Min 3 Needed ({3 - totalScrunchiesCount} More)
                  </span>
                ) : totalScrunchiesCount % 3 !== 0 ? (
                  <span className="text-[9px] sm:text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-tight self-start sm:self-auto">
                    Pack of 3: Add {3 - (totalScrunchiesCount % 3)} More to Complete Pack 🎀
                  </span>
                ) : totalScrunchiesCount > 0 ? (
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-tight self-start sm:self-auto">
                    ✓ Perfect Pack of {totalScrunchiesCount} Ready!
                  </span>
                ) : null}
              </div>

              {/* Optional Sign-in Banner for Guest Shoppers */}
              {!user && (
                <div className="mb-4 p-3 bg-pink-50/80 border border-pink-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    Already a Frill Club member? Sign in to save rewards!
                  </span>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs font-black text-[#E02171] hover:underline uppercase cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {cart.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {cart.map((item) => {
                    const maxStock = item.stockCount ?? 9;
                    const isMaxStockReached = item.quantity >= maxStock;
                    const canIncrement = !isMaxStockReached;

                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 border border-gray-100 rounded-xl sm:rounded-2xl bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-grow">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-pink-50 flex-shrink-0" 
                          />
                          
                          <div className="flex-grow text-left min-w-0">
                            <h3 className="text-xs sm:text-sm font-black text-gray-800 leading-tight uppercase truncate">
                              {item.name}
                            </h3>
                            <p className="text-[#E02171] font-bold text-xs sm:text-sm mt-0.5">
                              ₹{item.price}
                            </p>
                            {isMaxStockReached && (
                              <span className="text-[9px] font-bold text-rose-500">
                                Max stock reached ({maxStock})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dynamic Quantity & Remove Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                          <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.quantity === 1) {
                                  removeFromCart(item.id);
                                } else {
                                  updateQuantity(item.id, -1);
                                }
                              }}
                              className="p-1 text-gray-500 hover:text-pink-500 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={15} />
                            </button>
                            <span className="font-bold text-xs sm:text-sm w-4 text-center select-none">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canIncrement) {
                                  updateQuantity(item.id, 1);
                                } else {
                                  toast.error("Maximum available stock reached for this item! 🎀");
                                }
                              }}
                              disabled={!canIncrement}
                              className="p-1 text-gray-500 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <p className="text-gray-400 font-bold italic uppercase tracking-widest text-xs sm:text-sm">
                    Your case is empty...
                  </p>
                  <button 
                    onClick={() => navigate("/shop")}
                    className="mt-4 bg-[#E02171] text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:bg-[#c71761] transition cursor-pointer"
                  >
                    Go Shop
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 💳 SUMMARY WIDGET COLUMN */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 static lg:sticky top-28">
            
            {!isPackOfThreeValid && totalScrunchiesCount > 0 && (
              <div className="bg-pink-50 border-2 border-dashed border-[#E02171] p-3 rounded-2xl text-center">
                <p className="text-[11px] font-black text-[#E02171] uppercase leading-tight">
                  🎀 Scrunchiefrills Pack Rule:
                </p>
                <p className="text-[10px] font-bold text-gray-700 mt-1">
                  Orders must be in packs of <strong>3, 6, 9, 12, 15, 18+</strong> scrunchies. (Current: {totalScrunchiesCount})
                </p>
              </div>
            )}

            <SavingsVaultPanel />

            <CheckoutSummaryDetailsBox onCheckoutTrigger={handleCheckout} />

            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-3 text-center uppercase tracking-tight">
              Secure SSL Encrypted Payment • GST Invoice Included
            </p>
          </div>

        </div>
      </main>

      <Footer />

      {/* 🔐 Interactive Sign In Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Cart;