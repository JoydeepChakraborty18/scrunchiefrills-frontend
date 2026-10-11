import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import LaunchNavbar from "./components/LaunchNavbar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import MobileBottomNav from "./components/MobileBottomNav"; // 📱 Import MobileBottomNav
import MarqueeBar from "./components/MarqueeBar"; // 🎀 Import MarqueeBar for promotional announcements
import ScrollToTopButton from "./components/ScrollToTopButton"; // 🔝 Import ScrollToTopButton

import About from "./pages/About";
import Cart from "./pages/Cart"; // ✅ Imported Cart
import Checkout from "./pages/Checkout"; // 💳 Imported Checkout View
import OrderConfirmation from "./pages/OrderConfirmation"; // 📦 Imported Order Confirmation
import Home from "./pages/Home";
import Launch from "./pages/Launch";
import Login from "./pages/Login";
import Scrapbook from "./pages/Scrapbook";
import Shop from "./pages/Shop"; // ✅ Imported Shop
import ProductDetail from "./pages/ProductDetail"; // ✅ Wired up description page component
import GameShell from "./pages/GameShell"; // 🕹️ Imported Game Shell Module
import Profile from "./pages/Profile";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { ensureUserDoc } from "./utils/ensureUserDoc";

function Layout() {
  // 🔐 Auth State Management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // ✅ Hook moved to top level to fix "Rules of Hooks" error

  useEffect(() => {
    // 🔄 Listen to Firebase Auth Changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // 🔥 Ensure User Document Exists in Firestore
          await ensureUserDoc(currentUser);
        } catch (err) {
          console.error("ensureUserDoc error handled:", err);
        }
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ⏳ Prevent UI render until auth state is resolved
  // 💡 Avoids flicker / incorrect redirects
  if (loading) return null;

  // 🧭 Route Groups (Scalable Structure)
  const mainRoutes = [
    "/",
    "/home",
    "/about",
    "/shop",
    "/scrapbook",
    "/cart",
    "/checkout",
    "/game",
    "/profile"
  ]; // ✅ Added root "/" and "/checkout" route to mainRoutes to render full navbar layout safely

  // 🎯 Route Detection Logic
  const isMainSite = mainRoutes.some((route) =>
    location.pathname === "/" || (route !== "/" && location.pathname.startsWith(route))
  );

  const isLaunch = location.pathname === "/launch";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 overflow-x-hidden flex flex-col justify-between">
      
      {/* 🌸 UNIFIED STICKY HEADER STACK (Fixes Marquee overlap on Desktop) */}
      <header className="w-full sticky top-0 z-50 flex flex-col">
        {/* 🛡️ SHIELD 3: Prominent Pre-Launch Header Banner (Compliance & Legal Clarity) */}
        <div className="w-full bg-[#E02171] text-white text-[11px] sm:text-xs font-bold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs">
          <span>🎀</span>
          <span>
            <strong>PRE-LAUNCH AUDIT PREVIEW:</strong> Official store orders open <strong>after Razorpay audit is successful</strong>! Feel free to explore our collection.
          </span>
          <span>✨</span>
        </div>

        {/* 🌸 Infinite Scrolling Announcement Ticker */}
        {isMainSite && <MarqueeBar />}

        {/* 🎀 Navbar Rendering Logic */}
        {/* ✅ Main Site → Full Navbar */}
        {/* ✨ Launch Page → Minimal Navbar */}
        {/* ❌ Login Page → No Navbar */}
        {isMainSite ? (
          <Navbar />
        ) : isLaunch ? (
          <LaunchNavbar />
        ) : null}
      </header>

      <div className="w-full flex-grow flex flex-col">
        <Routes>

          {/* 🚀 Active Storefront Root: Open for public visitors & Razorpay compliance inspection */}
          <Route path="/" element={<Home />} />

          {/* 🚀 Root Route: Serves the Launch Countdown holding page */}
          {/*<Route path="/" element={<Launch />} />*/}
          
          {/* 🔓 Public Route: Login */}
          {/* 💡 If already logged in → redirect to Home */}
          <Route
            path="/login"
            element={user ? <Navigate to="/home" /> : <Login />}
          />

          {/* 🚀 Move Launch to its own dedicated dev preview path */}
          {/* ✨ Visitors can view the October 11, 2026 countdown here anytime! */}
          <Route path="/launch" element={<Launch />} />

          {/* 🏠 Home */}
          <Route path="/home" element={<Home />} />

          {/* 📄 About */}
          <Route path="/about" element={<About />} />

          {/* 🛍️ Shop (Publicly viewable for Razorpay website inspection) */}
          <Route path="/shop" element={<Shop />} />

          {/* 📦 Dedicated Single Item Viewer Description Details Sheet */}
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* 🛒 Cart */}
          <Route path="/cart" element={<Cart />} />

          {/* 💳 Checkout (Open for guest checkout & Razorpay audit review) */}
          <Route path="/checkout" element={<Checkout />} />

          {/* 🔐 Protected Routes (Personalized Accounts & Gamification) */}

          {/* 📸 Scrapbook */}
          <Route
            path="/scrapbook"
            element={
              <ProtectedRoute user={user}>
                <Scrapbook />
              </ProtectedRoute>
            }
          />

          {/* 📦 Order Confirmation */}
          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute user={user}>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />

          {/* 🕹️ Weekly Cyclone Game Module Shell Route */}
          <Route
            path="/game"
            element={
              <ProtectedRoute user={user}>
                <GameShell />
              </ProtectedRoute>
            }
          />

          {/* 🎀 Customer Profile & Order History */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* 🔝 Floating Up-Arrow Scroll to Top Button (Brand styled for mobile & desktop) */}
      {isMainSite && <ScrollToTopButton />}

      {/* 📱 2. Docked Bottom Nav on all storefront routes for mobile screens */}
      {isMainSite && <MobileBottomNav />}
      
    </div>
  );
}

function App() {
  return <Layout />;
}

export default App;