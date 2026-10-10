// src/components/profile/ScrapbookGridSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { bubbleCards } from "../../data/bubbleCards";

const ScrapbookGridSection = ({ bubbleCardsMap = {} }) => {
  const navigate = useNavigate();

  // Filter only cards the user has collected at least once
  const collectedEntries = Object.keys(bubbleCards).filter(
    (cardId) => (bubbleCardsMap[cardId] || 0) > 0
  );

  const totalCollectedCount = collectedEntries.reduce(
    (acc, id) => acc + (bubbleCardsMap[id] || 0),
    0
  );

  return (
    <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {/* ✅ After: Using whitespace-nowrap and flex-wrap alignment */}
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1">📖 My Scrapbook Cards</span>
            <span className="whitespace-nowrap text-[11px] font-bold text-gray-500 normal-case bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
              ({collectedEntries.length} Unique &bull; {totalCollectedCount} Total)
            </span>
          </h3>
          <p className="text-[10px] text-gray-400">
            Bubble cards unlocked via the weekly Bubble Pop game
          </p>
        </div>
        <button
          onClick={() => navigate("/scrapbook")}
          className="text-xs font-black text-[#E02171] hover:underline cursor-pointer"
        >
          Open Scrapbook &rarr;
        </button>
      </div>

      {collectedEntries.length === 0 ? (
        <div className="p-6 text-center bg-[#FFF9FB] rounded-2xl border border-pink-100 space-y-1.5">
          <span className="text-2xl">🎴</span>
          <p className="text-xs font-bold text-gray-800">No cards collected yet!</p>
          <p className="text-[10px] text-gray-400">
            Pop bubbles in the weekly Bubble Pop game to collect cards for your scrapbook.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {collectedEntries.map((cardId) => {
            const card = bubbleCards[cardId] || { name: cardId, rarity: "common" };
            const count = bubbleCardsMap[cardId] || 0;

            return (
              <div
                key={cardId}
                className="p-3 rounded-2xl bg-[#FFF9FB] border border-pink-100 flex items-center justify-between transition hover:border-pink-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🫧</span>
                  <div>
                    <h5 className="text-xs font-black text-gray-900 leading-tight">
                      {card.name}
                    </h5>
                    <span className="text-[9px] font-bold text-pink-500 uppercase">
                      {card.rarity || "Bubble Card"}
                    </span>
                  </div>
                </div>

                {/* Number of the same card collected */}
                <div className="shrink-0 flex items-center justify-center bg-white border border-pink-200 px-2.5 py-1 rounded-full shadow-2xs">
                  <span className="text-xs font-black text-[#E02171] leading-none">
                    &times;{count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScrapbookGridSection;