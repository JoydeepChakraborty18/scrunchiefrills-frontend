// src/components/profile/RewardsSection.jsx
import React, { useState, useMemo } from "react";
import { Gift, Copy, Clock } from "lucide-react";
import toast from "react-hot-toast";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const RewardsSection = ({ rewards = [] }) => {
  const [rewardTab, setRewardTab] = useState("available"); // "available", "used", "expiring"

  // 🧮 Compute real-time lifecycle states based on earnedAt & status
  const processedRewards = useMemo(() => {
    const now = Date.now();

    return rewards.map((rw) => {
      let isExpired = false;
      let isExpiringSoon = false;
      let daysLeft = null;

      if (rw.earnedAt) {
        const earnedTime = new Date(rw.earnedAt).getTime();
        const expirationTime = earnedTime + FOURTEEN_DAYS_MS;
        const msRemaining = expirationTime - now;

        if (msRemaining <= 0) {
          isExpired = true;
        } else {
          daysLeft = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
          if (msRemaining <= THREE_DAYS_MS) {
            isExpiringSoon = true;
          }
        }
      }

      // Explicit status overrides or computed date fallbacks
      const resolvedStatus = rw.status === "used" 
        ? "used" 
        : isExpired 
        ? "expired" 
        : rw.status || "available";

      return {
        ...rw,
        resolvedStatus,
        isExpiringSoon,
        daysLeft,
      };
    });
  }, [rewards]);

  const availableRewards = processedRewards.filter(
    (r) => r.resolvedStatus === "available"
  );
  const usedRewards = processedRewards.filter(
    (r) => r.resolvedStatus === "used" || r.resolvedStatus === "expired"
  );
  const expiringRewards = processedRewards.filter(
    (r) => r.resolvedStatus === "available" && (r.isExpiringSoon || r.status === "expiring")
  );

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
          <p className="text-xs text-gray-400">
            Discounts and perks unlocked from the Cyclone Arcade & orders
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "available", label: "Available", count: availableRewards.length },
          { key: "used", label: "Used / Expired", count: usedRewards.length },
          { key: "expiring", label: "Expiring Soon", count: expiringRewards.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRewardTab(tab.key)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition cursor-pointer ${
              rewardTab === tab.key
                ? "bg-[#E02171] text-white"
                : "bg-white border border-pink-200 text-gray-600 hover:border-[#E02171]"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {displayedRewards.length === 0 ? (
        <div className="p-8 bg-[#FFF9FB] rounded-2xl border border-pink-100 text-center space-y-2">
          <Gift size={28} className="mx-auto text-pink-300" />
          <p className="text-xs font-bold text-gray-800">
            No {rewardTab === "used" ? "used or expired" : rewardTab} rewards found
          </p>
          <p className="text-[10px] text-gray-400">
            Play the weekly Cyclone Arcade game to unlock exclusive discount vouchers and perks!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {displayedRewards.map((rw, idx) => {
            const isInactive = rw.resolvedStatus === "used" || rw.resolvedStatus === "expired";

            return (
              <div
                key={rw.id || rw.code || idx}
                className={`p-3.5 rounded-2xl border-2 transition-all ${
                  isInactive
                    ? "border-gray-200 bg-gray-50/70 opacity-60"
                    : "border-pink-200 bg-[#FFF9FB]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-base font-black text-[#E02171] block">
                      {rw.title || rw.description || "Frill Discount"}
                    </span>
                    <span className="text-xs font-bold text-gray-800 block">
                      {rw.source || "The Cyclone Arcade 🌪️"}
                    </span>
                    
                    {/* Dynamic Countdown Tag */}
                    {!isInactive && rw.daysLeft !== null && (
                      <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1 mt-1">
                        <Clock size={11} className={rw.isExpiringSoon ? "text-amber-500" : "text-gray-400"} />
                        {rw.daysLeft <= 1 ? "Expires today!" : `Expires in ${rw.daysLeft} days`}
                      </span>
                    )}

                    {isInactive && (
                      <span className="text-[10px] text-gray-400 font-medium block mt-1">
                        {rw.resolvedStatus === "used" ? "Redeemed on order" : "Expired"}
                      </span>
                    )}
                  </div>

                  {!isInactive ? (
                    <button
                      onClick={() => handleCopy(rw.code)}
                      className="px-2.5 py-1 rounded-full bg-white border border-pink-200 text-[#E02171] hover:bg-[#E02171] hover:text-white transition text-xs font-black flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Copy size={11} /> {rw.code}
                    </button>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-gray-400 px-2 py-0.5 bg-gray-200 rounded-full shrink-0">
                      {rw.resolvedStatus === "used" ? "Used" : "Expired"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RewardsSection;