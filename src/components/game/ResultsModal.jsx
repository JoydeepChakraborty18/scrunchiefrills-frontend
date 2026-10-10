import React from "react";

const ResultsModal = ({ score, scoreTier, onClaimReward, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border-4 border-[#e02171] rounded-3xl p-6 shadow-[8px_8px_0px_#e02171] text-center transform transition-all">
        <div className="text-4xl mb-2">🏆 🎉 💖</div>
        <h2 className="text-3xl font-black text-[#e02171] uppercase tracking-wide mb-1">
          Time's Up!
        </h2>
        <p className="text-gray-500 text-sm mb-4 font-semibold">You handled the cyclone beautifully!</p>

        {/* Score Card Display */}
        <div className="bg-[#fff2f8] border-2 border-dashed border-[#e02171]/30 rounded-2xl p-4 mb-6">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-widest block">Final Score</span>
          <span className="text-4xl font-black text-gray-900">{score}</span>
          <div className="mt-2 text-sm font-bold text-[#e02171]">
            Tier Ranking: <span className="underline">{scoreTier}</span> ✨
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClaimReward}
          className="w-full py-3 bg-[#e02171] hover:bg-[#c0195e] text-white font-bold text-lg rounded-xl border-b-4 border-[#9f124c] shadow-md transition-all uppercase tracking-wider"
        >
          Claim Weekly Reward 🎁
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;