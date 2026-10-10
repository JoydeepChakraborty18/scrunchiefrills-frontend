import React from "react";

const MARQUEE_ITEMS = [
  "APPLICABLE FREE SHIPPING DISPLAYED AT CHECKOUT",
  //"USE CODE 'WELCOME10' FOR 10% OFF FIRST ORDER",
  "HANDMADE SATIN SCRUNCHIES",
  "SLAY THE FRILL WAY 💖",
  "NEW DROPS LIVE NOW",
];

export default function MarqueeBar() {
  return (
    <div 
      className="w-full overflow-hidden whitespace-nowrap bg-gradient-to-r from-[#A7ECEE] via-[#FFD3E2] to-[#A7ECEE] py-2 border-b border-pink-200 select-none z-40 relative"
      aria-label="Promotional announcements"
    >
      {/* Track duplicated 2x so seamless infinite loop has no gap */}
      <div className="inline-flex w-max animate-marquee hover:[animation-play-state:paused]">
        {/* First repetition */}
        <div className="flex items-center gap-6 pr-6">
          {MARQUEE_ITEMS.map((item, idx) => (
            <span
              key={`m1-${idx}`}
              className="inline-flex items-center gap-4 text-[10px] md:text-xs font-black tracking-widest text-gray-800 uppercase"
            >
              <span>{item}</span>
              <span className="text-pink-500 text-sm">🌸</span>
            </span>
          ))}
        </div>

        {/* Second repetition to create continuous seamless loop */}
        <div className="flex items-center gap-6 pr-6" aria-hidden="true">
          {MARQUEE_ITEMS.map((item, idx) => (
            <span
              key={`m2-${idx}`}
              className="inline-flex items-center gap-4 text-[10px] md:text-xs font-black tracking-widest text-gray-800 uppercase"
            >
              <span>{item}</span>
              <span className="text-pink-500 text-sm">🌸</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}