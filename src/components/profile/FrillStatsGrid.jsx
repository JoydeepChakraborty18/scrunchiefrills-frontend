// src/components/profile/FrillStatsGrid.jsx
import React from "react";
import { ChevronRight } from "lucide-react";

const FrillStatsGrid = ({ stats, onViewAllClick }) => {
  const {
    level = 1,
    title = "Frill Novice",
    xp = 0,
    maxXp = 200,
    progressPercent = 0,
    ordersCount = 0,
    bubbleCardsCollected = 0,
    rewardsCount = 0,
    achievementsCount = 0,
  } = stats;

  return (
    <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-pink-100 shadow-sm space-y-3 sm:space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-gray-900 tracking-tight uppercase">
          My Frill Stats
        </h3>
        <button
          onClick={onViewAllClick}
          className="text-[11px] font-bold text-gray-400 hover:text-[#E02171] flex items-center gap-0.5 cursor-pointer transition-colors"
        >
          View All <ChevronRight size={12} />
        </button>
      </div>

      {/* Main Row: Compact Level/XP on Left + Expanded Mini-Cards on Right */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-1">
        
        {/* Left Side: Shorter Level + XP Bar Container (~36% width) */}
        <div className="w-full sm:w-[36%] shrink-0 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl select-none filter drop-shadow-sm leading-none shrink-0 transform -rotate-6">
              👑
            </span>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                Level 0{level}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                {title}
              </p>
            </div>
          </div>

          {/* Shorter XP Progress Bar */}
          <div className="w-full h-2 bg-pink-100/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E02171] to-pink-400 rounded-full transition-all duration-500 shadow-2xs"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>

          {/* XP Fraction */}
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 block text-center">
            {xp} / {maxXp} XP
          </span>
        </div>

        {/* Right Side: Spacious 4 Stat Mini-Cards (~62% width) */}
        <div className="w-full sm:w-[62%] grid grid-cols-4 gap-1.5 sm:gap-2">
          {/* 1. Orders */}
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFF5F9] border border-pink-200/80 shadow-2xs flex items-center justify-center text-base sm:text-lg select-none mb-1">
              🛍️
            </div>
            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              {ordersCount}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-0.5 whitespace-nowrap">
              Orders
            </span>
          </div>

          {/* 2. Bubble Cards */}
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-2xs flex items-center justify-center text-base sm:text-lg select-none mb-1">
              🫧
            </div>
            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              {bubbleCardsCollected}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-0.5 whitespace-nowrap">
              Bubble Cards
            </span>
          </div>

          {/* 3. Rewards */}
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-pink-50 border border-pink-200/80 shadow-2xs flex items-center justify-center text-base sm:text-lg select-none mb-1">
              🎁
            </div>
            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              {rewardsCount}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-0.5 whitespace-nowrap">
              Rewards
            </span>
          </div>

          {/* 4. Achievements */}
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-2xs flex items-center justify-center text-base sm:text-lg select-none mb-1">
              🏆
            </div>
            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              {achievementsCount}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-0.5 whitespace-nowrap">
              Achievements
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FrillStatsGrid;