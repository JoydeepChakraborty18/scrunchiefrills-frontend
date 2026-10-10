import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Launch = () => {
  // 🎯 Updated Target Launch Date: October 10, 2026 at 11:30 AM IST
  const launchDate = new Date("2026-10-10T11:30:00+05:30");

  const [timeLeft, setTimeLeft] = useState({});
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  // ⏳ Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = launchDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✨ Cursor tracking
  useEffect(() => {
    const move = (e) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // 🧲 Magnetic helpers
  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

  const dx = cursor.x - centerX;
  const dy = cursor.y - centerY;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white">

      {/* 🌈 Background (very subtle parallax) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-pink-500 via-fuchsia-500 to-rose-500"
        animate={{
          x: dx * 0.003,
          y: dy * 0.003
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* 🎞 Grain Overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')"
        }}
      />

      {/* ✨ Cursor Glow */}
      <motion.div
        className="hidden md:block pointer-events-none fixed w-40 h-40 bg-white rounded-full opacity-20 blur-3xl"
        animate={{ x: cursor.x - 80, y: cursor.y - 80 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />

      {/* 💫 Floating Blob (medium parallax) */}
      <motion.div
        className="absolute w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-30"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          translateX: dx * 0.012,
          translateY: dy * 0.012
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          type: "spring",
          stiffness: 40
        }}
      />

      {/* 🌟 Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">

        {/* 🧲 Magnetic Title (reduced strength) */}
        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{
            opacity: 1,
            x: dx * 0.008,
            y: dy * 0.008
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-5xl md:text-6xl font-extrabold mb-4"
        >
          Scrunchiefrills
        </motion.h1>

        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          LAUNCHING SOON!
        </h2>

        {/* ⏳ Countdown (very subtle magnetic) */}
        <div className="flex justify-center gap-4 mb-8 text-center">
          {["days", "hours", "minutes", "seconds"].map((unit) => (
            <motion.div
              key={unit}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
              whileHover={{
                y: -6,
                rotate: [0, -1, 1, 0]
              }}
              style={{
                x: dx * 0.004,
                y: dy * 0.004
              }}
              className="bg-white/20 px-4 py-3 rounded-xl backdrop-blur-md"
            >
              <p className="text-2xl font-bold">{timeLeft[unit] || 0}</p>
              <p className="text-sm uppercase">{unit}</p>
            </motion.div>
          ))}
        </div>

        {/* ✍️ Tagline */}
        <p className="text-lg mb-8 leading-relaxed">
          Crown your curls with a neon-bright flare,<br/>
          The ultimate vibe for your everyday hair!<br/>
          Ditch the boring, let the funky frills play,<br/>
          Your "mane" character energy starts here today-<br/>
          Scrunchiefrills is landing, slay the 'frill' way!
        </p>


      </div>

      {/* ✨ Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Launch;