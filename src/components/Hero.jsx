import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Bubbles from "./Bubbles";
import { useNavigate } from "react-router-dom"; // ✅ Import routing hook

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

// 🎀 Hairstyle options to cycle randomly every 10 minutes
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

export default function Hero() {
  const navigate = useNavigate(); // ✅ Initialize routing instance

  // =====================================
  // 🏰 HERO REFS & ANIMATION CONTROLS
  // =====================================
  const controls = useAnimation();
  const heroRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // 🔄 Hero Banner slide rotation state (Cycles every 6 seconds)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (!heroBanners || heroBanners.length <= 1) return;

    const bannerTimer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000); // ⏱️ Rotates banner every 6 seconds

    return () => clearInterval(bannerTimer);
  }, []);

  // 🔄 Image rotation state (Cycles every 5 seconds)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!stackImages || stackImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % stackImages.length);
    }, 5000); // ⏱️ 5000ms = 5 seconds

    return () => clearInterval(timer);
  }, []);

  // 🔄 SMOOTH ROLLING TYPOGRAPHY CONTROLLER
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);

  useEffect(() => {
    const FIVE_SECONDS = 5 * 1000;

    const interval = setInterval(() => {
      // Guaranteed distinct: cleanly advances to the next hairstyle in order
      setCurrentStyleIndex((prev) => (prev + 1) % hairstyles.length);
    }, FIVE_SECONDS);

    return () => clearInterval(interval);
  }, []);

  // =====================================
  // 🔥 HOVER EFFECTS
  // =====================================
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
    // =====================================
    // 🖼️ RESPONSIVE HERO SECTION CONTAINER
    // =====================================
    <motion.section
      ref={heroRef}
      className="min-h-screen w-full flex flex-col md:flex-row items-center justify-between px-5 sm:px-8 md:px-12 pt-28 md:pt-16 pb-12 overflow-hidden relative"
    >
      {/* 🖼️ DYNAMIC ART-DIRECTED HERO BANNER BACKGROUND */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
        <AnimatePresence mode="wait">
          <motion.picture
            key={currentBannerIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="block w-full h-full"
          >
            {/* Desktop Viewport (>= 768px): Serves 2:1 landscape banner */}
            <source
              media="(min-width: 768px)"
              srcSet={heroBanners[currentBannerIndex].desktop}
            />
            {/* Mobile Viewport (< 768px): Serves 9:16 portrait banner */}
            <img
              src={heroBanners[currentBannerIndex].mobile}
              alt={heroBanners[currentBannerIndex].alt}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </motion.picture>
        </AnimatePresence>
      </div>

      {/* 🫧 INTERACTIVE BUBBLES */}
      <Bubbles />

      {/* 📝 LEFT/MAIN CONTENT */}
      <div className="max-w-xl z-10 text-center md:text-left flex flex-col items-center md:items-start w-full">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-black text-scrunchiePurple leading-tight select-none"
          style={{ textShadow: "3px 3px 10px #E02171, 0 0 12px #E02171" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.8 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <span className="text-[#FFF2F8]">Pamper Your </span>

          {/* 🎡 Slow, Deliberate Rolling Typography Viewport */}
          <span className="inline-block relative overflow-hidden align-baseline h-[1.22em] -mb-[0.2em]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={hairstyles[currentStyleIndex]}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-110%", opacity: 0 }}
                transition={{
                  duration: 5.0, // Slow, deliberate roll duration
                  ease: [0.12, 0.95, 0.18, 1], // Smooth, cinematic deceleration curve
                }}
                className="text-[#C00E58] italic inline-block cursor-pointer px-1 whitespace-nowrap"
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
          onClick={() => navigate("/shop")} // ✅ Redirects to /shop
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

      {/* ⭕ RIGHT SIDE EMBLEM (CYCLES IMAGES EVERY 5 SECONDS) */}
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
                // Graceful fallback: hides broken image frame if a path is incorrect
                e.target.style.display = "none";
              }}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* ⭐ FLOATING ICONS (Optimized for Mobile Boundaries) */}
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
  );
}