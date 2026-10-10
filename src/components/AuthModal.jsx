import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock, Mail, ArrowRight } from "lucide-react";
import { auth, db } from "../firebase";
import { 
  GoogleAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  getAdditionalUserInfo
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

// Non-blocking helper to trigger the welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    await fetch("/api/send-welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
  } catch (err) {
    console.warn("Welcome email notice:", err);
  }
};

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Ensure customer profile document exists in Firestore
      if (user?.uid) {
        try {
          const userDocRef = doc(db, "customers", user.uid);
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              customerName: user.displayName || "Scrunchiefriller",
              email: user.email || "",
              phone: user.phoneNumber || "",
              createdAt: serverTimestamp(),
            });
          }
        } catch (dbErr) {
          console.warn("Firestore customer profile sync notice:", dbErr);
        }
      }
      
      const additionalInfo = getAdditionalUserInfo(result);
      if (additionalInfo?.isNewUser) {
        sendWelcomeEmail(user.email, user.displayName);
      }

      toast.success("Welcome to the Frill Club! 🎀");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Google Auth Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        toast("Sign in cancelled", { icon: "🎀" });
      } else if (err.code === "auth/unauthorized-domain") {
        toast.error("Please add this domain to Firebase Authentication Authorized Domains.");
      } else if (err.code === "auth/cancelled-popup-request") {
        // Ignored duplicate popup triggers
      } else {
        toast.error(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (!formData.name.trim()) {
          toast.error("Please enter your name!");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );
        await updateProfile(userCredential.user, {
          displayName: formData.name.trim(),
        });

        // Ensure customer document exists in Firestore
        try {
          await setDoc(doc(db, "customers", userCredential.user.uid), {
            customerName: formData.name.trim(),
            email: formData.email.trim(),
            createdAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn("Firestore customer creation notice:", dbErr);
        }

        sendWelcomeEmail(formData.email.trim(), formData.name.trim());
        toast.success("Account created! Welcome, Scrunchiefriller! 🎀");
      } else {
        await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        toast.success("Welcome back! 🌸");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Email Auth Error:", err);
      toast.error(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-pink-100 overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-pink-50 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Heading */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E02171] mx-auto flex items-center justify-center text-xl shadow-xs mb-2">
              👑
            </div>
            <h3 className="text-base font-black text-gray-900">
              {isSignUp ? "Join Scrunchiefrills™" : "Welcome Back!"}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Access your order history & saved addresses 💌
            </p>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:border-pink-300 rounded-2xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-pink-100" />
            <span className="px-2 text-[10px] uppercase font-bold text-gray-400">or</span>
            <div className="flex-1 h-px bg-pink-100" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-2.5">
            {isSignUp && (
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#E02171]"
                />
              </div>
            )}

            <div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#E02171]"
              />
            </div>

            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#E02171]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#E02171] hover:bg-pink-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs disabled:opacity-50 mt-1"
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle Login / Signup */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[11px] font-bold text-gray-500 hover:text-[#E02171] transition cursor-pointer"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "New to Scrunchiefrills? Sign up"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;