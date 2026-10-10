// src/utils/progressionEngine.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 🎀 SCRUNCHIEFRILLS XP TRANSACTION MATRIX
 */
export const XP_CONFIG = {
  QUIZ_COMPLETED: 150,
  FIRST_ORDER: 300,
  ORDER_PLACED: 150,
  BUBBLE_CARD_EARNED: 50,
  ACHIEVEMENT_UNLOCKED: 100,
};

/**
 * 👑 SCRUNCHIEFRILLER LEVEL SYSTEM TIERS
 */
export const LEVEL_TIERS = [
  { level: 1, title: "Frill Novice", minXp: 0, maxXp: 200 },
  { level: 2, title: "Frill Starter", minXp: 200, maxXp: 500 },
  { level: 3, title: "Frill Enthusiast", minXp: 500, maxXp: 800 },
  { level: 4, title: "Frill Collector", minXp: 800, maxXp: 1200 },
  { level: 5, title: "Frill Queen", minXp: 1200, maxXp: 1800 },
  { level: 6, title: "Frill Empress", minXp: 1800, maxXp: 2600 },
];

/**
 * 👤 USER PROFILE DEFAULT AVATARS (Preserved untouched)
 * Used for the top profile picture circle and avatar selection
 */
export const USER_PROFILE_AVATARS = {
  "The Soft Girlie": "/images/ProfilePics/CuteGirl.png",
  "The Main Character": "/images/ProfilePics/BubblegumGirl.png",
  "The Cosmic Dreamer": "/images/ProfilePics/StrawberryMatchaGirl.png",
  "The Downtown Muse": "/images/ProfilePics/BawseGirl.png",
};

/**
 * 🎴 QUIZ PERSONA ASSETS & METADATA
 * Used exclusively for the "My Frill Persona" section
 * Subtitle, traits, and description apply directly to the quiz persona artworks
 */
export const QUIZ_PERSONA_ASSETS = {
  "The Soft Girlie": {
    name: "The Soft Girlie",
    image: "/images/QuizPersona/TheSoftGirlieQuizProfileImage.png",
    subtitle: "Sweet · Dreamy · Creative",
    traits: ["Sweet", "Dreamy", "Creative", "Empathetic", "Aesthetic"],
    description:
      "You're a hopeless romantic with a soft spot for pretty things. You find joy in small moments, love all things pink and believe life is better with a little sparkle.",
  },
  "The Main Character": {
    name: "The Main Character",
    image: "/images/QuizPersona/TheMainCharacterQuizProfileImage.png",
    subtitle: "Bold · Electric · Unapologetic",
    traits: ["Bold", "Iconic", "Confident", "Vibrant", "Leader"],
    description:
      "Loud, bold prints, electric confidence, and statement XXL scrunchies. You don't follow trends—you set them.",
  },
  "The Cosmic Dreamer": {
    name: "The Cosmic Dreamer",
    image: "/images/QuizPersona/TheCosmicDreamerQuizProfileImage.png",
    subtitle: "Starry · Intuitive · Whimsical",
    traits: ["Dreamy", "Intuitive", "Calm", "Mystic", "Luxe"],
    description:
      "Holographic glimmers, dreamy lilacs, and midnight celestial magic. Always lost in starry daydreams.",
  },
  "The Downtown Muse": {
    name: "The Downtown Muse",
    image: "/images/QuizPersona/TheDowntownMuseQuizProfileImage.png",
    subtitle: "Chic · Minimal · Ambitious",
    traits: ["Clean Girl", "Oversized Blazers", "Matcha Fanatic", "Minimal", "Sleek"],
    description:
      "Coffee runs, cool sunglasses, minimalist neutrals, and sleek buns. Handling business in effortless pink.",
  },
};

// Aliased for backwards compatibility
export const PERSONA_ASSETS = QUIZ_PERSONA_ASSETS;

/**
 * 🎮 WEEKLY PERIODIC QUEST POOL
 * Rotates automatically every Monday at 00:00 IST
 */
export const WEEKLY_QUEST_POOL = [
  // Tier 1: Identity & Persona Quests
  {
    id: "quest_quiz_vibe",
    title: "Refresh Your Vibe",
    description: "Retake the Frill Persona Quiz this week",
    icon: "✨",
    target: 1,
    metricKey: "weeklyQuizTaken",
    rewardXp: 50,
  },
  {
    id: "quest_avatar_switch",
    title: "Avatar Glow-Up",
    description: "Equip or change your 2D sticker avatar",
    icon: "🎀",
    target: 1,
    metricKey: "weeklyAvatarChanged",
    rewardXp: 50,
  },

  // Tier 2: Weekly Bubble Pop & Scrapbook
  {
    id: "quest_bubble_cards",
    title: "Card Collector Sprint",
    description: "Unlock 2 Bubble Cards in the weekly pop game",
    icon: "🫧",
    target: 2,
    metricKey: "weeklyCardsEarned",
    rewardXp: 75,
  },
  {
    id: "quest_scrapbook_collection",
    title: "Scrapbook Showcase",
    description: "Collect 3 or more unique Bubble Cards",
    icon: "📖",
    target: 3,
    metricKey: "totalUniqueCards",
    rewardXp: 75,
  },

  // Tier 3: Orders & Shopping Milestones
  {
    id: "quest_order_drop",
    title: "Frill Haul",
    description: "Place a confirmed order this week",
    icon: "🛍️",
    target: 1,
    metricKey: "weeklyOrdersCount",
    rewardXp: 150,
  },
  {
    id: "quest_stack_frills",
    title: "Stack the Frills",
    description: "Complete 2 confirmed orders",
    icon: "👑",
    target: 2,
    metricKey: "weeklyOrdersCount",
    rewardXp: 200,
  },
];

