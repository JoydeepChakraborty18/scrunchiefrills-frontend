// src/components/profile/AvatarCollectionSection.jsx
import React from "react";
import { Lock, Check } from "lucide-react";
import { AVATAR_REGISTRY } from "../../data/avatarRegistry";

const AvatarCollectionSection = ({
  currentAvatarId,
  userStats,
  onSelectAvatar,
  onOpenPicker,
}) => {
  const isUnlocked = (item) => {
    if (item.unlocked) return true;
    if (item.reqKey === "ordersCount" && (userStats.ordersCount || 0) >= item.reqThreshold) return true;
    if (item.reqKey === "bubbleCardsCollected" && (userStats.bubbleCardsCollected || 0) >= item.reqThreshold) return true;
    return false;
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
            🎀 My Avatars
          </h3>
          <p className="text-[10px] text-gray-400">
            Choose, unlock and collect exclusive Scrunchiefrills avatars
          </p>
        </div>
        <button
          onClick={onOpenPicker}
          className="text-xs font-black text-[#E02171] hover:underline cursor-pointer"
        >
          Change Avatar &rarr;
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
        {AVATAR_REGISTRY.map((item) => {
          const unlocked = isUnlocked(item);
          const isSelected = currentAvatarId === item.avatarId;

          return (
            <div
              key={item.avatarId}
              onClick={() => {
                if (unlocked) onSelectAvatar(item.avatarId);
              }}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center relative ${
                isSelected
                  ? "border-[#E02171] bg-[#FFF2F8] shadow-xs cursor-default"
                  : unlocked
                  ? "border-pink-200 bg-[#FFF2F8] hover:border-[#E02171] cursor-pointer"
                  : "border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed"
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-[#E02171] text-white rounded-full flex items-center justify-center text-[9px] shadow-xs">
                  <Check size={10} />
                </span>
              )}

              {!unlocked && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-[9px]">
                  <Lock size={9} />
                </span>
              )}

              {/* Seamless Avatar Character Frame */}
              <div className="w-16 h-16 rounded-full p-1 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`w-full h-full object-contain ${!unlocked ? "filter grayscale" : ""}`}
                />
              </div>

              <span className="text-[11px] font-black text-gray-900 leading-tight">
                {item.name}
              </span>

              <span className="text-[9px] font-bold text-gray-400 mt-1">
                {unlocked ? "Unlocked" : item.unlockRequirement}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarCollectionSection;