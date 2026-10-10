import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShieldAlert, Truck, CreditCard, RotateCcw, CheckCircle2 } from "lucide-react";

/**
 * 📜 TERMS & CONDITIONS INTERACTIVE MODAL
 * Tailored for: Scrunchiefrills™
 * Aesthetic: Hyper-Feminine, Neo-Brutalist Soft-Pink Borders, Playful & Legally Sound
 */

// Define the actual date this legal agreement was reviewed and adopted
const TERMS_LAST_UPDATED = "22 September 2026";

const TermsModal = ({ isOpen, onClose, onAccept }) => {
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

        {/* 🎀 Main Interactive Modal Card */}
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
              <span className="text-2xl animate-bounce">🎀</span>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  Terms & Conditions <Sparkles size={16} className="text-[#E02171]" />
                </h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Scrunchiefrills™ • Slay the frill way
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

          {/* 📜 Scrollable Terms Content */}
          <div className="overflow-y-auto px-6 py-5 text-gray-700 text-xs font-medium space-y-5 leading-relaxed">
            
            {/* Intro Note */}
            <div className="bg-[#FFF0F6] border-2 border-dashed border-[#E02171]/40 rounded-2xl p-3.5">
              <p className="text-[11px] font-bold text-[#E02171] leading-snug">
                Welcome to Scrunchiefrills™! By accessing our website, placing an order, or browsing our frill collections, you agree to comply with the terms detailed below. Please read them with love! 💗
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-[#E02171]" /> 1. Hygiene & Return Policy (Strictly Enforced)
              </h3>
              <p className="text-gray-600 pl-5">
                Due to personal hygiene and hair-care safety standards, <strong>all Scrunchiefrills™ hair accessories are non-returnable and non-exchangeable</strong> once delivered. Every order is meticulously hand-checked and sealed prior to dispatch.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw size={15} className="text-[#E02171]" /> 2. Transit Damage & Replacement Guarantee
              </h3>
              <p className="text-gray-600 pl-5">
                If your package arrives defective, crushed, or containing an incorrect item, we will happily issue an immediate replacement! To claim a replacement:
              </p>
              <ul className="list-disc list-inside pl-7 text-gray-600 space-y-0.5 mt-1">
                <li>You must record an <strong>unboxing video</strong> showing the outer parcel label and the opening of the package.</li>
                <li>Contact our support team within <strong>48 hours</strong> of delivery with the video proof.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={15} className="text-[#E02171]" /> 3. Payment & Pricing Engine
              </h3>
              <p className="text-gray-600 pl-5">
                We operate strictly on a <strong>100% Prepaid Model</strong>. Cash on Delivery (COD) is not accepted. All transactions are securely routed via Razorpay using bank-grade encryption (UPI, Netbanking, Cards, Wallets). Scrunchiefrills™ never stores or views your card credentials or UPI PINs.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={15} className="text-[#E02171]" /> 4. Shipping, Timelines & Fulfillment
              </h3>
              <p className="text-gray-600 pl-5">
                Orders are packed and handed over to our logistics partners (powered by <strong>Shiprocket / Delhivery</strong>) within <strong>24–48 hours</strong> of payment confirmation. Standard pan-India delivery typically takes <strong>3 to 5 business days</strong> depending on your pincode. Live tracking links are dispatched via SMS / Email.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <span>🛍️</span> 5. Order Boundaries & Minimum Quantities
              </h3>
              <p className="text-gray-600 pl-5">
                To guarantee optimal box packaging and carbon-efficient transit, our store enforces a <strong>minimum order requirement of 3 scrunchies</strong> and a minimum cart value of <strong>₹499</strong>. Orders below these limits cannot be processed.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <span>🎨</span> 6. Product Aesthetics & Intellectual Property
              </h3>
              <ul className="list-disc pl-12 space-y-1 leading-relaxed text-gray-600">
                <li>
                  All proprietary artwork, hand-drawn motifs, digital illustrations, website visual styling, product color palettes, and custom packaging designs are the exclusive creative property of <strong>Scrunchiefrills™</strong>.
                </li>
                <li>
                  Our brand identity—including the brand name <strong>Scrunchiefrills™</strong>, our official mascot <strong>Miss Scrunchie</strong>, our signature logos, and all custom character graphics—is proprietary and legally protected against unauthorized reproduction, imitation, or redistribution.
                </li>
                <li>
                  Community catchphrases and campaign tags such as <strong>#ManeCharacterEnergy</strong> and <strong>#SlayTheFrillWay</strong> celebrate our community's spirit and love for voluminous hair accessories; while we encourage our frill community to share and tag their looks freely using these mottos, all associated Scrunchiefrills branded media, photography, and presentation assets remain our exclusive copyrighted property.
                </li>
              </ul>
            </div>

          </div>

          {/* 🎀 Action Footer Strip */}
          <div className="bg-[#FFF2F8] border-t-4 border-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center sm:text-left">
              Last Updated: {TERMS_LAST_UPDATED} • Kolkata, India
            </p>

            <button
              type="button"
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#E02171] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 size={16} /> I Agree & Accept 🎀
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TermsModal;