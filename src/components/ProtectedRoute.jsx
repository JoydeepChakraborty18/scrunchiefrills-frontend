import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import toast from "react-hot-toast";
import { Lock, ArrowLeft } from "lucide-react";

const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // 💡 Notify the user with a welcoming toast, but do NOT auto-pop the modal over the card
    if (!user) {
      toast("Sign in to unlock your Frill Club rewards & games! 🎀", {
        icon: "👑",
        id: "protected-route-prompt",
      });
    }
  }, [user, location.pathname]);

  // ✅ If user is logged in, render the protected component directly
  if (user) {
    return children;
  }

  // 🌸 If user is a guest, display the clean "Members Only Area" interstitial card
  return (
    <div className="min-h-screen w-full bg-[#FFF5F8] flex flex-col items-center justify-center px-4 py-20 text-center select-none">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-pink-100 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 text-[#E02171] mx-auto flex items-center justify-center text-3xl shadow-xs">
          👑
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Members Only Area
          </h2>
          <p className="text-xs font-semibold text-gray-500 leading-relaxed">
            Please sign in or create an account to view your Scrapbook, collect Bubble Cards, and play Mini-Games! ✨
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {/* Clicking this button cleanly opens AuthModal on user intent */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 bg-[#E02171] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock size={14} /> Sign In / Create Account
          </button>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>

      {/* Floating AuthModal only appears when triggered by the user */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default ProtectedRoute;