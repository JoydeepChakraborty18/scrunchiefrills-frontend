import React from "react";

/**
 * 📊 Transparent Metric Overlay - Pixel-Centered Absolute Alignment
 * Calibrated specifically to position scaled-up text elements and the game title
 * inside the hand-drawn artwork containers without overflowing or clipping.
 */
const GameTopBar = ({ score, timeLeft, lives }) => {
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <div className="w-full h-full relative select-none font-sans pointer-events-none">
      
      {/* 🎀 BRANDED GAME TITLE IMAGE LAYER */}
      {/* Replaced the multi-line text header with the native brand asset image option */}
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2 w-[50%] flex justify-center items-center h-[60px]">
        <img 
          src="/game_img/scrunchie_game_title3.png" 
          alt="Scrunchie Game Title: Scrunchie Popper" 
          className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
        />
      </div>

      {/* SCORE PANEL: Balanced perfectly over the left window box coordinates */}
      {/* 💡 FIXED: Changed layout structure to center axis translate metrics to fix horizontal drift */}
      <div className="absolute left-[17.5%] top-[24%] -translate-x-1/2 w-[100px] text-center flex flex-col justify-center items-center">
        <span className="font-black text-[#e02171] text-sm uppercase tracking-widest block drop-shadow-[0_1px_0px_rgba(255,255,255,0.9)]">
          Score
        </span>
        <span className="font-black text-[#e02171] text-2xl tracking-wider tabular-nums block mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
          {score}
        </span>
      </div>

      {/* LIVES PANEL: Sits dead-center within the custom spherical cloud asset boundary lines */}
      <div className="absolute left-1/2 top-[55%] -translate-x-1/2 w-[130px] text-center flex flex-col justify-center items-center">
        <span className="font-black text-[#e02171] text-sm uppercase tracking-widest block drop-shadow-[0_1px_0px_rgba(255,255,255,0.9)]">
          Lives
        </span>
        <div className="flex justify-center items-center gap-1.5 text-lg mt-1 h-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <span 
              key={idx} 
              className={`transition-all duration-300 drop-shadow-[0_2px_4px_rgba(224,33,113,0.25)] ${
                idx < lives ? "opacity-100 scale-110 filter brightness-105 saturate-110" : "opacity-0 scale-50"
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
      </div>

      {/* TIMER PANEL: Balanced perfectly over the right hanging chalkboard panel coordinates */}
      {/* 💡 FIXED: Configured balanced translate dimensions to pull the timer text block into dead center alignment */}
      <div className="absolute right-[18.5%] top-[18%] translate-x-1/2 w-[100px] text-center flex flex-col justify-center items-center">
        <span className="font-black text-[#2e2640] text-sm uppercase tracking-widest block drop-shadow-[0_1px_0px_rgba(255,255,255,0.9)]">
          Time
        </span>
        <span className={`font-mono font-black text-2xl tracking-wider tabular-nums block mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] ${
          timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-[#2e2640]"
        }`}>
          {formatTime(timeLeft)}
        </span>
      </div>

    </div>
  );
};

export default GameTopBar;