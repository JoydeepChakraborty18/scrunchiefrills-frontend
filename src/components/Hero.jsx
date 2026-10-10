import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Bubbles from "./Bubbles";
import AuthModal from "./AuthModal";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 📂 Master Image Array: files located at public/images/ScrunchieStack/
const stackImages = [
  "/images/ScrunchieStack/scrunchiePackaging.jpeg",
  "/images/ScrunchieStack/scrunchieSticker.jpeg",
  "/images/ScrunchieStack/scrunchieSticker2.jpeg",
  "/images/ScrunchieStack/scrunchieSticker3.jpeg",
  "/images/ScrunchieStack/scrunchiefrillsBrandStickers.jpeg",
  "/images/ScrunchieStack/singleScrunchiePackaging.jpeg",
  "/images/ScrunchieStack/scrunchiefrillsBrandPackets.jpeg",
  "/images/ScrunchieStack/scrunchieStickers.jpeg",
  "/images/ScrunchieStack/packedScrunchies.jpeg",
  "/images/ScrunchieStack/scrunchiefrillsVibe.jpeg"
];

// 🎀 Hairstyle options to cycle randomly every 5 seconds
const hairstyles = ["Messy Bun!", "Ponytail!", "Pigtails!", "Horsetail!", "Braids!"];

// 🖼️ Master Responsive Hero Banners (Switches between Desktop & Mobile automatically)
const heroBanners = [
  {
    desktop: "/images/Scrunchiefrills_Website_Hero.png",
    mobile: "/images/Scrunchiefrills_Website_Hero.png",
    alt: "Scrunchiefrills Original Doodle Pattern Hero Banner"
  },
  {
    desktop: "/images/DesktopHeroBanners/desktopHeroBanner1.png",
    mobile: "/images/MobileHeroBanners/mobileHeroBanner1.png",
    alt: "Scrunchiefrills Pink Edition - Watermelon & Fruity Satin Scrunchies"
  },
  {
    desktop: "/images/DesktopHeroBanners/desktopHeroBanner2.png",
    mobile: "/images/MobileHeroBanners/mobileHeroBanner2.png",
    alt: "Scrunchiefrills Galaxy Edition - Starry Night Dream Scrunchie"
  },
  {
    desktop: "/images/DesktopHeroBanners/desktopHeroBanner3.png",
    mobile: "/images/MobileHeroBanners/mobileHeroBanner3.png",
    alt: "Scrunchiefrills Bubble Pop Blue Edition"
  },
  {
    desktop: "/images/DesktopHeroBanners/desktopHeroBanner4.png",
    mobile: "/images/MobileHeroBanners/mobileHeroBanner4.png",
    alt: "Scrunchiefrills Squad Edition - Funky Satin Hair Scrunchies"
  },
  {
    desktop: "/images/DesktopHeroBanners/desktopHeroBanner5.png",
    mobile: "/images/MobileHeroBanners/mobileHeroBanner5.png",
    alt: "Scrunchiefrills Duo Edition - Playful Hairstyles"
  },
  {
    desktop: "/images/DesktopHeroBanners/desktopHerobanner6.png",
    mobile: "/images/MobileHeroBanners/mobileHeroBanner6.png",
    alt: "Scrunchiefrills Mommy & Me Satin Hair Bun Collection"
  },
];

// 🎞️ Smooth Sassbar-style Slide Variants (Right to Left translation)
const bannerVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    x: "0%",
    opacity: 1,
    transition: {
      x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.8 },
      opacity: { duration: 0.3 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 1,
    transition: {
      x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.8 },
      opacity: { duration: 0.3 },
    },
  }),
};

