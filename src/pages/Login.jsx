import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { auth } from "../firebase";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/home");
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Added Forgot Password Logic
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/Loginpage.png')",
      }}
    >
      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          relative z-10 w-full 
          max-w-sm sm:max-w-md md:max-w-lg
          p-5 sm:p-8 md:p-10
          rounded-2xl sm:rounded-3xl
          bg-white/30 backdrop-blur-xl 
          shadow-xl border border-white/40
        "
      >
        {/* Title */}
        <h2 className="
          text-2xl sm:text-3xl md:text-4xl 
          font-bold text-center text-gray-800 
          mb-4 sm:mb-6 tracking-tight
        ">
          {isSignup ? "Create Account ✨" : "Welcome Back ✨"}
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="
            w-full px-4 py-2.5 sm:py-3 
            rounded-xl bg-white/70 
            mb-3.5 sm:mb-4 text-xs sm:text-sm md:text-base
            focus:outline-none focus:ring-2 focus:ring-pink-300
            border border-white/50
          "
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            className="
              w-full px-4 py-2.5 sm:py-3 
              rounded-xl bg-white/70 
              text-xs sm:text-sm md:text-base
              focus:outline-none focus:ring-2 focus:ring-pink-300
              border border-white/50
            "
            onChange={(e) => setPassword(e.target.value)}
          />

          <div
            className="absolute right-3 top-2.5 sm:top-3 cursor-pointer text-gray-600 p-0.5"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
          </div>
        </div>

        {/* Forgot Password */}
        {!isSignup && (
          <div 
            className="text-right text-[11px] sm:text-xs md:text-sm text-gray-600 mb-4 sm:mb-6 cursor-pointer hover:underline py-1"
            onClick={handleForgotPassword} // ✅ Added this to enable "forgot password" functionality
          >
            Forgot Password?
          </div>
        )}

        {/* Button */}
        <motion.button
          onClick={handleAuth}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="
            w-full py-2.5 sm:py-3 
            rounded-xl 
            text-xs sm:text-sm md:text-base
            bg-gradient-to-r from-pink-300 via-purple-300 to-yellow-200 
            text-gray-800 font-bold uppercase tracking-wider
            shadow-md hover:shadow-lg transition cursor-pointer select-none
          "
        >
          {isSignup ? "Sign Up" : "Login"}
        </motion.button>

        {/* Toggle */}
        <p className="text-center text-[11px] sm:text-xs md:text-sm text-gray-700 mt-4 sm:mt-6">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            className="font-bold cursor-pointer hover:underline text-pink-600"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign up"}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;