import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Truck, MapPin, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

/**
 * 🚚 SHIPPING & DELIVERY POLICY INTERACTIVE MODAL
 * Brand: Scrunchiefrills™
 * Tailored for: Razorpay Live Merchant Onboarding Compliance
 */
const SHIPPING_LAST_UPDATED = "30 September 2026";

const ShippingPolicyModal = ({ isOpen, onClose }) => {
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
              <span className="text-2xl animate-bounce">🚚</span>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  Shipping & Delivery Policy <Sparkles size={16} className="text-[#E02171]" />
                </h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Scrunchiefrills™ • Reliable Pan-India Fulfillment
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black font-black hover:bg-[#E02171] hover:text-white transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* 📜 Scrollable Policy Content */}
          <div className="overflow-y-auto px-6 py-5 text-gray-700 text-xs font-medium space-y-5 leading-relaxed">
            
            <div className="bg-[#FFF0F6] border-2 border-dashed border-[#E02171]/40 rounded-2xl p-3.5">
              <p className="text-[11px] font-bold text-[#E02171] leading-snug">
                Every Scrunchiefrills™ order is packed with utmost hygiene and cloud-grade care from our Kolkata fulfillment warehouse. Here is everything you need to know about our shipping schedules and carriers! 🎀
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} className="text-[#E02171]" /> 1. Order Processing & Dispatch Timelines
              </h3>
              <p className="text-gray-600 pl-5">
                All confirmed orders undergo manual quality checks, sanitization, and packaging within <strong>24 to 48 operational hours</strong> (excluding Sundays and national public holidays) from the moment payment confirmation is verified via Razorpay.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={15} className="text-[#E02171]" /> 2. Estimated Transit Schedules
              </h3>
              <p className="text-gray-600 pl-5">
                Once handed over to our courier networks, the transit duration varies based on your delivery destination:
              </p>
              <ul className="list-disc list-inside pl-7 text-gray-600 space-y-1 mt-1">
                <li><strong>Intra-State (Kolkata & West Bengal):</strong> Typically delivered within <strong>1 to 2 business days</strong>.</li>
                <li><strong>Metros & Tier 1 Cities (Rest of India):</strong> Typically delivered within <strong>3 to 5 business days</strong>.</li>
                <li><strong>Rest of India (Tier 2/3 & Remote Locations):</strong> Estimated delivery between <strong>4 to 7 business days</strong>.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={15} className="text-[#E02171]" /> 3. Logistics Partners & Tracking
              </h3>
              <p className="text-gray-600 pl-5">
                We fulfill consignments nationwide through our integrated logistics partner <strong>Shiprocket</strong>, primarily utilizing <strong>Delhivery Surface/Air</strong>, supported by tier-one carriers such as Blue Dart, DTDC, and Ekart. Upon parcel pickup, an automated SMS and email containing your live tracking Air Waybill (AWB) number will be dispatched. You can also view live delivery scans directly on your Scrunchiefrills customer profile dashboard.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#E02171]" /> 4. Shipping Charges & Free Delivery Thresholds
              </h3>
              <ul className="list-disc list-inside pl-7 text-gray-600 space-y-1">
                <li><strong>West Bengal Destinations (PIN 70xxxx–74xxxx):</strong> Free shipping on all orders valued at <strong>₹999 and above</strong>. Standard shipping is ₹50 for orders below ₹999.</li>
                <li><strong>Inter-State / National Shipping:</strong> Free delivery on orders valued at <strong>₹1999 and above</strong>. Dynamically calculated surface/air shipping rates apply below this threshold based on volumetric weight.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <span>📍</span> 5. Delivery Address Accuracy & Non-Serviceable Zones
              </h3>
              <p className="text-gray-600 pl-5">
                Please verify that your complete shipping address, landmark, and 6-digit postal PIN code are entered accurately during checkout. In the rare event that your PIN code is identified as non-serviceable by our logistics carriers, our support team will reach out immediately or issue a 100% refund to your source account.
              </p>
            </div>

          </div>

          {/* 🎀 Action Footer Strip */}
          <div className="bg-[#FFF2F8] border-t-4 border-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center sm:text-left">
              Last Updated: {SHIPPING_LAST_UPDATED} • Kolkata, India
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-[#E02171] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 size={16} /> Understood! 🎀
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShippingPolicyModal;