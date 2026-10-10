// src/components/Navbar.jsx
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { auth } from "../firebase";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const totalItems = (cart || []).reduce((acc, item) => acc + item.quantity, 0);

  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 🎮 Games Desktop Dropdown & Mobile Submenu State
  const [isDesktopGamesOpen, setIsDesktopGamesOpen] = useState(false);
  const [isMobileGamesOpen, setIsMobileGamesOpen] = useState(false);
  const gamesDropdownRef = useRef(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setIsMobileOpen(false);
    setIsDesktopGamesOpen(false);
    setIsMobileGamesOpen(false);
  }, [location.pathname]);

  // Dismiss desktop dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        gamesDropdownRef.current &&
        !gamesDropdownRef.current.contains(e.target)
      ) {
        setIsDesktopGamesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = (path) =>
    `transition font-bold uppercase tracking-wider text-xs md:text-sm ${
      location.pathname === path
        ? "text-[#E02171] font-black underline underline-offset-4"
        : "text-gray-700 hover:text-[#E02171]"
    }`;

  const isGamesActive = location.pathname === "/game";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserIconClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // 🫧 Bubble Pop game: Scroll smoothly to Home Hero
  const handleBubblePopSelect = () => {
    setIsDesktopGamesOpen(false);
    setIsMobileOpen(false);
    if (location.pathname === "/" || location.pathname === "/home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/home");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  };

  // 🌪️ Cyclone game: Route to /game
  const handleCycloneSelect = () => {
    setIsDesktopGamesOpen(false);
    setIsMobileOpen(false);
    navigate("/game");
  };

  return (
    <>
      <nav className="w-full bg-white/90 backdrop-blur-xl shadow-sm border-b border-pink-100 select-none">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">

          {/* Logo -> Home */}
          <div onClick={() => navigate("/home")} className="cursor-pointer flex items-center select-none">
            <img
              src="/images/ScrunchiefrillsTMLogoLargePink.png"
              alt="Registered Trademark Scrunchiefrills Logo"
              className="h-9 md:h-12 object-contain"
            />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 font-medium">
            <button onClick={() => navigate("/home")} className={linkClass("/home")}>
              Home
            </button>

            <Link to="/shop" className={linkClass("/shop")}>
              Shop
            </Link>

            {/* 🎮 Desktop Games Dropdown */}
            <div className="relative" ref={gamesDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDesktopGamesOpen((prev) => !prev)}
                className={`transition font-bold uppercase tracking-wider text-xs md:text-sm flex items-center gap-1 cursor-pointer ${
                  isGamesActive || isDesktopGamesOpen
                    ? "text-[#E02171] font-black"
                    : "text-gray-700 hover:text-[#E02171]"
                }`}
              >
                Games
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    isDesktopGamesOpen ? "rotate-180 text-[#E02171]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isDesktopGamesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white border-2 border-pink-100 rounded-2xl p-2 shadow-xl z-50 space-y-1"
                  >
                    {/* Option 1: Bubble Pop */}
                    <button
                      type="button"
                      onClick={handleBubblePopSelect}
                      className="w-full p-2.5 rounded-xl hover:bg-[#FFF9FB] transition flex items-center gap-3 text-left cursor-pointer group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                        🫧
                      </span>
                      <div>
                        <span className="text-xs font-black text-gray-900 group-hover:text-[#E02171] transition-colors block leading-tight">
                          Bubble Pop Game
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium block normal-case">
                          Weekly collectible cards
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Cyclone Game */}
                    <button
                      type="button"
                      onClick={handleCycloneSelect}
                      className="w-full p-2.5 rounded-xl hover:bg-[#FFF9FB] transition flex items-center gap-3 text-left cursor-pointer group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                        🌪️
                      </span>
                      <div>
                        <span className="text-xs font-black text-gray-900 group-hover:text-[#E02171] transition-colors flex items-center gap-1 leading-tight">
                          The Cyclone Game
                          <span className="text-[8px] font-black uppercase text-[#E02171] bg-pink-100 px-1 py-0.2 rounded-full">
                            Hot
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium block normal-case">
                          Catch scrunchies for prizes
                        </span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/scrapbook" className={linkClass("/scrapbook")}>
              Scrapbook
            </Link>

            <Link to="/about" className={linkClass("/about")}>
              About
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            
            {/* Cart */}
            <Link to="/cart" className="relative p-1.5 rounded-full hover:bg-pink-50 transition" title="Shopping Cart">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-gray-800 hover:text-[#E02171] transition" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E02171] text-white text-[10px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Profile Icon */}
            <button
              onClick={handleUserIconClick}
              className={`p-1.5 rounded-full border transition flex items-center justify-center cursor-pointer ${
                location.pathname === "/profile"
                  ? "border-[#E02171] bg-pink-50 text-[#E02171]"
                  : "border-pink-200 bg-white text-gray-700 hover:border-[#E02171] hover:text-[#E02171]"
              }`}
              title={user ? "My Profile & Orders" : "Sign In / Register"}
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Desktop Auth Button */}
            {user ? (
              <button
                onClick={handleLogout}
                className="hidden md:block px-3.5 py-1.5 rounded-lg bg-gray-900 text-white font-black text-xs uppercase tracking-wider hover:bg-[#E02171] transition shadow-sm cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:block px-3.5 py-1.5 rounded-lg bg-[#E02171] text-white font-black text-xs uppercase tracking-wider hover:bg-[#c71761] transition shadow-sm cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="p-1 rounded-lg text-gray-800 hover:text-[#E02171] md:hidden focus:outline-none cursor-pointer"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Animated Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-2xl border-t border-pink-100 shadow-xl"
            >
              <div className="flex flex-col px-6 py-5 space-y-4 text-left">
                <button 
                  onClick={() => navigate("/home")} 
                  className={`text-left ${linkClass("/home")}`}
                >
                  Home
                </button>

                <Link to="/shop" className={linkClass("/shop")}>
                  Shop
                </Link>

                {/* Mobile Games Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsMobileGamesOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-xs text-gray-700 hover:text-[#E02171] py-1 cursor-pointer"
                  >
                    <span>Games</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isMobileGamesOpen ? "rotate-180 text-[#E02171]" : ""
                      }`}
                    />
                  </button>

                  {isMobileGamesOpen && (
                    <div className="pl-4 pt-2 space-y-2.5">
                      <button
                        type="button"
                        onClick={handleBubblePopSelect}
                        className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-[#E02171]"
                      >
                        <span>🫧</span> Weekly Bubble Pop Game
                      </button>
                      <button
                        type="button"
                        onClick={handleCycloneSelect}
                        className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-[#E02171]"
                      >
                        <span>🌪️</span> The Cyclone Game
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/scrapbook" className={linkClass("/scrapbook")}>
                  Scrapbook
                </Link>

                <Link to="/about" className={linkClass("/about")}>
                  About
                </Link>

                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    handleUserIconClick();
                  }}
                  className="text-left text-xs font-black uppercase tracking-wider text-gray-700 hover:text-[#E02171] py-1 cursor-pointer"
                >
                  {user ? "My Profile & Orders" : "Sign In / Join"}
                </button>

                <div className="pt-3 border-t border-pink-100">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-xs font-black uppercase tracking-wider text-rose-600 py-1 cursor-pointer"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full text-left text-xs font-black uppercase tracking-wider text-[#E02171] py-1 cursor-pointer"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 🔐 Reusable Inline Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (location.pathname === "/") {
            navigate("/home");
          }
        }}
      />
    </>
  );
};

export default Navbar;