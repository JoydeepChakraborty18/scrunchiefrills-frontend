// src/pages/GameShell.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";

import GameIntroModal from "../components/game/GameIntroModal";
import GameTopBar from "../components/game/GameTopBar";
import CycloneArena from "../components/game/CycloneArena";
import BubbleEngine from "../components/game/BubbleEngine"; 
import CooldownCard from "../components/game/CooldownCard";
import ResultsModal from "../components/game/ResultsModal";
import RewardPopup from "../components/game/RewardPopup";

// 🧮 Central Progression Engine Imports
import { getWeeklyQuestState, syncUserProgression } from "../utils/progressionEngine";

// ── 📝 ARCADE FLOATING TEXT ARRAYS CONFIGURATION ──
const MESSAGES = {
  scrunchie: ["+10 Frills!", "Fabulous!", "Cute Catch!", "Frill Power!", "Sweet Pop!", "Nice!", "Perfect!", "Pop!", "Lovely!", "Sparkle!"],
  heart: ["+1 Life ❤️", "Love Boost!", "Heart Power!", "Sweet Rescue!", "Lucky Heart!", "Extra Life!"],
  scissors: ["Ouch!", "Snip!", "Careful!", "Cut!", "Missed!", "-1 Life ✂️"],
  heartbreak: ["Broken Heart!", "Sad...", "Oops!", "-5 Score 💔", "Heartbreak!", "Don't Cry!"]
};

/**
 * 🕹️ SCRUNCHIE POP ENGINE - DYNAMIC STATUS HUD CABINET
 * Integrates active status alerts for multi-conditional item rolls, showing exactly
 * which hazard or buff split is active beneath the header control matrix.
 */
