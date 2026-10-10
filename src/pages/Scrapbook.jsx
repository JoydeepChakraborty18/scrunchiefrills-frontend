import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";

// ✅ SINGLE SOURCE OF TRUTH
import { bubbleCards } from "../data/bubbleCards";

// =====================================
// ✨ RARITY SYSTEM CONFIG
// =====================================
const RARITY_ORDER = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

const RARITY_GLOW = {
  common: "shadow-[0_0_15px_rgba(255,255,255,0.8)]",
  uncommon: "shadow-[0_0_18px_rgba(59,130,246,0.9)]",
  rare: "shadow-[0_0_20px_rgba(236,72,153,0.95)]",
  epic: "shadow-[0_0_25px_rgba(255,215,0,1)]",
  legendary: "shadow-[0_0_30px_rgba(255,140,0,1)]",
};

// =====================================
// 🎴 CARD REGISTRIES (STYLIZED)
// =====================================

// 🫧 BUBBLE CARDS: 15 Total Slots (Sorted by Rarity Order)
const BUBBLE_CARDS_REGISTRY = Array.from({ length: 15 }, (_, i) => {
  const cardKeys = Object.keys(bubbleCards);
  const cardId = cardKeys[i];
  
  if (cardId) {
    return {
      id: cardId,
      name: bubbleCards[cardId].name,
      image: bubbleCards[cardId].image,
      rarity: bubbleCards[cardId].rarity || "common",
      isPlaceholder: false,
    };
  }
  return {
    id: `placeholder_${i}`,
    name: "Coming Soon",
    image: null,
    rarity: "common",
    isPlaceholder: true,
  };
}).sort((a, b) => {
  if (a.isPlaceholder) return 1;
  if (b.isPlaceholder) return -1;
  return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
});

// 🎭 CHARACTER CARDS: 10 Slots (Updated from 50)
const CHARACTER_CARDS_REGISTRY = Array.from({ length: 10 }, (_, i) => ({
  id: `char_${i + 1}`,
  name: "Mysterious Character",
  image: null,
  rarity: "common",
}));

// =====================================
// 📦 SCRAPBOOK COMPONENT
// =====================================
const Scrapbook = () => {
  const [collections, setCollections] = useState({
    bubbleCards: {},
    characterCards: {},
  });
  const [loading, setLoading] = useState(true);
  const prevCollections = useRef({ bubbleCards: {} });

  // =====================================
  // 🔄 REAL-TIME FIRESTORE LISTENER
  // =====================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const bCards = data.bubbleCards || {};
        const cCards = data.characterCards || {};

        setCollections({
          bubbleCards: bCards,
          characterCards: cCards,
        });
        prevCollections.current = { bubbleCards: bCards };
      }
      setLoading(false);
    }, (err) => {
      console.error("Scrapbook Sync Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // =====================================
  // 🎯 RENDER SECTION FUNCTION
  // =====================================
  const renderSection = (title, registry, collectionKey, blankImage, headingImage, maxWClass = "max-w-[300px]") => {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* 🎀 GRAPHIC IMAGE SECTION HEADER WITH FAINT TRANSPARENT PINK BAR */}
        <div className="flex items-center justify-start">
          {headingImage ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={`w-fit ${maxWClass} bg-pink-500/[0.08] backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl border border-pink-300/30 shadow-[0_2px_12px_rgba(224,33,113,0.06)] flex items-center justify-center`}
            >
              <img
                src={headingImage}
                alt={title}
                className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_4px_12px_rgba(224,33,113,0.2)]"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </motion.div>
          ) : (
            <div className="inline-block bg-[#FFF2F8] border-2 border-black px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-[#E02171] tracking-widest uppercase select-none">
                {title}
              </h2>
            </div>
          )}
        </div>

        {/* 🚀 RESPONSIVE CARD GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-6 md:gap-8 lg:gap-10">
          {registry.map((card) => {
            const count = collections[collectionKey]?.[card.id] || 0;
            const prevCount = prevCollections.current?.[collectionKey]?.[card.id] || 0;
            
            const isUnlocked = count > 0;
            const isNewUnlock = prevCount === 0 && count > 0;
            const glowClass = isUnlocked ? RARITY_GLOW[card.rarity] : "";

            return (
              <motion.div
                key={card.id}
                className="relative"
                animate={isNewUnlock ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* 🖼️ CARD FRAME (Restored Black-Border Design) */}
                <div className={`bg-white/70 backdrop-blur-md p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 border-black transition-all duration-500 ${glowClass}`}>
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-white/50">
                    
                    {/* 🔢 STACK COUNTER */}
                    {count > 1 && (
                      <div className="absolute top-1 left-1 bg-black text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full z-10 font-black shadow-lg">
                        {count}
                      </div>
                    )}

                    {/* 🃏 CARD IMAGE */}
                    <div className="w-full aspect-[2/3]">
                      <img
                        src={isUnlocked && card.image ? card.image : blankImage}
                        alt={card.name}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isUnlocked 
                            ? "grayscale-0 opacity-100" 
                            : "opacity-70"
                        }`}
                      />
                    </div>

                    {/* 🔒 LOCK OVERLAY */}
                    {!isUnlocked && !card.isPlaceholder && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Locked
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📝 CARD LABEL */}
                <p className="text-center text-[10px] sm:text-[11px] md:text-xs mt-1.5 sm:mt-2 font-bold text-gray-700 truncate px-1">
                  {isUnlocked ? card.name : "???"}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // =====================================
  // 🎨 MAIN UI RENDER
  // =====================================
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 font-bold text-pink-500 text-lg sm:text-xl tracking-widest uppercase">
      Opening Scrapbook...
    </div>
  );

  return (
    <div
      className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-8 bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url("/images/ScrunchiefrillsScrapbook.png")` }}
    >
      {/* 👑 SCRAPBOOK HEADER & SUBTEXT COMBO IMAGE */}
      <div className="flex justify-center items-center text-center mb-10 sm:mb-14 md:mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
          className="w-full max-w-[90vw] sm:max-w-xl md:max-w-2xl px-2 sm:px-4 flex justify-center"
        >
          <img
            src="/images/ScrapbookHeaderCombined.png"
            alt="Scrunchiefrills Scrapbook: Collect Cards, Meet Characters, Unlock Secrets"
            className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_8px_16px_rgba(224,33,113,0.15)]"
          />
        </motion.div>
      </div>

      {/* 📖 COLLECTION SECTIONS */}
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-20 md:space-y-28">
        {renderSection(
          "Bubble Cards", 
          BUBBLE_CARDS_REGISTRY, 
          "bubbleCards", 
          "/images/BlankCardSF.png",
          "/images/BubbleCardsHeading.png",
          "max-w-[240px] sm:max-w-[320px] md:max-w-[380px]"
        )}

        {renderSection(
          "Character Gallery", 
          CHARACTER_CARDS_REGISTRY, 
          "characterCards", 
          "/images/CharBlankCardSF.png",
          "/images/CharacterGalleryHeading.png",
          "max-w-[260px] sm:max-w-[340px] md:max-w-[420px]"
        )}
      </div>
    </div>
  );
};

export default Scrapbook;