import React from "react";

const RewardPopup = ({ rewardDetails, onClose }) => {
  if (!rewardDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white border-4 border-yellow-400 rounded-3xl p-6 shadow-[8px_8px_0px_#facc15] text-center relative overflow-hidden">
        
        {/* Starburst celebratory background flair */}
        <div className="absolute -inset-10 opacity-10 bg-[conic-gradient(from_0deg,transparent,yellow,transparent)] animate-[spin_10s_linear_infinite] pointer-events-none"></div>

        <div className="text-5xl mb-2 animate-bounce">💝</div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">
          Reward Unlocked!
        </h2>
        <p className="text-[#e02171] text-xs uppercase font-extrabold tracking-widest mb-4">
          Scrunchiefrills Perks
        </p>

        {/* Voucher Reward Box */}
        <div className="bg-yellow-50/80 border-2 border-dashed border-yellow-400 rounded-2xl p-4 mb-4">
          <span className="text-xs font-black uppercase text-[#e02171] block mb-1">
            {rewardDetails.title || "20% OFF NEXT ORDER"}
          </span>
          <span className="text-2xl font-black text-yellow-600 tracking-wider font-mono block">
            {rewardDetails.code}
          </span>
          <span className="text-xs text-gray-500 font-medium block mt-1.5">
            {rewardDetails.description}
          </span>
          {rewardDetails.validity && (
            <span className="text-[10px] text-gray-400 font-semibold block mt-1">
              ⏳ {rewardDetails.validity}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#e02171] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
        >
          Sweet, saved to My Rewards! 🎀
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;