export default function Hero() {
  const navigate = useNavigate();

  // 🏰 HERO REFS & ANIMATION CONTROLS
  const controls = useAnimation();
  const heroRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // 🔐 Inline Auth Modal state for guest bubble clicks
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 🔄 Hero Banner slide rotation state (Right-to-Left carousel, 5s interval)
  const [[currentBannerIndex, direction], setPage] = useState([0, 1]);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = (newDirection) => {
    setPage(([prevIndex]) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = heroBanners.length - 1;
      if (nextIndex >= heroBanners.length) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  };

  useEffect(() => {
    if (!heroBanners || heroBanners.length <= 1 || isPaused) return;

    const bannerTimer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(bannerTimer);
  }, [currentBannerIndex, isPaused]);

  // 🔄 Image rotation state (Cycles emblem images every 5 seconds)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!stackImages || stackImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % stackImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // 🔄 Rolling typography controller
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);

  useEffect(() => {
    const FIVE_SECONDS = 5 * 1000;
    const interval = setInterval(() => {
      setCurrentStyleIndex((prev) => (prev + 1) % hairstyles.length);
    }, FIVE_SECONDS);

    return () => clearInterval(interval);
  }, []);

  // 🔥 HOVER EFFECTS
  const handleHoverStart = async () => {
    setHovered(true);
    await controls.start({
      rotate: 0,
      boxShadow: "0px 4px 10px #E02171",
      transition: { duration: 0.3 },
    });
  };

  const handleHoverEnd = async () => {
    setHovered(false);
    await controls.start({
      rotate: -10,
      boxShadow: "0px 10px 30px #E02171",
      transition: { duration: 0.3 },
    });

    controls.start({
      rotate: [-10, 6, -4, 3, -2, -10],
      transition: { duration: 2 },
    });
  };

  return (
    <>
      <motion.section
        ref={heroRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="min-h-screen w-full flex flex-col md:flex-row items-center justify-between px-5 sm:px-8 md:px-12 pt-28 md:pt-16 pb-12 overflow-hidden relative"
      >
        {/* 🖼️ SASSBAR-STYLE RIGHT-TO-LEFT SLIDING HERO BANNER BACKGROUND */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
          <AnimatePresence initial={false} custom={direction}>
            <motion.picture
              key={currentBannerIndex}
              custom={direction}
              variants={bannerVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full block"
            >
              <source
                media="(min-width: 768px)"
                srcSet={heroBanners[currentBannerIndex].desktop}
              />
              <img
                src={heroBanners[currentBannerIndex].mobile}
                alt={heroBanners[currentBannerIndex].alt}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </motion.picture>
          </AnimatePresence>
        </div>

        {/* 🫧 INTERACTIVE BUBBLES WITH INLINE AUTH CALLBACK */}
        <Bubbles onAuthRequired={() => setIsAuthModalOpen(true)} />

        {/* 📝 LEFT/MAIN CONTENT */}
        <div className="max-w-xl z-10 text-center md:text-left flex flex-col items-center md:items-start w-full">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight select-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: [0, -5, 0] }}
            transition={{
              opacity: { duration: 0.8 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <span className="text-white">Pamper Your </span>

            {/* 🎡 Rolling Typography Viewport */}
            <span className="inline-block relative overflow-hidden align-baseline h-[1.22em] -mb-[0.2em]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={hairstyles[currentStyleIndex]}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-110%", opacity: 0 }}
                  transition={{
                    duration: 5.0,
                    ease: [0.12, 0.95, 0.18, 1],
                  }}
                  className="text-white italic inline-block cursor-pointer px-1 whitespace-nowrap drop-shadow-none"
                  whileHover={{ scale: 1.08, y: -2 }}
                >
                  {hairstyles[currentStyleIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* 💬 FLUID SPEECH BUBBLES */}
          <div className="mt-6 flex flex-col items-center md:items-start gap-2.5 w-full max-w-sm sm:max-w-md">
            <span className="w-full text-center md:text-left bg-[#E02171]/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-md text-xs sm:text-sm font-bold text-white leading-snug">
              Scrunchies that hype your hustle,
            </span>
            <span className="w-full text-center md:text-left bg-[#E02171]/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-md text-xs sm:text-sm font-bold text-white leading-snug">
              match your mood,
            </span>
            <span className="w-full text-center md:text-left bg-[#E02171]/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-md text-xs sm:text-sm font-bold text-white leading-snug">
              and turn everyday hair into a whole vibe!
            </span>
          </div>

          {/* 🛍️ "SHOP THE VIBE" BUTTON */}
          <motion.button
            animate={controls}
            initial={{ rotate: -10, boxShadow: "0px 10px 30px #E02171" }}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
            className="mt-8 bg-[#E02171] px-8 py-4 sm:px-10 sm:py-5 rounded-full font-black tracking-wide uppercase text-xs sm:text-sm shadow-xl cursor-pointer select-none"
            onClick={() => navigate("/shop")}
          >
            <motion.span
              animate={{
                rotate: hovered ? 0 : -10,
                scale: hovered ? 1.15 : 1,
              }}
              className={`text-white inline-block ${hovered ? "" : "italic"}`}
              style={{
                textShadow: hovered
                  ? "0 0 4px rgba(255,255,255,0.4)"
                  : "0 0 10px rgba(255,255,255,0.9)",
              }}
            >
              Shop the Vibe 🌸
            </motion.span>
          </motion.button>
        </div>

        {/* ⭕ RIGHT SIDE EMBLEM */}
        <div className="relative mt-8 md:mt-0 z-10 flex justify-center items-center">
          <div 
            onClick={() => navigate("/shop")}
            className="w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-scrunchiePink rounded-full flex items-center justify-center border-[6px] sm:border-[8px] border-[#E02171] shadow-[4px_4px_0px_#990B42,0_8px_24px_rgba(224,33,113,0.4)] select-none overflow-hidden relative cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#990B42,0_12px_28px_rgba(224,33,113,0.5)]"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={stackImages[currentImageIndex]}
                alt="Scrunchie Stack Featured Item"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* 🧭 CAROUSEL CONTROLS */}
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/75 hover:bg-white text-gray-800 items-center justify-center shadow-lg backdrop-blur-xs transition z-20 cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/75 hover:bg-white text-gray-800 items-center justify-center shadow-lg backdrop-blur-xs transition z-20 cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>

        {/* ⚪ SLIDESHOW INDICATOR DOTS */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 select-none">
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const diff = idx - currentBannerIndex;
                if (diff !== 0) {
                  setPage([idx, diff > 0 ? 1 : -1]);
                }
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentBannerIndex
                  ? "w-7 sm:w-9 h-2.5 bg-[#E02171] shadow-sm"
                  : "w-2.5 h-2.5 bg-white/80 hover:bg-white"
              }`}
            />
          ))}
        </div>

        {/* ⭐ FLOATING ICONS */}
        <motion.div
          className="absolute top-20 sm:top-24 left-4 sm:left-10 text-2xl sm:text-4xl z-10 select-none pointer-events-none"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          ⭐
        </motion.div>

        <motion.div
          className="absolute bottom-16 sm:bottom-20 right-6 sm:right-20 text-2xl sm:text-4xl z-10 select-none pointer-events-none"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🚀
        </motion.div>
      </motion.section>

      {/* 🔐 INLINE AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}