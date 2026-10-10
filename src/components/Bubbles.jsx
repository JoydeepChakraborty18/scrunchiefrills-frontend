import { doc, onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { auth, db } from "../firebase";
import toast from "react-hot-toast"; // 🍞 Toast feedback for guest interactions

// ✅ CENTRALIZED LOGIC (FIX)
import { bubbleCards } from "../data/bubbleCards";
import { handleBubbleDrop } from "../utils/dropLogic";

export default function Bubbles({ onAuthRequired }) {
  const navigate = useNavigate(); // ✅ Initialize navigate
  const engineRef = useRef(null);
  const frameRef = useRef(null);
  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const popAudioRef = useRef(null);
  const revealAudioRef = useRef(null);

  const [bubbles, setBubbles] = useState([]);
  const [particles, setParticles] = useState([]);
  const particlesRef = useRef([]); // ✅ FIX: stable particle state

  const [popCount, setPopCount] = useState(0);
  const [activeCard, setActiveCard] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false); // 💡 Instructions modal toggle

  // 🚫 LIMIT STATE
  const [isLimitReached, setIsLimitReached] = useState(false);

  // 📡 REAL-TIME WEEKLY LISTENER
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const getWeek = () => {
      const d = new Date();
      const oneJan = new Date(d.getFullYear(), 0, 1);
      return `${d.getFullYear()}-W${Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7)}`;
    };

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentWeek = getWeek();
        const WEEKLY_LIMIT = 3;

        // Reset local popCount and limits if a new week has started
        if (data.lastWeek !== currentWeek) {
          setPopCount(0);
          setIsLimitReached(false);
        } else {
          // Sync local popCount with the weekly progress from DB
          const weeklyPops = data.weeklyPopTotal || 0;
          setPopCount(weeklyPops);
          
          if (data.weeklyDrops >= WEEKLY_LIMIT) {
            setIsLimitReached(true);
            setBubbles([]); // Remove all bubbles immediately
          } else {
            setIsLimitReached(false);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🫧 CREATE BUBBLE (RESPONSIVE VIEWPORT SCALING)
  const createBubble = (id, world) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    // 📱 Mobile: 65px - 100px | 💻 Desktop: 120px - 200px
    const size = isMobile 
      ? Math.random() * 35 + 65 
      : Math.random() * 80 + 120;

    const body = Matter.Bodies.circle(
      Math.random() * width,
      Math.random() * height,
      size / 2,
      {
        restitution: 0.98,
        friction: 0,
        frictionAir: 0.0005,
      }
    );

    // 🚀 INITIAL VELOCITY
    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * (isMobile ? 2 : 3),
      y: (Math.random() - 0.5) * (isMobile ? 1.5 : 2),
    });

    Matter.World.add(world, body);

    return {
      id,
      body,
      size,
      depth: Math.random() * 0.25 + 0.75,
      seed: Math.random() * 1000,
      wobble: 0,
    };
  };

  // 💥 PARTICLES (FIXED)
  const createParticles = (x, y, size) => {
    const count = Math.floor(Math.random() * 6) + 8;

    const newParticles = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3 + 2;

      return {
        id: `${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        size: Math.random() * (size / 6) + 5,
      };
    });

    const updated = [...particlesRef.current, ...newParticles];
    particlesRef.current = updated;
    setParticles(updated);
  };

  // 🔊 SAFE SOUND
  const playSound = (audioRef) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0; 
    audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    // 🔊 PRELOAD
    popAudioRef.current = new Audio("/sounds/bubble_pop.mp3");
    popAudioRef.current.preload = "auto";

    revealAudioRef.current = new Audio("/sounds/magical_reveal.mp3");
    revealAudioRef.current.preload = "auto";

    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0;
    engineRef.current = engine;

    const world = engine.world;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 🧱 WALLS
    const walls = [
      Matter.Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true }),
      Matter.Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true }),
      Matter.Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true }),
      Matter.Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true }),
    ];

    Matter.World.add(world, walls);

    // 🫧 INITIAL BUBBLES (16 on mobile for performance, 24 on desktop)
    const initialBubbleCount = width < 768 ? 16 : 24;
    const initial = Array.from({ length: initialBubbleCount }, (_, i) =>
      createBubble(i, world)
    );

    setBubbles(initial);

    const update = () => {
      Matter.Engine.update(engine);

      const time = Date.now() * 0.001;

      // 🫧 MOTION
      setBubbles((prev) => 
        prev.map((b) => {
          const body = b.body;

          Matter.Body.applyForce(body, body.position, {
            x: Math.sin(time + b.seed) * 0.00004,
            y: Math.cos(time + b.seed) * 0.00004,
          });

          const speed = Math.sqrt(
            body.velocity.x ** 2 + body.velocity.y ** 2
          );

          if (speed < 1.2) {
            const angle = Math.random() * Math.PI * 2;
            Matter.Body.setVelocity(body, {
              x: Math.cos(angle) * 2,
              y: Math.sin(angle) * 2,
            });
          }

          const dx = body.position.x - mouseRef.current.x;
          const dy = body.position.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            Matter.Body.applyForce(body, body.position, {
              x: dx * 0.00004,
              y: dy * 0.00004,
            });
          }

          return { ...b, wobble: speed * 0.5 };
        })
      );

      // 💥 PARTICLES UPDATE
      const updatedParticles = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.02,
          life: p.life - 0.02,
        }))
        .filter((p) => p.life > 0);

      particlesRef.current = updatedParticles;
      setParticles(updatedParticles);

      frameRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      Matter.World.clear(world);
      Matter.Engine.clear(engine);
    };
  }, []);

  // 💥 POP LOGIC
  const popBubble = (e, bubble) => {
    if (e) e.stopPropagation(); 

    // 🔒 GUEST GUARD: Prompt inline modal if not signed in
    if (!auth.currentUser) {
      toast("Sign in to pop bubbles & collect your weekly Bubble Cards! 🎀", {
        icon: "👑",
        id: "bubble-guest-auth",
      });

      if (typeof onAuthRequired === "function") {
        onAuthRequired();
      } else {
        navigate("/login");
      }
      return;
    }

    if (!bubble || bubble._popped || isLimitReached) return;

    bubble._popped = true;

    // ⚡ INSTANT FEEDBACK
    playSound(popAudioRef);
    createParticles(
      bubble.body.position.x,
      bubble.body.position.y,
      bubble.size
    );

    const world = engineRef.current.world;
    Matter.World.remove(world, bubble.body);
    
    // Remove from state immediately
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    // ✅ FIX: Calculate exactly when to drop and pass currentPopCount
    const newCount = popCount + 1;
    setPopCount(newCount);

    if (newCount % 5 === 0) {
      handleBubbleDrop({
        currentPopCount: newCount, // ✅ Pass actual current count
        setRevealedCard: (card) => {
          const id = typeof card === 'object' ? card.id : card;
          if (!id || !bubbleCards[id]) return;

          setActiveCard({
            ...bubbleCards[id],
            ...card
          });

          playSound(revealAudioRef);
        },
      });
    }

    // Respawn a replacement if limit not hit
    setTimeout(() => {
      if (!isLimitReached) {
        const newBubble = createBubble(Date.now(), world);
        setBubbles((prev) => [...prev, newBubble]);
      }
    }, 200);
  };

  return (
    <>
      {/* 📊 RESPONSIVE BUBBLE POP COUNTER & RAINBOW GLOW HELP ICON */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-none w-auto max-w-[90vw] flex items-center gap-2.5"
      >
        {/* Weekly Pop Counter Pill */}
        <div className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/80">
            Weekly Pops:
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={popCount}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg sm:text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]"
            >
              {popCount}
            </motion.span>
          </AnimatePresence>
          <div className="w-8 sm:w-12 h-1 bg-white/20 rounded-full overflow-hidden">
             <motion.div 
              className="h-full bg-gradient-to-r from-pink-300 to-blue-300"
              initial={{ width: 0 }}
              animate={{ width: `${(popCount % 5) * 20}%` }}
             />
          </div>
        </div>

        {/* 🌈 Rainbow Glowing Question Mark Trigger */}
        <motion.button
          type="button"
          aria-label="How to play"
          onClick={(e) => {
            e.stopPropagation();
            setShowInstructions(true);
          }}
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md border-2 border-white flex items-center justify-center font-black text-sm sm:text-base text-[#E02171] cursor-pointer select-none transition-shadow duration-300 shadow-[0_0_12px_rgba(255,0,150,0.6),0_0_20px_rgba(0,200,255,0.5),0_0_28px_rgba(255,255,0,0.4)] hover:shadow-[0_0_18px_rgba(255,0,150,0.85),0_0_28px_rgba(0,200,255,0.75),0_0_36px_rgba(255,255,0,0.6)]"
        >
          ?
        </motion.button>
      </motion.div>

      {/* 📖 BUBBLE POP INSTRUCTIONS MODAL (Click anywhere to close) */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInstructions(false)}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 cursor-pointer select-none"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="relative max-w-[92vw] sm:max-w-md md:max-w-lg w-full flex items-center justify-center"
            >
              <img
                src="/images/BubblePopInstructions.png"
                alt="Pop & Collect Instructions: 1. Pop the bubbles, 2. Get Bubble Cards, 3. Collect in Scrapbook"
                className="w-full h-auto max-h-[85vh] object-contain drop-shadow-[0_12px_36px_rgba(0,0,0,0.4)] pointer-events-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛑 LIMIT MESSAGE OVERLAY - BRAND THEMED & MOBILE BOUNDED */}
      {isLimitReached && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-40 text-center px-4 sm:px-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border-2 border-pink-200 shadow-2xl pointer-events-auto w-full max-w-[90vw] sm:max-w-sm mx-auto"
          >
            {/* 🎀 Outlined hollow heading with zero-bleed letter isolation */}
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold uppercase mb-3 sm:mb-4 text-transparent [-webkit-text-stroke:1px_#E02171] drop-shadow-[0_2px_4px_rgba(224,33,113,0.2)] flex flex-wrap justify-center items-center gap-x-3 gap-y-1 select-none">
              {/* WORD 1: WEEKLY */}
              <span className="inline-flex gap-[3px] tracking-normal">
                {"WEEKLY".split("").map((char, i) => (
                  <span key={i} className="inline-block">{char}</span>
                ))}
              </span>

              {/* WORD 2: LIMIT */}
              <span className="inline-flex gap-[3px] tracking-normal">
                {"LIMIT".split("").map((char, i) => (
                  <span key={i} className="inline-block">{char}</span>
                ))}
              </span>

              {/* WORD 3: REACHED */}
              <span className="inline-flex gap-[3px] tracking-normal">
                {"REACHED".split("").map((char, i) => (
                  <span key={i} className="inline-block">{char}</span>
                ))}
              </span>
            </h2>

            {/* 🌸 Brand #E02171 body text */}
            <p className="text-[#E02171] font-semibold text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
              You've collected your cards for this week! New bubbles will return when the next week begins.
            </p>

            {/* 💖 View Scrapbook button with translucent brand glow */}
            <button 
              onClick={() => {
                // 🔒 GUEST GUARD: Prompt sign-in if guest taps limit scrapbook button
                if (!auth.currentUser) {
                  onAuthRequired?.();
                } else {
                  navigate("/scrapbook");
                }
              }}
              className="mt-5 sm:mt-6 bg-[#E02171] text-white px-6 sm:px-7 py-2.5 rounded-full font-black uppercase text-xs tracking-widest shadow-[0_0_24px_rgba(224,33,113,0.45)] hover:shadow-[0_0_32px_rgba(224,33,113,0.65)] hover:bg-[#c71761] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              View Scrapbook
            </button>
          </motion.div>
        </div>
      )}

      {/* 🌫️ BACKGROUND */}
      <div
        className={`absolute inset-0 z-0 overflow-hidden transition-all duration-300 ${
          activeCard ? "blur-2xl scale-105" : ""
        }`}
      >
        {/* 🫧 BUBBLES */}
        {!isLimitReached && bubbles.map((b) => {
          const { x, y } = b.body.position;

          return (
            <motion.div
              key={b.id}
              onClick={(e) => popBubble(e, b)}
              className="absolute rounded-full cursor-pointer"
              style={{
                width: b.size,
                height: b.size,
                left: x - b.size / 2,
                top: y - b.size / 2,
                borderRadius: "50%",
                background: `
                  radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 35%),
                  radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2), transparent 60%),
                  conic-gradient(
                    from 0deg,
                    rgba(255,0,150,0.20),
                    rgba(0,200,255,0.20),
                    rgba(0,255,150,0.20),
                    rgba(255,255,0,0.20),
                    rgba(255,0,150,0.20)
                  )
                `,
                backdropFilter: "blur(2px)",
                boxShadow: `
                  inset -10px -15px 25px rgba(0,0,0,0.2),
                  inset 10px 10px 20px rgba(255,255,255,0.6),
                  inset 0 0 0 1px rgba(255,255,255,0.15),
                  0 10px 30px rgba(0,0,0,0.2)
                `,
                position: "absolute",
                overflow: "hidden",
                touchAction: "manipulation",
              }}
              whileTap={{ scale: 0.8, opacity: 0 }}
            />
          );
        })}

        {/* 💥 PARTICLES */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              opacity: p.life,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.9), transparent)",
              filter: "blur(1px)",
            }}
          />
        ))}
      </div>

      {/* 🎴 GACHA CARD REVEAL MODAL */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl pointer-events-auto p-4"
            onClick={() => setActiveCard(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="relative max-w-[85vw] sm:max-w-sm"
            >
              <button
                onClick={() => setActiveCard(null)}
                aria-label="Close card reveal"
                className="absolute -top-4 -right-4 bg-white rounded-full w-9 h-9 sm:w-10 sm:h-10 shadow-lg flex items-center justify-center font-bold z-[70] text-gray-800 hover:text-pink-600"
              >
                ✕
              </button>

              <div className="relative">
                <img
                  src={activeCard?.image}
                  alt="card"
                  className="rounded-2xl shadow-2xl w-full h-auto object-contain"
                />
                {activeCard.isDuplicate && (
                   <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-xl whitespace-nowrap">
                      Already Collected
                   </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}