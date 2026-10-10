import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import LaunchNavbar from "./components/LaunchNavbar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import About from "./pages/About";
import Cart from "./pages/Cart"; // ✅ Imported Cart
import Home from "./pages/Home";
import Launch from "./pages/Launch";
import Login from "./pages/Login";
import Scrapbook from "./pages/Scrapbook";
import Shop from "./pages/Shop"; // ✅ Imported Shop
import ProductDetail from "./pages/ProductDetail"; // ✅ Wired up description page component
import GameShell from "./pages/GameShell"; // 🕹️ Imported Game Shell Module

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
        // 🔥 AUTO CREATE USER DOC (ONLY IF NOT EXISTS)
        await ensureUserDoc(currentUser);
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
  const mainRoutes = ["/home", "/about", "/shop", "/scrapbook", "/cart", "/game"]; // ✅ Added /game route to mainRoutes to render full navbar layout safely
  //const launchRoutes = ["/launch"];
  //const launchRoutes = ["/"]; // ✅ Adjusted group detection to match root path

  // 🎯 Route Detection Logic
  const isMainSite = mainRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  //const isLaunch = launchRoutes.includes(location.pathname);
  const isLaunch = location.pathname === "/" || location.pathname === "/launch"; // ✅ Launch page is active on "/" as well as "/launch"
  //const isLaunch = location.pathname === "/launch";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">

      {/* 🎀 Navbar Rendering Logic */}
      {/* ✅ Main Site → Full Navbar */}
      {/* ✨ Launch Page → Minimal Navbar */}
      {/* ❌ Login Page → No Navbar */}
      {isMainSite ? (
        <Navbar />
      ) : isLaunch ? (
        <LaunchNavbar />
      ) : null}

      <Routes>

        {/* 🚀 Default Route: Directs visitors straight to the Launch page */}
        <Route path="/" element={<Launch />} />

        {/* 🚀 Move Launch to its own dedicated dev preview path */}
        {/* ✨ Visitors will now immediately see your updated September 2026 countdown! */}
        <Route path="/launch" element={<Launch />} />
        
        {/* 🔓 Public Route: Login */}
        {/* 💡 If already logged in → redirect to Home */}
        <Route
          //path="/"
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login />}
        />
        

        {/* 🔐 Protected Routes */}

        {/* 🏠 Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* 📄 About */}
        <Route
          path="/about"
          element={
            <ProtectedRoute user={user}>
              <About />
            </ProtectedRoute>
          }
        />

        {/* 🛍️ Shop */}
        <Route
          path="/shop"
          element={
            <ProtectedRoute user={user}>
              <Shop />
            </ProtectedRoute>
          }
        />

        {/* 📦 Dedicated Single Item Viewer Description Details Sheet */}
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute user={user}>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        {/* 📸 Scrapbook */}
        <Route
          path="/scrapbook"
          element={
            <ProtectedRoute user={user}>
              <Scrapbook />
            </ProtectedRoute>
          }
        />

        {/* 🛒 Cart */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute user={user}>
              <Cart />
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

        {/* 🚀 Public Route: Launch */}
        <Route path="/launch" element={<Launch />} />
      </Routes>
    </div>
  );
}

function App() {
  return <Layout />;
}

export default App;