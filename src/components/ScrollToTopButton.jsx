import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate how close the user is to the bottom
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show when scrolled down at least 400px AND within 600px of the bottom (or past 60% of page)
      const nearBottom = scrollY + windowHeight >= documentHeight - 600;
      const scrolledDown = scrollY > 400;

      setIsVisible(nearBottom || (scrolledDown && scrollY + windowHeight >= documentHeight - 150));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-20 md:bottom-8 right-5 sm:right-8 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E02171] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(224,33,113,0.45)] hover:shadow-[0_6px_28px_rgba(224,33,113,0.65)] hover:bg-[#c71761] transition-colors cursor-pointer border-2 border-white/80 backdrop-blur-xs select-none"
        >
          <ArrowUp size={22} strokeWidth={2.8} className="animate-bounce" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}