const GameShell = () => {
  const navigate = useNavigate();

  // --- Auth & Periodic Cooldown State ---
  const [currentUser, setCurrentUser] = useState(null);
  const { weekKey } = getWeeklyQuestState();

  // --- Core Game Engine Hooks & States ---
  const [hasPlayedThisWeek, setHasPlayedThisWeek] = useState(false);
  const [gameState, setGameState] = useState("idle"); // idle | playing | finished | cooldown
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const [unlockedReward, setUnlockedReward] = useState(null);

  // --- Timed Status Modifiers ---
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isScoringDisabled, setIsScoringDisabled] = useState(false);

  // ── ⚡ DYNAMIC HUD ACTIVE EFFECT LABELS ──
  const [activeHeartEffect, setActiveHeartEffect] = useState("");
  const [activeHeartbreakEffect, setActiveHeartbreakEffect] = useState("");

  // --- Ephemeral Text Feed State ---
  const [floatingTexts, setFloatingTexts] = useState([]);

  // ── 🔐 AUTH & PERSISTENT COOLDOWN SYNC ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast("Please log in to play the Cyclone Arcade! 🕹️", { icon: "🎀" });
        navigate("/login");
        return;
      }
      setCurrentUser(user);

      try {
        const userRef = doc(db, "customers", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.lastPlayedCycloneWeek === weekKey) {
            setHasPlayedThisWeek(true);
            setGameState("cooldown");
          }
        }
      } catch (err) {
        console.warn("Could not check cyclone cooldown:", err);
      }
    });

    return () => unsubscribe();
  }, [navigate, weekKey]);

  // --- Live Countdown Interval Engine Loop ---
  useEffect(() => {
    if (gameState !== "playing") return;

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [gameState]);

  // ── 🔧 INTERNAL FACTORY TRIGGER FOR FLOATING TEXT FEED ──
  const triggerFloatingTextAlert = (type) => {
    const pool = MESSAGES[type];
    const randomMessage = pool[Math.floor(Math.random() * pool.length)];
    const newTextNode = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      message: randomMessage,
      type: type
    };

    setFloatingTexts((prev) => [...prev, newTextNode]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newTextNode.id));
    }, 700);
  };

  // ── 🎯 DYNAMIC GAMEPLAY ACTIONS LOGIC MATRIX ──
  
  const handleScrunchieTap = (bubbleId) => {
    if (gameState !== "playing") return;
    triggerFloatingTextAlert("scrunchie");
    if (isScoringDisabled) return;
    setScore((prev) => prev + 10);
  };

  const handleHeartTap = (bubbleId) => {
    if (gameState !== "playing") return;
    triggerFloatingTextAlert("heart");

    if (lives < 3) {
      setLives((prev) => Math.min(3, prev + 1));
      setActiveHeartEffect("HEALED +1 LIFE CONTAINER!");
      setTimeout(() => setActiveHeartEffect(""), 3000);
    } else {
      const rollAlternativeBuff = Math.random() > 0.5;
      if (rollAlternativeBuff) {
        setSpeedMultiplier(0.5);
        setActiveHeartEffect("🐢 SLOW MOTION ACTIVE (5s)!");
        setTimeout(() => {
          setSpeedMultiplier(1);
          setActiveHeartEffect("");
        }, 5000);
      } else {
        setScore((prev) => prev + 1);
        setActiveHeartEffect("✨ FULL HEALTH BONUS: +1 SCORE!");
        setTimeout(() => setActiveHeartEffect(""), 3000);
      }
    }
  };

  const handleScissorsTap = (bubbleId) => {
    if (gameState !== "playing") return;
    triggerFloatingTextAlert("scissors");
    setLives((prev) => {
      const remainingLives = prev - 1;
      if (remainingLives <= 0) {
        setGameState("finished");
        return 0;
      }
      return remainingLives;
    });
  };

  const handleHeartbreakTap = (bubbleId) => {
    if (gameState !== "playing") return;
    triggerFloatingTextAlert("heartbreak");

    const randomHazardIndex = Math.floor(Math.random() * 3);
    if (randomHazardIndex === 0) {
      setSpeedMultiplier(2);
      setActiveHeartbreakEffect("🌪️ TURBO MODE: 2X SPEED (10s)!");
      setTimeout(() => {
        setSpeedMultiplier(1);
        setActiveHeartbreakEffect("");
      }, 10000);
    } else if (randomHazardIndex === 1) {
      setScore((prev) => Math.max(0, prev - 10));
      setActiveHeartbreakEffect("💔 HEART BROKEN: -10 SCORE PENALTY!");
      setTimeout(() => setActiveHeartbreakEffect(""), 3000);
    } else {
      setIsScoringDisabled(true);
      setActiveHeartbreakEffect("🚫 SCORING BREAK: LOCKED FOR 5s!");
      setTimeout(() => {
        setIsScoringDisabled(false);
        setActiveHeartbreakEffect("");
      }, 5000);
    }
  };

  // --- Core Game Flow Reset Management ---
  const handleStartGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(60);
    setLives(3);
    setSpeedMultiplier(1);
    setIsScoringDisabled(false);
    setActiveHeartEffect("");
    setActiveHeartbreakEffect("");
    setFloatingTexts([]);
  };

  // ── 🎁 REWARD DISPATCHER & FIRESTORE INTEGRATION ──
  const handleClaimReward = async () => {
    // 🎀 Determine reward tier based on score
    let rewardPayload = null;

    if (score >= 600) {
      rewardPayload = {
        id: `cyclone_${Date.now()}`,
        code: "CYCLONE20",
        title: "20% OFF Next Order",
        description: "20% OFF on packs of 9 and up! (Not stackable with bundle tiers)",
        discountPercent: 20,
        applicableTiers: [9, 12, 15, 18],
        source: "The Cyclone Arcade 🌪️",
        status: "available",
        validity: "Valid for 14 days",
        earnedAt: new Date().toISOString(),
      };
    } else if (score >= 300) {
      rewardPayload = {
        id: `cyclone_${Date.now()}`,
        code: "CYCLONE10",
        title: "10% OFF Next Order",
        description: "10% OFF on packs of 3 & 6! (Not stackable with bundle tiers)",
        discountPercent: 10,
        applicableTiers: [3, 6],
        source: "The Cyclone Arcade 🌪️",
        status: "available",
        validity: "Valid for 14 days",
        earnedAt: new Date().toISOString(),
      };
    }

    // Dismiss ResultsModal
    setGameState("idle");

    if (!rewardPayload) {
      // Score < 300: No reward to save
      toast("Better luck next time! Pop more bubbles to score 300+ next week! 🌸", {
        icon: "✨",
        duration: 4000,
      });
      setHasPlayedThisWeek(true);
      setGameState("cooldown");

      if (currentUser?.uid) {
        try {
          const userRef = doc(db, "customers", currentUser.uid);
          await setDoc(userRef, { lastPlayedCycloneWeek: weekKey }, { merge: true });
          await syncUserProgression(currentUser.uid, "CYCLONE_GAME_PLAYED", { cycloneScore: score });
        } catch (e) {
          console.warn("Could not sync cooldown:", e);
        }
      }
      return;
    }

    // Mount popup for 300+ scorers
    setUnlockedReward(rewardPayload);

    if (currentUser?.uid) {
      try {
        const userRef = doc(db, "customers", currentUser.uid);
        await setDoc(
          userRef,
          {
            rewards: arrayUnion(rewardPayload),
            lastPlayedCycloneWeek: weekKey,
          },
          { merge: true }
        );

        await syncUserProgression(currentUser.uid, "CYCLONE_GAME_PLAYED", {
          cycloneScore: score,
        });

        toast.success(`${rewardPayload.title} saved to My Rewards! 🎀`);
      } catch (err) {
        console.error("Failed to sync reward to profile:", err);
        toast.error("Could not sync reward. Please try again.");
      }
    }
  };

  const handleRewardClose = () => {
    setUnlockedReward(null);
    setHasPlayedThisWeek(true);
    setGameState("cooldown");
  };

  return (
    <div className="w-full h-screen bg-[#FFF2F8] pt-20 pb-4 px-4 flex flex-col justify-start items-center select-none overflow-hidden relative">
      
      {/* Dynamic Keyframe Animation Styles Sheet */}
      <style>{`
        @keyframes textFloatUpPop {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          15% { transform: translateY(-10px) scale(1.1); opacity: 1; }
          100% { transform: translateY(-45px) scale(1.0); opacity: 0; }
        }
        .animate-float-text {
          animation: textFloatUpPop 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(#e02171_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Main Screen Core Panel Grid Layout */}
      <div className="relative w-full max-w-5xl flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center overflow-hidden z-10">
        
        {/* LEFT SIDEBAR */}
        <div className="hidden md:flex md:col-span-3 flex-col justify-center items-end pr-4 text-right space-y-4">
          <div className="bg-white border-2 border-[#e02171] p-4 rounded-2xl shadow-[4px_4px_0px_#e02171]">
            <h3 className="font-black text-[#e02171] text-xs uppercase tracking-wider">✨ Arcade Rules</h3>
            <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
              Pop floating scrunchie bubbles to score! Watch out for scissors that cut your lives short. ✂️
            </p>
          </div>
          <div className="text-3xl animate-bounce">🌸✨🎀</div>
        </div>

        {/* 📱 CENTRAL MONITOR CABINET MONITOR HOUSING */}
        <div className="col-span-1 md:col-span-6 w-full h-full flex items-center justify-center overflow-hidden">
          <div className="h-full max-h-[calc(100vh-7rem)] aspect-[9/16] relative border-4 border-[#e02171] rounded-3xl shadow-[0px_12px_40px_rgba(224,33,113,0.12)] bg-transparent overflow-hidden w-auto">
            
            {gameState !== "cooldown" && !hasPlayedThisWeek ? (
              <div 
                className="w-full h-full relative bg-[length:100%_100%] bg-center bg-no-repeat overflow-hidden"
                style={{ backgroundImage: "url('/game_img/ScrunchieCyclone_Game_BG.png')" }}
              >
                
                {/* ── 📊 MODULAR HUD OVERLAY MOUNT ── */}
                {gameState === "playing" && (
                  <div className="absolute inset-x-0 top-0 h-[150px] pointer-events-none z-30 select-none">
                    <GameTopBar score={score} timeLeft={timeLeft} lives={lives} />
                  </div>
                )}

                {/* ── 🫧 RUNWAY GAMEPLAY ENGINE CANLAY ZONE ── */}
                <div className="absolute inset-x-0 bottom-0 top-[145px] z-20 overflow-hidden bg-transparent">
                  <CycloneArena gameState={gameState}>
                    <BubbleEngine 
                      isActive={gameState === "playing"} 
                      onScrunchieTap={handleScrunchieTap}
                      onHeartTap={handleHeartTap}
                      onScissorsTap={handleScissorsTap}
                      onHeartbreakTap={handleHeartbreakTap}
                      speedMultiplier={speedMultiplier}
                    />
                  </CycloneArena>
                </div>

                {/* ── 🎈 INTERACTIVE FLOATING TEXT FEED ZONE ── */}
                <div className="absolute top-[210px] inset-x-0 flex flex-col items-center pointer-events-none z-40 gap-1.5">
                  {floatingTexts.map((text) => {
                    let textColor = "text-[#e02171]";
                    if (text.type === "scissors" || text.type === "heartbreak") {
                      textColor = "text-red-500 font-extrabold";
                    }
                    return (
                      <div
                        key={text.id}
                        className={`animate-float-text font-black text-lg tracking-wide uppercase filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.95)] ${textColor}`}
                      >
                        {text.message}
                      </div>
                    );
                  })}
                </div>

                {/* ── 🚨 AUTHORITATIVE HUD INDICATOR FLAGS STACK ── */}
                <div className="absolute top-[152px] inset-x-4 flex flex-col items-center gap-1.5 pointer-events-none z-40 select-none">
                  
                  {/* Active Core Buff States */}
                  {activeHeartEffect && gameState === "playing" && (
                    <div className="bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow border border-white/20 scale-100 transition-all filter saturate-110 animate-bounce">
                      {activeHeartEffect}
                    </div>
                  )}

                  {/* Active Core Penalty States */}
                  {activeHeartbreakEffect && gameState === "playing" && (
                    <div className="bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow border border-white/10 scale-100 transition-all filter saturate-110 animate-pulse">
                      {activeHeartbreakEffect}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              /* Cooldown View Layout Block */
              <div className="w-full h-full flex items-center justify-center p-6 bg-[#FFF2F8]">
                <CooldownCard onBackToShop={() => navigate("/shop")} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden md:flex md:col-span-3 flex-col justify-center items-start pl-4 space-y-4">
          <div className="bg-white border-2 border-[#e02171] p-4 rounded-2xl shadow-[4px_4px_0px_#e02171]">
            <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-widest">🏆 Vault Rewards</h4>
            <span className="text-[11px] text-gray-700 block mt-1 font-medium">✨ Premium Promo Vouchers</span>
            <span className="text-[11px] text-gray-700 block font-medium">✨ Collectible Sticker Packs</span>
          </div>
          <div className="text-3xl animate-pulse">🍭⭐🌈</div>
        </div>

      </div>

      {/* --- Overlays & Floating Controller Modals Layer --- */}
      <GameIntroModal 
        hasPlayedThisWeek={hasPlayedThisWeek || gameState !== "idle"} 
        onStartGame={handleStartGame} 
      />

      <ResultsModal 
        visible={gameState === "finished"}
        score={score}
        scoreTier={
          score >= 600
            ? "Super Premium Elite 👑 (Cyclone 20 Unlocked!)"
            : score >= 300
            ? "Cute Collector 🌸 (Cyclone 10 Unlocked!)"
            : "Bubble Beginner 🫧 (Better Luck Next Time!)"
        }
        onClaimReward={handleClaimReward}
      />

      <RewardPopup 
        rewardDetails={unlockedReward} 
        onClose={handleRewardClose} 
      />
    </div>
  );
};

export default GameShell;