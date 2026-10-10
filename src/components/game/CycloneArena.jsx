import React from "react";

/**
 * 🌪️ Tap The Scrunchie - Pure Artwork Arena Canvas
 * Keeps the center field completely empty for the bubble layer, 
 * housing zero placeholder buttons or temporary testing interfaces.
 */
const CycloneArena = ({ children, gameState }) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent select-none">
      
      {/* Pure Gameplay Bubble Space Runway Component Plane */}
      <div className="w-full h-full relative bg-transparent z-10">
        {children}
      </div>

      {/* ✨ PORTAL CENTER RADICAL FOCUS NODE REFERENCE ANCHOR */}
      <div 
        id="BubbleSpawnPoint"
        className="absolute left-[calc(50%-50px)] bottom-[140px] -translate-x-1/2 w-4 h-4 rounded-full bg-transparent pointer-events-none z-0"
        style={{ transformOrigin: "center center" }}
      />

    </div>
  );
};

export default CycloneArena;