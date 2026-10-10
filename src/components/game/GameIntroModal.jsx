import React from "react";

const GameIntroModal = ({ onStartGame, hasPlayedThisWeek }) => {
  if (hasPlayedThisWeek) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border-4 border-[#e02171] rounded-3xl p-6 shadow-[8px_8px_0px_#e02171] text-center transform transition-all animate-bounce-short">
        {/* Mascot Header */}
        <div className="text-4xl mb-2">✨ 🎀 ✨</div>
        <h2 className="text-3xl font-extrabold text-[#e02171] tracking-wide mb-1 font-sans">
          Miss Scrunchie's
        </h2>
        <h3 className="text-xl font-bold text-gray-700 mb-4 uppercase tracking-wider">
          Scrunchie Popper
        </h3>

        {/* Instructive Scrapbook Section */}
        <div className="bg-[#fff2f8] border-2 border-dashed border-[#e02171]/40 rounded-2xl p-4 mb-6 text-left text-sm text-gray-700 space-y-2">
          <p className="font-semibold text-[#e02171] text-center mb-1">💫 HOW TO PLAY 💫</p>
          <div className="flex items-center gap-2"><span>🌸</span> <span>Tap <b>Scrunchies & Hearts</b> for points!</span></div>
          <div className="flex items-center gap-2"><span>✂️</span> <span>Avoid <b>Scissors & Heartbreaks</b> (-1 life!)</span></div>
          <div className="flex items-center gap-2"><span>⏳</span> <span>You have 60 seconds to score high!</span></div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartGame}
          className="w-full py-3 bg-[#e02171] hover:bg-[#c0195e] text-white font-bold text-lg rounded-2xl border-b-4 border-[#9f124c] shadow-md active:transform active:scale-[0.98] transition-all uppercase tracking-wider"
        >
          Catch the Frills! 🚀
        </button>
        <p className="text-xs text-gray-400 mt-3 font-medium">
          Playable once per week • Refreshes every Sunday
        </p>
      </div>
    </div>
  );
};

export default GameIntroModal;