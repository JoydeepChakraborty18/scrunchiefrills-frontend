import React from "react";

const CooldownCard = ({ onBackToShop }) => {
  return (
    <div className="w-full max-w-md bg-white border-4 border-gray-300 rounded-3xl p-8 shadow-[8px_8px_0px_#cbd5e1] text-center my-12 mx-auto">
      <div className="text-5xl mb-4">💤 ⏰ 🌸</div>
      <h2 className="text-2xl font-black text-gray-700 tracking-wide mb-2">
        You're All Caught Up!
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-6">
        You have already captured your rewards from the Cyclone for this week. Miss Scrunchie is currently reloading the vault with rare scrunchies!
      </p>

      {/* Countdown mock design element */}
      <div className="bg-[#fff2f8] border border-gray-200 rounded-2xl py-3 px-4 mb-6 inline-block">
        <span className="text-xs uppercase tracking-widest text-gray-400 block font-bold">Next Drop In</span>
        <span className="text-xl font-mono font-black text-[#e02171]">4d : 12h : 18m</span>
      </div>

      <button
        onClick={onBackToShop}
        className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all shadow-md uppercase tracking-wider text-sm"
      >
        🛍️ Explore The Shop Route
      </button>
    </div>
  );
};

export default CooldownCard;