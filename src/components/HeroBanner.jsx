import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * 🎀 Responsive Scrunchiefrills Hero Banner Component
 * Seamlessly swaps between desktop and mobile art-directed images
 * with independent negative-space positioning for headline and CTA.
 */
const HeroBanner = ({
  desktopSrc,
  mobileSrc,
  alt = "Scrunchiefrills Handcrafted Satin Scrunchies",
  textAlignment = "left", // 'left' (banners 1-4) or 'right' (banners 5-6)
  targetRoute = "/shop",
  priority = true,
}) => {
  const navigate = useNavigate();

  // Desktop horizontal alignment variant
  const desktopPosClass =
    textAlignment === "right"
      ? "md:left-auto md:right-8 lg:right-16 md:items-center text-center"
      : "md:left-8 lg:left-16 md:right-auto md:items-center text-center";

  return (
    <section className="relative w-full overflow-hidden select-none bg-[#FFF5F7]">
      {/* 🖼️ 1. ART-DIRECTED RESPONSIVE IMAGE SWITCHING */}
      <picture className="block w-full h-auto">
        {/* Desktop Viewport (>= 768px): Preserves wide 2:1 composition */}
        <source media="(min-width: 768px)" srcSet={desktopSrc} />
        {/* Mobile Viewport (< 768px): Dedicated 9:16 portrait composition */}
        <img
          src={mobileSrc}
          alt={alt}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-auto block object-cover"
        />
      </picture>

      {/* 🏷️ 2 & 3. DYNAMIC OVERLAY CONTAINER (Positioned in Negative Space) */}
      <div
        className={`absolute inset-x-0 top-0 flex flex-col items-center z-20 
          /* Mobile: Centered in top negative space */
          pt-[8%] sm:pt-[10%] px-4 w-full
          /* Desktop: Shifted to designated left/right negative space */
          md:top-1/2 md:-translate-y-1/2 md:pt-0 md:w-[46%] lg:w-[42%] max-w-[540px]
          ${desktopPosClass}`}
      >
        {/* 🌟 Layered Hand-Drawn Headline Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-[82%] sm:w-[72%] md:w-full flex justify-center"
        >
          <img
            src="/images/HeroSectionText.png"
            alt="A Little Happier Everyday — Handmade satin scrunchies for your main character days (and messy hair days)"
            className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_6px_20px_rgba(224,33,113,0.22)]"
          />
        </motion.div>

        {/* 🛍️ Functional Glossy "SHOP NOW" Action Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(targetRoute)}
          aria-label="Shop Now - View Satin Scrunchies Collection"
          className="mt-3 sm:mt-4 md:mt-6 w-[56%] sm:w-[46%] md:w-[62%] max-w-[260px] 
            cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E02171] 
            rounded-full transition-transform duration-200"
        >
          <img
            src="/images/HeroSectionShopNowButton.png"
            alt="Shop Now"
            className="w-full h-auto object-contain block drop-shadow-[0_8px_24px_rgba(224,33,113,0.35)]"
          />
        </motion.button>
      </div>
    </section>
  );
};

export default HeroBanner;