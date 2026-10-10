import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import BestsellerCarousel from "../components/BestsellerCarousel";
import Hero from "../components/Hero";
import Footer from "../sections/Footer";
import InstagramFeed from "../sections/InstagramFeed";
import Quiz from "../sections/Quiz";

const Home = () => {
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate how close the user is to the bottom of the page
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomThreshold = document.documentElement.scrollHeight - 350; // Vanishes ~350px before footer

      if (scrollPosition >= bottomThreshold) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col justify-between relative">

      {/* 🔥 HERO SECTION */}
      <Hero />

      {/* 💖 BESTSELLERS */}
      <section className="py-12 sm:py-16 md:py-20 text-center bg-[#FFF2F8] relative overflow-hidden">

        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-center bg-cover opacity-30 pointer-events-none select-none"
          style={{ backgroundImage: "url('/images/bestsellers-banner.jpg')" }}
        />

        {/* Content */}
        <div className="relative z-10 w-full">
          <BestsellerCarousel />
        </div>
      </section>

      {/* 🎯 QUIZ */}
      <section className="bg-white text-center w-full">
        <Quiz />
      </section>

      {/* 📸 INSTAGRAM SECTION */}
      <section className="bg-white text-center w-full">
        <InstagramFeed />
      </section>

      {/* 🔻 FOOTER */}
      <Footer />

      {/* 🔽 MINIMAL FLOATING DOWN ARROW INDICATOR */}
      <AnimatePresence>
        {showScrollArrow && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            /* 🔽 Raised on mobile (bottom-24) to clear the bottom nav, bottom-6 on desktop */
            className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <button
              onClick={handleScrollDown}
              aria-label="Scroll down to explore"
              className="group flex flex-col items-center justify-center p-2 rounded-full bg-white/75 backdrop-blur-md border border-pink-200/80 shadow-[0_4px_16px_rgba(224,33,113,0.25)] text-[#E02171] hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={20} strokeWidth={3} />
              </motion.div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;