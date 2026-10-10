// src/components/MobileBottomNav.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Gamepad2,
  User,
  ChevronRight,
} from "lucide-react";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);

  // 🌸 Detect when any modal is open across the app
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkModal = () => {
      setIsModalOpen(document.body.classList.contains("modal-open"));
    };

    checkModal();

    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 🛑 Unmount bottom nav completely while any modal is active
  if (isModalOpen) return null;

  // Active indicator when playing the cyclone game route
  const isCycloneActive = location.pathname === "/game";

  const handleNavClick = (path) => {
    setIsGamesMenuOpen(false);
    navigate(path);
  };

  const handleBubblePopSelect = () => {
    setIsGamesMenuOpen(false);
    if (location.pathname === "/" || location.pathname === "/home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/home");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  };

  const handleCycloneSelect = () => {
    setIsGamesMenuOpen(false);
    navigate("/game");
  };

  return (
    <>
      {/* 🌸 POPUP DRAWER & BACKDROP FOR GAMES */}
      <AnimatePresence>
        {isGamesMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGamesMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Games Popup Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className="absolute bottom-20 left-4 right-4 max-w-sm mx-auto bg-white border-2 border-pink-200 rounded-[28px] p-4 shadow-2xl space-y-2.5 z-50 select-none overflow-hidden"
            >
              <div className="flex items-center justify-between pb-2 border-b border-pink-100">
                <div className="flex items-center gap-1.5">
                  <Gamepad2 size={16} className="text-[#E02171]" />
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Scrunchiefrills Arcade
                  </span>
                </div>
                <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                  Choose Game ✨
                </span>
              </div>

              <button
                type="button"
                onClick={handleBubblePopSelect}
                className="w-full p-3 rounded-2xl bg-[#FFF9FB] hover:bg-pink-50 border border-pink-100 hover:border-pink-300 transition-all flex items-center justify-between group cursor-pointer text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    🫧
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 group-hover:text-[#E02171] transition-colors leading-tight">
                      Weekly Bubble Pop Game
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Pop floating bubbles on the home hero & earn cards
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-pink-300 group-hover:text-[#E02171] group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>

              <button
                type="button"
                onClick={handleCycloneSelect}
                className="w-full p-3 rounded-2xl bg-[#FFF9FB] hover:bg-pink-50 border border-pink-100 hover:border-pink-300 transition-all flex items-center justify-between group cursor-pointer text-left active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    🌪️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900 group-hover:text-[#E02171] transition-colors leading-tight flex items-center gap-1">
                      The Cyclone Game
                      <span className="text-[9px] font-black uppercase text-[#E02171] bg-pink-100/80 px-1.5 py-0.2 rounded-full">
                        Hot
                      </span>
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Catch flying scrunchies & claim weekly rewards
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-pink-300 group-hover:text-[#E02171] group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📱 FIXED BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-[0_-4px_16px_rgba(224,33,113,0.06)] px-6 py-2 select-none">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* HOME */}
          <button
            onClick={() => handleNavClick("/home")}
            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95"
          >
            <div
              className={`p-1 rounded-full transition-colors ${
                location.pathname === "/home" || location.pathname === "/"
                  ? "text-[#E02171]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Home
                size={20}
                strokeWidth={
                  location.pathname === "/home" || location.pathname === "/"
                    ? 2.5
                    : 2
                }
                className={
                  location.pathname === "/home" || location.pathname === "/"
                    ? "fill-[#E02171]/15"
                    : ""
                }
              />
            </div>
            <span
              className={`text-[10px] tracking-tight ${
                location.pathname === "/home" || location.pathname === "/"
                  ? "text-[#E02171] font-black"
                  : "text-gray-400 font-bold"
              }`}
            >
              Home
            </span>
          </button>

          {/* SHOP */}
          <button
            onClick={() => handleNavClick("/shop")}
            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95"
          >
            <div
              className={`p-1 rounded-full transition-colors ${
                location.pathname.startsWith("/shop") ||
                location.pathname.startsWith("/product")
                  ? "text-[#E02171]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ShoppingBag
                size={20}
                strokeWidth={
                  location.pathname.startsWith("/shop") ||
                  location.pathname.startsWith("/product")
                    ? 2.5
                    : 2
                }
                className={
                  location.pathname.startsWith("/shop") ||
                  location.pathname.startsWith("/product")
                    ? "fill-[#E02171]/15"
                    : ""
                }
              />
            </div>
            <span
              className={`text-[10px] tracking-tight ${
                location.pathname.startsWith("/shop") ||
                location.pathname.startsWith("/product")
                  ? "text-[#E02171] font-black"
                  : "text-gray-400 font-bold"
              }`}
            >
              Shop
            </span>
          </button>

          {/* GAMES */}
          <button
            onClick={() => setIsGamesMenuOpen((prev) => !prev)}
            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 relative"
          >
            <div
              className={`p-1 rounded-full transition-colors ${
                isCycloneActive || isGamesMenuOpen
                  ? "text-[#E02171]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Gamepad2
                size={20}
                strokeWidth={isCycloneActive || isGamesMenuOpen ? 2.5 : 2}
                className={
                  isCycloneActive || isGamesMenuOpen ? "fill-[#E02171]/15" : ""
                }
              />
            </div>
            <span
              className={`text-[10px] tracking-tight flex items-center gap-0.5 ${
                isCycloneActive || isGamesMenuOpen
                  ? "text-[#E02171] font-black"
                  : "text-gray-400 font-bold"
              }`}
            >
              Games
            </span>
          </button>

          {/* PROFILE */}
          <button
            onClick={() => handleNavClick("/profile")}
            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95"
          >
            <div
              className={`p-1 rounded-full transition-colors ${
                location.pathname === "/profile"
                  ? "text-[#E02171]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <User
                size={20}
                strokeWidth={location.pathname === "/profile" ? 2.5 : 2}
                className={
                  location.pathname === "/profile" ? "fill-[#E02171]/15" : ""
                }
              />
            </div>
            <span
              className={`text-[10px] tracking-tight ${
                location.pathname === "/profile"
                  ? "text-[#E02171] font-black"
                  : "text-gray-400 font-bold"
              }`}
            >
              Profile
            </span>
          </button>

        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;