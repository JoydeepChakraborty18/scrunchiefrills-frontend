// =====================================
// 🎴 BUBBLE CARDS CONFIG (FINAL - UPDATED RARITY)
// =====================================

export const bubbleCards = {
  // =====================================
  // 🟢 COMMON (High frequency - safe)
  // =====================================

  style_horoscope: {
    name: "Style Horoscope",
    image: "/cards/StyleHoroscope.png",
    rarity: "common",
    weight: 60,
    type: "engagement",
  },

  scrunchie_fact_1: {
    name: "Scrunchie Fact",
    image: "/cards/ScrunchieFact.png",
    rarity: "common",
    weight: 55,
    type: "engagement",
  },

  scrunchie_fact_2: {
    name: "Scrunchie Fact 2",
    image: "/cards/ScrunchieFact2.png",
    rarity: "common",
    weight: 50,
    type: "engagement",
  },

  // =====================================
  // 🔵 UNCOMMON (Low cost, still safe)
  // =====================================

  free_wallpaper: {
    name: "Free Wallpaper",
    image: "/cards/FreeWallpaper.png",
    rarity: "uncommon",
    weight: 30,
    type: "engagement",
  },

  whatsapp_group: {
    name: "WhatsApp Group",
    image: "/cards/WhatsappGroup.png",
    rarity: "uncommon",
    weight: 25,
    type: "soft",
  },

  // =====================================
  // 🟣 RARE (Controlled value)
  // =====================================

  early_reveal: {
    name: "Early Reveal",
    image: "/cards/EarlyReveal.png",
    rarity: "rare",
    weight: 12,
    type: "soft",
  },

  first_delivery: {
    name: "First Delivery",
    image: "/cards/FirstDelivery.png",
    rarity: "rare",
    weight: 10,
    type: "soft",
  },

  // =====================================
  // 🟠 EPIC (High value - tightly controlled)
  // =====================================

  create_collection: {
    name: "Create Collection",
    image: "/cards/CreateCollection.png",
    rarity: "epic",
    weight: 4,
    type: "hard",
  },

  // =====================================
  // 🟡 LEGENDARY (Ultra rare - highest control)
  // =====================================

  scrunchie_point: {
    name: "Scrunchie Points",
    image: "/cards/ScrunchiePoint.png",
    rarity: "legendary",
    weight: 1,
    type: "hard",
  },
};

// =====================================
// 🎲 WEIGHTED RANDOM PICKER
// =====================================

export const getWeightedRandomCard = () => {
  const entries = Object.entries(bubbleCards);

  const totalWeight = entries.reduce(
    (sum, [, card]) => sum + card.weight,
    0
  );

  let random = Math.random() * totalWeight;

  for (const [key, card] of entries) {
    if (random < card.weight) return key;
    random -= card.weight;
  }

  return entries[0][0];
};

// =====================================
// 🛡️ SAFE FALLBACK (COMMON ONLY)
// =====================================

export const getSafeCard = () => {
  const safeCards = Object.entries(bubbleCards)
    .filter(([_, card]) => card.rarity === "common")
    .map(([key]) => key);

  return safeCards[Math.floor(Math.random() * safeCards.length)];
};

// =====================================
// ⭐ HELPER: LEGENDARY CHECK (NEW - SAFE ADDITION)
// =====================================

export const isLegendaryCard = (cardId) => {
  return bubbleCards[cardId]?.rarity === "legendary";
};