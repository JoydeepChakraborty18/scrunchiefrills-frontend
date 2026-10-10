import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, Heart, ShieldCheck, FileText, Lock, Truck, RefreshCw } from "lucide-react";
import TermsModal from "../components/TermsModal";
import PrivacyModal from "../components/PrivacyModal";
import ShippingPolicyModal from "../components/ShippingPolicyModal";
import RefundPolicyModal from "../components/RefundPolicyModal";

/**
 * ✨ PRODUCTION FOOTER COMPONENT ✨
 * Preserves brand styling while satisfying 100% of Razorpay Merchant Compliance requirements.
 */
function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  return (
    <>
      <footer className="bg-[#0a0f1c] text-white pt-12 pb-8 text-center shadow-[0_-4px_10px_rgba(0,0,0,0.3)] overflow-x-hidden border-t-2 border-pink-500/20">
        
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left mb-10">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-3 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center select-none">
              <img
                src="/images/ScrunchiefrillsTMLogoLarge.png"
                alt="Registered Trademark Scrunchiefrills Logo"
                className="h-9 sm:h-11 object-contain brightness-0 invert" 
              />
            </div>
            <p className="text-gray-400 italic text-xs leading-relaxed max-w-xs">
              Slay the frill way 💖 Cloud-sized statement scrunchies handmade with love, volume, and #ManeCharacterEnergy.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> 100% Secure Checkout via Razorpay
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-pink-400 mb-1">
              Explore
            </h4>
            <Link to="/home" className="text-xs text-gray-300 hover:text-pink-400 transition font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-xs text-gray-300 hover:text-pink-400 transition font-medium">
              Shop Collection
            </Link>
            <Link to="/scrapbook" className="text-xs text-gray-300 hover:text-pink-400 transition font-medium">
              Community Scrapbook
            </Link>
            <Link to="/about" className="text-xs text-gray-300 hover:text-pink-400 transition font-medium">
              Our Story
            </Link>
          </div>

          {/* Column 3: Mandatory Legal Policies (Razorpay Auditor Verification) */}
          <div className="flex flex-col items-center md:items-start space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-pink-400 mb-1">
              Policies & Legal
            </h4>
            
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-xs text-gray-300 hover:text-pink-400 transition font-medium flex items-center gap-1.5 cursor-pointer text-left"
            >
              <FileText size={13} className="text-pink-400" /> Terms & Conditions
            </button>

            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="text-xs text-gray-300 hover:text-pink-400 transition font-medium flex items-center gap-1.5 cursor-pointer text-left"
            >
              <Lock size={13} className="text-pink-400" /> Privacy Policy
            </button>

            <button
              type="button"
              onClick={() => setShowShipping(true)}
              className="text-xs text-gray-300 hover:text-pink-400 transition font-medium flex items-center gap-1.5 cursor-pointer text-left"
            >
              <Truck size={13} className="text-pink-400" /> Shipping & Delivery Policy
            </button>

            <button
              type="button"
              onClick={() => setShowRefund(true)}
              className="text-xs text-gray-300 hover:text-pink-400 transition font-medium flex items-center gap-1.5 cursor-pointer text-left"
            >
              <RefreshCw size={13} className="text-pink-400" /> Refund & Cancellation Policy
            </button>
          </div>

          {/* Column 4: Contact & Physical Business Credentials */}
          <div className="flex flex-col items-center md:items-start space-y-2.5 text-xs text-gray-300">
            <h4 className="text-xs font-black uppercase tracking-widest text-pink-400 mb-1">
              Customer Support & Studio
            </h4>

            <p className="flex items-start gap-2 max-w-xs text-[11px] leading-relaxed">
              <MapPin size={16} className="text-pink-400 flex-shrink-0 mt-0.5" />
              <span>Chaturanga Building, 1st Floor, opposite Silpara Basketball Ground, 39/B/2, Mohit Colony, James Long Sarani, Silpara, Purba Barisha, Behala, Kolkata - 700008, West Bengal</span>
            </p>

            <p className="flex items-center gap-2">
              <Phone size={14} className="text-pink-400 flex-shrink-0" />
              <a href="tel:+919390956923" className="hover:text-pink-400 transition font-semibold">
                +91 9390956923
              </a>
            </p>

            <p className="flex items-center gap-2">
              <Mail size={14} className="text-pink-400 flex-shrink-0" />
              <a href="mailto:support@scrunchiefrills.com" className="hover:text-pink-400 transition font-semibold">
                support@scrunchiefrills.com
              </a>
            </p>

            <p className="text-[10px] text-gray-400 pt-1">
              Support Hours: Mon – Sat (10:00 AM – 6:00 PM IST)
            </p>

            {/* Instagram Social Link */}
            <div className="pt-2">
              <a
                href="https://www.instagram.com/scrunchiefrills"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Scrunchiefrills on Instagram"
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition"
              >
                <Instagram size={18} strokeWidth={2.5} />
                <span className="text-xs font-bold">@scrunchiefrills</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Declarations */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p className="tracking-wide">
            © {new Date().getFullYear()} SCRUNCHIEFRILLS™ | All Rights Reserved
          </p>
          <p className="flex items-center gap-1.5 font-medium text-pink-400/80 text-[11px]">
            GST Registered • Handcrafted in Kolkata, India <Heart size={13} className="text-[#E02171]" />
          </p>
        </div>
      </footer>

      {/* 📜 Interactive Legal Policy Modals */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ShippingPolicyModal isOpen={showShipping} onClose={() => setShowShipping(false)} />
      <RefundPolicyModal isOpen={showRefund} onClose={() => setShowRefund(false)} />
    </>
  );
}

export default Footer;