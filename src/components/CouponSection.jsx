// src/components/CouponSection.jsx
import React, { useState, useEffect } from "react";
import { usePricing } from "../context/PricingContext";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Tag, Check, AlertCircle } from "lucide-react";

const CouponSection = () => {
  const { totalScrunchies, selectedBundle, appliedCoupon, applyCoupon, removeCoupon } = usePricing();
  const [userRewards, setUserRewards] = useState([]);

  useEffect(() => {
    const fetchRewards = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "customers", user.uid));
        if (snap.exists()) {
          const rewards = snap.data().rewards || [];
          setUserRewards(rewards.filter((r) => r.status === "available" || !r.status));
        }
      } catch (err) {
        console.warn("Could not load user rewards:", err);
      }
    };
    fetchRewards();
  }, []);

  const cycloneRewards = userRewards.filter((r) => 
    r.code === "CYCLONE10" || r.code === "CYCLONE20"
  );

  if (cycloneRewards.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-sm text-left mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-black uppercase text-gray-900 flex items-center gap-1.5">
          <Tag size={15} className="text-[#E02171]" /> Available Rewards & Coupons
        </h3>
        <span className="text-[10px] font-bold text-gray-400">
          Mutually exclusive with bundle offers
        </span>
      </div>

      <div className="space-y-2.5">
        {cycloneRewards.map((reward) => {
          const isApplied = appliedCoupon?.code === reward.code;
          const isBundleBlocking = Boolean(selectedBundle);
          
          // Rule validation per coupon code
          const isEligibleItems =
            reward.code === "CYCLONE10"
              ? totalScrunchies === 3 || totalScrunchies === 6
              : totalScrunchies >= 9;

          const isDisabled = isBundleBlocking || !isEligibleItems;
          const discountRate = reward.code === "CYCLONE10" ? 10 : 20;

          return (
            <div
              key={reward.id || reward.code}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isApplied
                  ? "bg-[#FFF2F8] border-[#E02171] shadow-xs"
                  : isDisabled
                  ? "bg-gray-100 border-gray-200 opacity-60"
                  : "bg-white border-pink-200 hover:border-[#E02171]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-gray-900 tracking-wider">
                    {reward.code}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isDisabled ? "bg-gray-200 text-gray-500" : "bg-pink-100 text-[#E02171]"
                  }`}>
                    {discountRate}% OFF
                  </span>
                </div>

                {/* Clear guidance prompts */}
                {isBundleBlocking ? (
                  <p className="text-[10px] text-amber-700 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle size={11} className="shrink-0" /> Bundle offer applied. Remove bundle offer below to activate.
                  </p>
                ) : !isEligibleItems ? (
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    {reward.code === "CYCLONE10"
                      ? "Applicable only on Pack of 3 or Pack of 6"
                      : `Add ${Math.max(0, 9 - totalScrunchies)} more to activate on Pack of 9+`}
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    ✨ Ready to activate {discountRate}% OFF!
                  </p>
                )}
              </div>

              {/* Action Button */}
              {isApplied ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="px-3 py-1.5 rounded-xl bg-[#E02171] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Check size={12} /> Applied
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => applyCoupon(reward)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                    isDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#E02171] hover:bg-black text-white cursor-pointer shadow-xs active:scale-95"
                  }`}
                >
                  Apply
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CouponSection;