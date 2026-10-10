// =====================================
// 🎯 DROP CONTROLLER (FINAL - WEEKLY ONLY SYSTEM)
// =====================================

import {
  doc,
  getDoc,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

import {
  bubbleCards,
  getSafeCard
} from "../data/bubbleCards";

// 🔒 Prevent multiple simultaneous drops
let isDropping = false;

// =====================================
// ⏱️ GAME LIMIT CONFIG
// =====================================

// ONLY WEEKLY LIMIT REMAINS
const WEEKLY_LIMIT = 3; 

const HARD_REWARD_COOLDOWN_DAYS = 7;

// =====================================
// 🧠 SYSTEM CONFIG
// =====================================

const DUPLICATE_WEIGHT_FACTOR = 0.6;

const RARE_PITY = 15;
const EPIC_PITY = 40;

// =====================================
// 🧠 DATE HELPERS
// =====================================

const getToday = () => new Date().toISOString().split("T")[0];

const getWeek = () => {
  const d = new Date();
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7
  );
  return `${d.getFullYear()}-W${week}`;
};

const getMonth = () =>
  new Date().toISOString().slice(0, 7);

// =====================================
// 🎲 SMART WEIGHTED PICK
// =====================================

const getSmartWeightedCard = (userCards) => {
  const entries = Object.entries(bubbleCards);
  let pool = [];

  entries.forEach(([key, card]) => {
    let weight = card.weight;
    if ((userCards[key] || 0) > 0) {
      weight *= DUPLICATE_WEIGHT_FACTOR;
    }
    for (let i = 0; i < Math.floor(weight); i++) {
      pool.push(key);
    }
  });

  return pool[Math.floor(Math.random() * pool.length)];
};

// =====================================
// 🎲 MAIN DROP FUNCTION
// =====================================

export const handleBubbleDrop = async ({
  currentPopCount, // ✅ Accept the actual current count from Bubbles.jsx
  setRevealedCard,
}) => {
  try {
    // 🛡️ Remove internalPopCounter % 5 check here. 
    // Bubbles.jsx now handles the "Every 5 pops" trigger exactly.
    
    if (isDropping) return;
    isDropping = true;

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const today = getToday();
    const week = getWeek();
    const month = getMonth();

    // =====================================
    // 🚫 WEEKLY LIMIT CHECK
    // =====================================

    if (
      userData.lastWeek === week &&
      (userData.weeklyDrops || 0) >= WEEKLY_LIMIT
    ) {
      isDropping = false;
      return;
    }

    // =====================================
    // 🧠 USER CARD STATE
    // =====================================

    const userCards = userData.bubbleCards || {};
    const meta = userData.meta || {
      totalDrops: 0,
      sinceRare: 0,
      sinceEpic: 0,
    };

    let cardId;

    // =====================================
    // 🎯 PITY SYSTEM
    // =====================================

    if (meta.sinceEpic >= EPIC_PITY) {
      const epicCards = Object.entries(bubbleCards)
        .filter(([_, c]) => c.rarity === "epic")
        .map(([k]) => k);
      cardId = epicCards[Math.floor(Math.random() * epicCards.length)];
    } else if (meta.sinceRare >= RARE_PITY) {
      const rareCards = Object.entries(bubbleCards)
        .filter(([_, c]) => c.rarity === "rare" || c.rarity === "epic")
        .map(([k]) => k);
      cardId = rareCards[Math.floor(Math.random() * rareCards.length)];
    } else {
      cardId = getSmartWeightedCard(userCards);
    }

    let cardData = bubbleCards[cardId];

    // =====================================
    // 🚫 LEGENDARY MONTHLY LOCK
    // =====================================

    if (cardData.rarity === "legendary") {
      if (userData.lastLegendaryMonth === month) {
        cardId = getSafeCard();
        cardData = bubbleCards[cardId];
      }
    }

    const isDuplicate = (userCards[cardId] || 0) > 0;

    // =====================================
    // 📊 UPDATE META
    // =====================================

    meta.totalDrops += 1;

    if (cardData.rarity === "epic" || cardData.rarity === "legendary") {
      meta.sinceEpic = 0;
      meta.sinceRare = 0;
    } else if (cardData.rarity === "rare") {
      meta.sinceRare = 0;
      meta.sinceEpic += 1;
    } else {
      meta.sinceRare += 1;
      meta.sinceEpic += 1;
    }

    // =====================================
    // 🖼️ UI REVEAL
    // =====================================

    setRevealedCard({
      id: cardId,
      rarity: cardData.rarity,
      isDuplicate,
    });

    // =====================================
    // 💾 SAVE
    // =====================================

    await updateDoc(userRef, {
      [`bubbleCards.${cardId}`]: increment(1), 
      meta,
      ...(cardData.rarity === "legendary" && {
        lastLegendaryMonth: month,
      }),
    });

    // =====================================
    // 📊 LIMIT TRACKING
    // =====================================

    await setDoc(
      userRef,
      {
        lastDropDate: today,
        lastWeek: week,
        weeklyDrops:
          userData.lastWeek === week ? increment(1) : 1,
        
        // ✅ FIX: Set the exact count from the UI to ensure sync.
        // No more increment(5) which causes rounding/resetting issues.
        weeklyPopTotal: currentPopCount,
      },
      { merge: true }
    );

  } catch (error) {
    console.error("❌ Drop error:", error);
  } finally {
    setTimeout(() => {
      isDropping = false;
    }, 300);
  }
};