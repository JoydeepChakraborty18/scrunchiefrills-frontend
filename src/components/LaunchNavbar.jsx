import { motion } from "framer-motion";

const LaunchNavbar = () => {
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* 🎀 Brand Logo Image (Clicking scrolls cleanly to top) */}
        <img
          src="/images/ScrunchiefrillsTMLogoLargePink.png"
          alt="Scrunchiefrills"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="h-10 md:h-12 w-auto cursor-pointer object-contain transition-transform hover:scale-105"
        />

      </div>
    </motion.nav>
  );
};

export default LaunchNavbar;