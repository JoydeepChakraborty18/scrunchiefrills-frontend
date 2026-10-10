import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShieldCheck, Lock, EyeOff, Server, HeartHandshake, CheckCircle2 } from "lucide-react";

/**
 * 🔒 PRIVACY POLICY INTERACTIVE MODAL
 * Brand: Scrunchiefrills™
 * Aesthetic: Neo-Brutalist Soft-Pink Borders, Hyper-Feminine, Transparent & Legally Sound
 */
const PRIVACY_LAST_UPDATED = "19 September 2026";

const PrivacyModal = ({ isOpen, onClose, onAccept }) => {
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
          {/* 🏷️ Header Strip */}
          <div className="bg-[#FFF2F8] border-b-4 border-black px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🔒</span>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  Privacy Policy <Sparkles size={16} className="text-[#E02171]" />
                </h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Scrunchiefrills™ • Your Secrets Are Safe With Us
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black font-black hover:bg-[#E02171] hover:text-white transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* 📜 Scrollable Policy Content */}
          <div className="overflow-y-auto px-6 py-5 text-gray-700 text-xs font-medium space-y-5 leading-relaxed">
            
            {/* Friendly Intro Banner */}
            <div className="bg-[#FFF0F6] border-2 border-dashed border-[#E02171]/40 rounded-2xl p-3.5">
              <p className="text-[11px] font-bold text-[#E02171] leading-snug">
                Your trust is everything to us! We only gather the absolute bare minimum information needed to package your fluffy scrunchies and drop them straight at your doorstep. We never sell your personal details—pinky promise! 💗
              </p>
            </div>

            {/* Section 1: What We Collect */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Server size={15} className="text-[#E02171]" /> 1. Data We Collect & Why
              </h3>
              <p className="text-gray-600 pl-5">
                When you browse or place an order through <strong>Scrunchiefrills™</strong>, we collect:
              </p>
              <ul className="list-disc list-inside pl-7 text-gray-600 space-y-0.5 mt-1">
                <li><strong>Contact Details:</strong> Full name, verified mobile number, and email address to send automated order confirmations and OTP authentication tokens.</li>
                <li><strong>Delivery Credentials:</strong> Street address, city, state, and postal pincode to generate courier waybills and parcel shipping labels.</li>
                <li><strong>Order History:</strong> Purchased scrunchie styles, quantities, and order reference keys for post-purchase support and receipt lookups.</li>
              </ul>
            </div>

            {/* Section 2: Zero Payment Storage */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={15} className="text-[#E02171]" /> 2. Bank-Grade Payment Security (Razorpay)
              </h3>
              <p className="text-gray-600 pl-5">
                <strong>We never view, collect, or store your debit/credit card numbers, CVVs, netbanking credentials, or UPI PINs.</strong> All financial processing is handled via tokenized TLS-encrypted webhooks through <strong>Razorpay (PCI-DSS Level 1 Compliant)</strong>. Only a verified transaction reference token is stored on our servers to acknowledge your paid order.
              </p>
            </div>

            {/* Section 3: Third-Party Fulfillment Sharing */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake size={15} className="text-[#E02171]" /> 3. Service Providers & Fulfillment Hand-off
              </h3>
              <p className="text-gray-600 pl-5">
                Your data is shared strictly with dedicated operational partners necessary to fulfill your purchases:
              </p>
              <ul className="list-disc list-inside pl-7 text-gray-600 space-y-0.5 mt-1">
                <li><strong>Logistics Partners:</strong> Your delivery name, contact number, and address are transmitted to <strong>Shiprocket / Delhivery</strong> solely to route transit trucks and deliver your parcel.</li>
                <li><strong>Cloud Storage:</strong> Customer accounts and order records are stored within Google Firebase Cloud Firestore with private server-side security access rules.</li>
              </ul>
            </div>

            {/* Section 4: Marketing & Communications */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <EyeOff size={15} className="text-[#E02171]" /> 4. Zero Spam Policy
              </h3>
              <p className="text-gray-600 pl-5">
                We despise inbox spam as much as hair breakage. We will only contact you for vital transactional notices (payment slips, courier tracking numbers). If you opt into drops alerts or newsletter fun, you can unsubscribe with a single click at any time.
              </p>
            </div>

            {/* Section 5: Data Rights */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#E02171]" /> 5. Your Rights & Data Deletion
              </h3>
              <p className="text-gray-600 pl-5">
                You have the complete right to request a review of your customer profile or request account deletion. To wipe your saved addresses or profile data from our records, contact us anytime at <span className="font-bold text-[#E02171]">hello@scrunchiefrills.com</span>.
              </p>
            </div>

          </div>

          {/* 🎀 Action Footer Strip */}
          <div className="bg-[#FFF2F8] border-t-4 border-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center sm:text-left">
              Last Updated: {PRIVACY_LAST_UPDATED} • Kolkata, India
            </p>

            <button
              type="button"
              onClick={() => {
                if (onAccept) onAccept();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#E02171] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 size={16} /> Got It! 🎀
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PrivacyModal;