// src/data/avatarRegistry.js
export const AVATAR_REGISTRY = [
  // --- Original Unlocked Mascots ---
  {
    avatarId: "miss-scrunchie",
    name: "Miss Scrunchie",
    image: "/images/ProfilePics/MissScrunchie.png",
    tagline: "The Royal Mascot",
    unlocked: true,
    unlockRequirement: null,
  },
  {
    avatarId: "bubblegum-girl",
    name: "Bubblegum Girl",
    image: "/images/ProfilePics/BubblegumGirl.png",
    tagline: "Sweet, bubbly & iconic",
    unlocked: true,
    unlockRequirement: null,
  },
  {
    avatarId: "cute-girl",
    name: "Cute Girl",
    image: "/images/ProfilePics/CuteGirl.png",
    tagline: "Pigtails & pure sparkle",
    unlocked: true,
    unlockRequirement: null,
  },

  // --- ✨ New Direct Unlocked Avatars ---
  {
    avatarId: "best-friends-forever",
    name: "BFF",
    image: "/images/ProfilePics/BestFriendsForever.png",
    tagline: "Besties sharing the frills 💖",
    unlocked: true,
    unlockRequirement: null,
  },
  {
    avatarId: "best-bro",
    name: "Best Bro",
    image: "/images/ProfilePics/BestBro.png",
    tagline: "Always treating his sister 🛍️",
    unlocked: true,
    unlockRequirement: null,
  },
  {
    avatarId: "good-friend",
    name: "Good Friend",
    image: "/images/ProfilePics/GoodFriend.png",
    tagline: "Thoughtful gifts & golden vibes ✨",
    unlocked: true,
    unlockRequirement: null,
  },
  {
    avatarId: "her-man",
    name: "Her Man",
    image: "/images/ProfilePics/HerMan.png",
    tagline: "Buying her favorite scrunchies 🌸",
    unlocked: true,
    unlockRequirement: null,
  },
  {
    avatarId: "girl-mom",
    name: "Girl Mom",
    image: "/images/ProfilePics/GirlAndMom.png",
    tagline: "Twinning frills & endless love 🎀",
    unlocked: true,
    unlockRequirement: null,
  },
  {
    avatarId: "girl-dad",
    name: "Girl Dad",
    image: "/images/ProfilePics/GirlAndDad.png",
    tagline: "Wrapped around her little finger 💖",
    unlocked: true,
    unlockRequirement: null,
  },

  // --- Progression Milestone Locked Avatars ---
  {
    avatarId: "strawberry-matcha-girl",
    name: "Strawberry Matcha Girl",
    image: "/images/ProfilePics/StrawberryMatchaGirl.png",
    tagline: "Iced sips & effortless shade",
    unlocked: false,
    unlockRequirement: "Collect 10 Bubble Cards",
    reqKey: "bubbleCardsCollected",
    reqThreshold: 10,
  },
  {
    avatarId: "bawse-girl",
    name: "Bawse Girl",
    image: "/images/ProfilePics/BawseGirl.png",
    tagline: "Handling business in pink",
    unlocked: false,
    unlockRequirement: "Complete 5 Orders",
    reqKey: "ordersCount",
    reqThreshold: 5,
  },
];

export const PERSONA_METADATA = {
  "The Soft Girlie": {
    name: "The Soft Girlie",
    badge: "☁️ Soft Aesthetic",
    description: "Cloud-soft satin, dreamy pastels, and cozy romantic warmth.",
    traits: ["Pastel Obsessed", "Coquette Vibes", "Luxe Satin Lover"],
    bgTint: "from-pink-100 to-rose-50",
  },
  "The Main Character": {
    name: "The Main Character",
    badge: "✨ Mane Character",
    description: "Loud, bold prints, electric confidence, and statement XXL scrunchies.",
    traits: ["Neon Pop", "Dramatic Volume", "Unapologetic Energy"],
    bgTint: "from-pink-100 via-fuchsia-50 to-pink-50",
  },
  "The Cosmic Dreamer": {
    name: "The Cosmic Dreamer",
    badge: "🌙 Starry Vision",
    description: "Holographic glimmers, dreamy lilacs, and midnight celestial magic.",
    traits: ["Lilac & Shimmer", "Nighttime Journaling", "Starlight Frills"],
    bgTint: "from-purple-100 to-pink-50",
  },
  "The Downtown Muse": {
    name: "The Downtown Muse",
    badge: "🕶️ Clean Street",
    description: "Coffee runs, cool sunglasses, minimalist neutrals, and sleek buns.",
    traits: ["Clean Girl", "Oversized Blazers", "Matcha Fanatic"],
    bgTint: "from-amber-50 to-pink-50",
  },
};