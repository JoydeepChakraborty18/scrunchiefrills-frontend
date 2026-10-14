import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Info } from "lucide-react";
import { usePricing } from "../context/PricingContext";
import toast from "react-hot-toast";

export const BUNDLE_TIERS = [
  {
    id: "pack-6",
    name: "PACK OF 6",
    count: 6,
    bundlePrice: 1249, // Updated to ₹1,249 for a smooth volume escalator
    launchTotal: 1494,
    savings: 245,
    savingsPct: "16.4%",
    image: "/images/loot_box_bundles.png",
    badge: "SQUAD ESSENTIAL 👯‍♀️",
  },
  {
    id: "pack-3",
    name: "PACK OF 3",
    count: 3,
    bundlePrice: 649,
    launchTotal: 747,
    savings: 98,
    savingsPct: "13.1%",
    image: "/images/loot_box_bundles.png",
    badge: "MINI STASH ✨",
  },
  {
    id: "pack-9",
    name: "PACK OF 9",
    count: 9,
    bundlePrice: 1799,
    launchTotal: 2241,
    savings: 442,
    savingsPct: "19.7%",
    image: "/images/loot_box_bundles.png",
    badge: "VIBE HEAVY 💫",
  },
  {
    id: "pack-12",
    name: "PACK OF 12",
    count: 12,
    bundlePrice: 2199,
    launchTotal: 2988,
    savings: 789,
    savingsPct: "26.4%",
    image: "/images/loot_box_bundles.png",
    badge: "THE JUMBO VAULT 🏦",
  },
];

const BundleUnlocksSection = () => {
  const { totalScrunchies, selectedBundle, applyBundle, removeBundle } = usePricing();

  // 🛡️ Strict Bundle Invalidation: Auto-remove bundle if quantity does not match exact tier count
  useEffect(() => {
    if (selectedBundle && totalScrunchies !== selectedBundle.count) {
      removeBundle();
    }
  }, [totalScrunchies, selectedBundle, removeBundle]);

  // Determine status and dynamic guidance copy for each bundle card
  const getTierStatus = (bundle) => {
    const isExactMatch = totalScrunchies === bundle.count;
    const isSelected = selectedBundle?.id === bundle.id && isExactMatch;

    let helperText = "";
    let isRecommended = false;

    if (totalScrunchies === 0) {
      helperText = `Add ${bundle.count} items to unlock`;
    } else if (totalScrunchies < bundle.count) {
      const diff = bundle.count - totalScrunchies;
      helperText = `Add ${diff} more item${diff > 1 ? "s" : ""} to unlock`;
    } else if (isExactMatch) {
      helperText = `You're eligible! (${totalScrunchies} items)`;
      isRecommended = true;
    } else {
      const diff = totalScrunchies - bundle.count;
      helperText = `Remove ${diff} item${diff > 1 ? "s" : ""} to match pack`;
    }

    return { isSelected, isExactMatch, helperText, isRecommended };
  };

  // Re-order bundle tiers: Exact match goes to top, then closest ascending targets
  const sortedTiers = [...BUNDLE_TIERS].sort((a, b) => {
    const aExact = totalScrunchies === a.count ? 1 : 0;
    const bExact = totalScrunchies === b.count ? 1 : 0;
    if (bExact !== aExact) return bExact - aExact;
    return a.count - b.count;
  });

  return (
    <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-pink-100 text-left">
      {/* 💖 Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">🎁</span>
          <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight uppercase flex items-center gap-1.5">
            BUNDLE UNLOCKS <Sparkles size={16} className="text-[#E02171]" />
          </h2>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#E02171] bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
          EXTRA SAVINGS
        </span>
      </div>

      <p className="text-xs text-gray-500 font-semibold mb-1">
        Your scrunchie case deserves a little extra love. 💖
      </p>
      <p className="text-[11px] text-gray-400 font-medium mb-3">
        Choose a bundle offer below to unlock special prices.
      </p>

      {/* ⚠️ Non-stacking transparency badge */}
      <div className="mb-4 bg-pink-50/60 border border-pink-200/80 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
        <Info size={12} className="text-[#E02171] shrink-0" />
        <span>Bundle unlocks provide our steepest bulk rates and cannot be combined with extra percentage coupons.</span>
      </div>

      {/* 🎀 Coupon Cards List */}
      <div className="space-y-3.5">
        {sortedTiers.map((bundle) => {
          const { isSelected, isExactMatch, helperText, isRecommended } = getTierStatus(bundle);
          const hasNeonGlow = isSelected || isExactMatch;

          return (
            <motion.div
              key={bundle.id}
              layout
              transition={{ duration: 0.25 }}
              className={`relative rounded-2xl p-3.5 sm:p-4 transition-all duration-300 ${
                isSelected
                  ? "bg-[#FFF2F8] border-2 border-[#E02171] shadow-[0_0_15px_rgba(224,33,113,0.35)]"
                  : hasNeonGlow
                  ? "bg-white border-2 border-[#E02171] shadow-[0_0_12px_rgba(224,33,113,0.22)] animate-pulse"
                  : "bg-white border border-gray-200 hover:border-pink-300 opacity-90"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                
                {/* Left: Bundle Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-pink-50 border border-pink-100 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={bundle.image}
                      alt={bundle.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/ScrunchiefrillsComingSoon1.png";
                      }}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-tight">
                        {bundle.name}
                      </h4>
                      {isRecommended ? (
                        <span className="text-[8px] sm:text-[9px] font-black text-white bg-[#E02171] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                          ⭐ BEST FOR YOU
                        </span>
                      ) : bundle.badge ? (
                        <span className="text-[8px] sm:text-[9px] font-black text-[#E02171] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {bundle.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-gray-500 font-semibold">
                      {bundle.count} Cloud XXL scrunchies
                    </p>

                    <div className="inline-block mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                      Save ₹{bundle.savings} ({bundle.savingsPct} extra savings)
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Action Button */}
                <div className="flex flex-col items-end flex-shrink-0 text-right">
                  <span className="text-sm sm:text-base font-black text-[#E02171]">
                    ₹{bundle.bundlePrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[11px] text-gray-400 line-through font-semibold">
                    ₹{bundle.launchTotal.toLocaleString("en-IN")}
                  </span>

                  <div className="mt-2">
                    {isSelected ? (
                      <button
                        onClick={() => {
                          removeBundle();
                          toast("Bundle offer removed. Launch price restored! 🎀", { icon: "↩️" });
                        }}
                        className="py-1.5 px-3 bg-[#E02171] text-white rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md hover:bg-[#c71761] transition cursor-pointer"
                      >
                        <Check size={12} /> APPLIED
                      </button>
                    ) : (
                      <button
                        disabled={!isExactMatch}
                        onClick={() => {
                          if (!isExactMatch) return;
                          applyBundle(bundle);
                          toast.success(`🎉 ${bundle.name} unlocked! Saved an extra ₹${bundle.savings}!`);
                        }}
                        className={`py-1.5 px-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition flex items-center gap-1 ${
                          isExactMatch
                            ? "bg-[#E02171] hover:bg-[#c71761] text-white shadow-md shadow-pink-200 cursor-pointer"
                            : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {isExactMatch ? (
                          <>
                            ADD BUNDLE OFFER <Sparkles size={11} />
                          </>
                        ) : (
                          "ADD DEAL"
                        )}
                      </button>
                    )}
                  </div>

                  {/* Status helper under button */}
                  <span
                    className={`text-[9px] font-bold mt-1 ${
                      isExactMatch ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    {isExactMatch ? `✔ ${helperText}` : helperText}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BundleUnlocksSection;