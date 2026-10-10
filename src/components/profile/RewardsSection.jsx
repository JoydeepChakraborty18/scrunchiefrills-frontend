// src/components/profile/RewardsSection.jsx
import React, { useState } from "react";
import { Gift, Copy, Clock } from "lucide-react";
import toast from "react-hot-toast";

const RewardsSection = ({ rewards = [] }) => {
  const [rewardTab, setRewardTab] = useState("available"); // "available", "used", "expiring"

  const availableRewards = rewards.filter((r) => r.status === "available" || !r.status);
  const usedRewards = rewards.filter((r) => r.status === "used");
  const expiringRewards = rewards.filter((r) => r.status === "expiring" || r.isExpiring);

  const displayedRewards =
    rewardTab === "available"
      ? availableRewards
      : rewardTab === "used"
      ? usedRewards
      : expiringRewards;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code} 🎀`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
            🎁 My Rewards & Coupons ({rewards.length})
          </h3>
          <p className="text-xs text-gray-400">Discounts and perks unlocked from Bubble Cards & orders</p>
        </div>
      </div>

      {/* Tabs matching Screen 7 mockup */}
      <div className="flex gap-2">
        {["available", "used", "expiring"].map((tab) => (
          <button
            key={tab}
            onClick={() => setRewardTab(tab)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition cursor-pointer ${
              rewardTab === tab
                ? "bg-[#E02171] text-white"
                : "bg-white border border-pink-200 text-gray-600 hover:border-[#E02171]"
            }`}
          >
            {tab} ({tab === "available" ? availableRewards.length : tab === "used" ? usedRewards.length : expiringRewards.length})
          </button>
        ))}
      </div>

      {displayedRewards.length === 0 ? (
        <div className="p-8 bg-[#FFF9FB] rounded-2xl border border-pink-100 text-center space-y-2">
          <Gift size={28} className="mx-auto text-pink-300" />
          <p className="text-xs font-bold text-gray-800">No {rewardTab} rewards found</p>
          <p className="text-[10px] text-gray-400">
            Pop bubbles in the weekly Bubble Pop game or complete confirmed orders to unlock exclusive perks!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {displayedRewards.map((rw, idx) => (
            <div
              key={rw.id || rw.code || idx}
              className={`p-3.5 rounded-2xl border-2 transition-all ${
                rw.status === "used" ? "border-gray-200 bg-gray-50/70 opacity-60" : "border-pink-200 bg-[#FFF9FB]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-base font-black text-[#E02171] block">
                    {rw.title || rw.description || "Frill Discount"}
                  </span>
                  <span className="text-xs font-bold text-gray-800 block">
                    {rw.source || "Unlocked Reward"}
                  </span>
                  {rw.validity && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={11} /> {rw.validity}
                    </span>
                  )}
                </div>
                {rw.status !== "used" ? (
                  <button
                    onClick={() => handleCopy(rw.code)}
                    className="px-2.5 py-1 rounded-full bg-white border border-pink-200 text-[#E02171] hover:bg-[#E02171] hover:text-white transition text-xs font-black flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Copy size={11} /> {rw.code}
                  </button>
                ) : (
                  <span className="text-[9px] font-black uppercase text-gray-400 px-2 py-0.5 bg-gray-200 rounded-full">
                    Used
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsSection;