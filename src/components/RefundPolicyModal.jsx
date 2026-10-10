// src/components/RefundPolicyModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, RefreshCw, ShieldAlert, CreditCard, Clock, CheckCircle2, MapPin, Truck } from "lucide-react";

/**
 * 🔄 REFUND, RETURN & CANCELLATION POLICY INTERACTIVE MODAL
 * Brand: Scrunchiefrills™
 * Tailored for: Razorpay Live Merchant Onboarding Compliance & Return Logistics
 */
const REFUND_LAST_UPDATED = "03 October 2026";

const RefundPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 select-none">
        
        {/* 🌸 Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* 🎀 Main Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-2xl bg-white border-4 border-black rounded-[32px] shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* 🏷️ Top Header Banner */}
          <div className="bg-[#FFF2F8] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🔄</span>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  Refund & Return Policy <Sparkles size={16} className="text-[#E02171]" />
                </h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Scrunchiefrills™ • Transparent & Fair Resolutions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black font-black hover:bg-[#E02171] hover:text-white transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* 📜 Scrollable Policy Content */}
          <div className="overflow-y-auto px-6 py-5 text-gray-700 text-xs font-medium space-y-5 leading-relaxed">
            
            <div className="bg-[#FFF0F6] border-2 border-dashed border-[#E02171]/40 rounded-2xl p-3.5">
              <p className="text-[11px] font-bold text-[#E02171] leading-snug">
                At Scrunchiefrills™, your happiness is our top priority. Because our scrunchies and accessories are classified under personal hair-care hygiene, we adhere to strict safety guidelines while guaranteeing 100% protection against transit damages or defects.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} className="text-[#E02171]" /> 1. Order Cancellation Window
              </h3>
              <p className="text-gray-600 pl-5">
                Customers can request an order cancellation within <strong>2 hours</strong> of placing the order, or prior to package dispatch and courier handover (whichever occurs first). Once an order has been assigned an AWB tracking code and dispatched via Shiprocket, it cannot be recalled or cancelled. To cancel within the eligible window, email <strong>support@scrunchiefrills.com</strong> with your Order ID.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-[#E02171]" /> 2. Hygiene Exclusion & Return Conditions
              </h3>
              <p className="text-gray-600 pl-5">
                Due to standard intimate and personal hair-care hygiene regulations, <strong>we do not accept general returns or exchanges</strong> for change of mind or personal preference. Each product is inspected, steamed, sanitised, and sealed in tamper-proof packaging before leaving our studio.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={15} className="text-[#E02171]" /> 3. Defective, Damaged, or Incorrect Items Guarantee
              </h3>
              <p className="text-gray-600 pl-5">
                In the rare instance that you receive an item with a manufacturing defect, stitching failure, transit damage, or if an incorrect SKU was packed:
              </p>
              <ul className="list-disc list-inside pl-7 text-gray-600 space-y-1 mt-1">
                <li>You must notify us within <strong>48 hours</strong> of parcel delivery.</li>
                <li>Please submit an unedited <strong>unboxing video</strong> clearly showing the outer shipping label and the flaw/discrepancy to <strong>support@scrunchiefrills.com</strong>.</li>
                <li>Upon verification, we will issue a replacement or approve a return and refund.</li>
              </ul>
            </div>

            {/* Section 4: Return Shipping Policy Clause */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={15} className="text-[#E02171]" /> 4. Return Postage & Warehouse Dispatch
              </h3>
              <p className="text-gray-600 pl-5 leading-relaxed">
                If an authorized return or exchange is approved by our customer support team, <strong>the customer must courier and post the item back to our warehouse address at their own expense</strong>. Scrunchiefrills™ does not provide reverse pickup services for return parcels.
              </p>
              
              {/* Warehouse Address Box */}
              <div className="ml-5 mt-2 p-3.5 bg-[#FFF9FB] border-2 border-pink-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#E02171] uppercase tracking-wider">
                  <MapPin size={13} /> Return Shipping Address:
                </div>
                <p className="text-[11px] font-bold text-gray-800">
                  Scrunchiefrills™ Studio & Fulfillment Warehouse
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Chaturanga Building, 1st Floor, opposite Silpara Basketball Ground,<br />
                  39/B/2, Mohit Colony, James Long Sarani, Silpara, Purba Barisha,<br />
                  Behala, Kolkata - 700008, West Bengal, India
                </p>
                <p className="text-[10px] text-gray-500 pt-1 font-medium">
                  <em>Note: Please ensure the parcel is packed securely using a trackable courier service and retain your tracking receipt until your parcel is delivered and inspected.</em>
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={15} className="text-[#E02171]" /> 5. Refund Processing & Bank Timelines
              </h3>
              <p className="text-gray-600 pl-5">
                Approved refunds are initiated immediately from our Razorpay Merchant Portal back to the <strong>original source of payment</strong> (UPI account, Credit/Debit card, or Netbanking) upon receipt and inspection of the returned package. Funds reflect in your account within <strong>5 to 7 business days</strong> depending on your bank's clearance cycles.
              </p>
            </div>

          </div>

          {/* 🎀 Action Footer Strip */}
          <div className="bg-[#FFF2F8] border-t-4 border-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center sm:text-left">
              Last Updated: {REFUND_LAST_UPDATED} • Kolkata, India
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-[#E02171] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} /> I Understand 🎀
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RefundPolicyModal;