/**
 * 🗓️️ Deterministic Weekly Quest Rotation Generator
 */
export const getWeeklyQuestState = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  const weekKey = `${now.getFullYear()}-W${weekNumber}`;

  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  // Select 3 rotating quests (1 from each tier) deterministically based on week number
  const seed = weekNumber;
  const q1 = WEEKLY_QUEST_POOL[seed % 2];
  const q2 = WEEKLY_QUEST_POOL[2 + (seed % 2)];
  const q3 = WEEKLY_QUEST_POOL[4 + (seed % 2)];

  return {
    weekKey,
    daysRemaining: daysUntilMonday,
    activeQuests: [q1, q2, q3],
  };
};

/**
 * 🏆 AUTOMATIC ACHIEVEMENTS REGISTRY
 */
export const ACHIEVEMENTS_REGISTRY = [
  {
    id: "ach_first_frill",
    title: "First Frill",
    icon: "🎀",
    description: "Placed your first confirmed order!",
    condition: (state) => (state.confirmedOrdersCount || state.ordersCount || 0) >= 1,
  },
  {
    id: "ach_frill_shopper",
    title: "Frill Shopper",
    icon: "🛍️",
    description: "Completed 5 confirmed orders!",
    condition: (state) => (state.confirmedOrdersCount || state.ordersCount || 0) >= 5,
  },
  {
    id: "ach_bubble_popper",
    title: "Bubble Popper",
    icon: "🫧",
    description: "Unlocked your first Bubble Card in the Scrapbook!",
    condition: (state) => (state.bubbleCardsCollected || 0) >= 1,
  },
  {
    id: "ach_card_collector",
    title: "Card Collector",
    icon: "💗",
    description: "Collected 10 Bubble Cards in your Scrapbook!",
    condition: (state) => (state.bubbleCardsCollected || 0) >= 10,
  },
  {
    id: "ach_quiz_girl",
    title: "Quiz Girl",
    icon: "✨",
    description: "Discovered your Frill Persona!",
    condition: (state) => Boolean(state.persona),
  },
];

/**
 * 🧮 Pure function: Calculate level & progress percentage from raw XP
 */
export const calculateLevel = (totalXp = 0) => {
  let tier = LEVEL_TIERS[0];
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_TIERS[i].minXp) {
      tier = LEVEL_TIERS[i];
      break;
    }
  }

  const xpIntoLevel = Math.max(0, totalXp - tier.minXp);
  const xpForLevel = Math.max(1, tier.maxXp - tier.minXp);
  const progressPercent = Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100));

  return {
    level: tier.level,
    title: tier.title,
    xp: totalXp,
    xpIntoLevel,
    xpForLevel,
    maxXp: tier.maxXp,
    progressPercent,
  };
};

/**
 * 🚀 Central Event Dispatcher & State Synchronizer
 */
export const syncUserProgression = async (uid, eventType, additionalData = {}) => {
  if (!uid) return null;

  try {
    const userRef = doc(db, "customers", uid);
    const snap = await getDoc(userRef);
    const current = snap.exists() ? snap.data() : {};

    let totalXp = current.xp || 0;
    let achievements = [...(current.achievements || [])];
    let bubbleCardsCollected = current.bubbleCardsCollected || 0;
    let ordersCount = current.ordersCount || 0;
    let completedQuiz = current.completedQuiz || false;

    if (eventType === "QUIZ_COMPLETED" && !completedQuiz) {
      completedQuiz = true;
      totalXp += XP_CONFIG.QUIZ_COMPLETED;
    }

    if (eventType === "BUBBLE_CARD_EARNED") {
      bubbleCardsCollected += 1;
      totalXp += XP_CONFIG.BUBBLE_CARD_EARNED;
    }

    if (eventType === "ORDER_COMPLETED") {
      ordersCount += 1;
      totalXp += ordersCount === 1 ? XP_CONFIG.FIRST_ORDER : XP_CONFIG.ORDER_PLACED;
    }

    const evalState = {
      ...current,
      ...additionalData,
      ordersCount,
      bubbleCardsCollected,
      xp: totalXp,
    };

    ACHIEVEMENTS_REGISTRY.forEach((ach) => {
      if (!achievements.includes(ach.id) && ach.condition(evalState)) {
        achievements.push(ach.id);
        totalXp += XP_CONFIG.ACHIEVEMENT_UNLOCKED;
      }
    });

    const levelMetrics = calculateLevel(totalXp);

    const updatedPayload = {
      ...current,
      ...additionalData,
      xp: totalXp,
      level: levelMetrics.level,
      levelTitle: levelMetrics.title,
      ordersCount,
      bubbleCardsCollected,
      achievements,
      completedQuiz,
    };

    await setDoc(userRef, updatedPayload, { merge: true });
    return updatedPayload;
  } catch (error) {
    console.error("Progression sync error:", error);
    return null;
  }
};