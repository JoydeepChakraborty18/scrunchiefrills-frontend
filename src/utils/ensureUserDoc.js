import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// ✅ SINGLE SOURCE OF TRUTH
import { bubbleCards } from "../data/bubbleCards";

export const ensureUserDoc = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // =====================================
  // 🆕 NEW USER → FULL INIT
  // =====================================
  if (!snap.exists()) {
    const bubbleCardsInit = Object.keys(bubbleCards).reduce((acc, id) => {
      acc[id] = 0;
      return acc;
    }, {});

    await setDoc(userRef, {
      bubbleCards: bubbleCardsInit,
      characterCards: {},
      createdAt: new Date(),
    });

    console.log("✅ User document created with initialized cards");
    return;
  }

  // =====================================
  // 🔄 EXISTING USER → MIGRATION FIX
  // =====================================
  const data = snap.data();

  const existingCards = data.bubbleCards || {};

  let needsUpdate = false;

  const updatedCards = { ...existingCards };

  // ✅ ADD MISSING KEYS ONLY
  Object.keys(bubbleCards).forEach((id) => {
    if (typeof updatedCards[id] !== "number") {
      updatedCards[id] = 0;
      needsUpdate = true;
    }
  });

  // ✅ OPTIONAL: REMOVE INVALID KEYS (safe cleanup)
  Object.keys(updatedCards).forEach((id) => {
    if (!bubbleCards[id]) {
      delete updatedCards[id];
      needsUpdate = true;
    }
  });

  if (needsUpdate) {
    await updateDoc(userRef, {
      bubbleCards: updatedCards,
    });

    console.log("🔄 User document migrated (missing keys fixed)");
  } else {
    console.log("ℹ️ User document already up-to-date");
  }
};