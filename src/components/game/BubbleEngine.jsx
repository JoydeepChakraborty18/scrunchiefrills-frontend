import React, { useState, useEffect, useRef } from "react";

// --- 🎨 Brand Image Assets Map Reference Configuration ---
const ASSET_IMAGES = {
  scrunchie: [
    "/game_img/scrunchie_dark_green.png",
    "/game_img/scrunchie_golden.png",
    "/game_img/scrunchie_light_blue.png",
    "/game_img/scrunchie_light_green.png",
    "/game_img/scrunchie_light_orange.png",
    "/game_img/scrunchie_maroon.png",
    "/game_img/scrunchie_orange.png",
    "/game_img/scrunchie_pink.png",
    "/game_img/scrunchie_purple.png",
    "/game_img/scrunchie_sky_blue.png",
    "/game_img/scrunchie_yellow.png"
  ],
  heart: "/game_img/heart.png",
  scissors: "/game_img/scissors.png",
  heartbreak: "/game_img/heartbreak.png"
};

const getRandomObjectType = () => {
  const rand = Math.random() * 100;
  if (rand < 70) return "scrunchie";
  if (rand < 82) return "heart";
  if (rand < 92) return "scissors";
  return "heartbreak";
};

const getRandomAssetUrl = (type) => {
  if (type === "scrunchie") {
    const list = ASSET_IMAGES.scrunchie;
    return list[Math.floor(Math.random() * list.length)];
  }
  return ASSET_IMAGES[type];
};

/**
 * 🫧 THREE-TIER 3D LAYERED BUBBLE ENGINE (PHASE 3 EDITION)
 * Implements high-performance low-latency standalone audio triggers (`bubble_pop.mp3`),
 * temporary velocity freeze transformations, keyframe pop overlays, and garbage collection.
 */
const BubbleEngine = ({ 
  isActive, 
  onScrunchieTap, 
  onHeartTap, 
  onScissorsTap, 
  onHeartbreakTap,
  speedMultiplier = 1 // 💡 Added explicitly to component inputs with a safe fallback default 
}) => {
  const [bubbles, setBubbles] = useState([]);
  const bubblesRef = useRef([]);

  useEffect(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);

  // --- 🧬 Layered Factory Node Spawning Formula ---
  const createNewBubbleNode = () => {
    const type = getRandomObjectType();
    const initialDriftDirection = Math.random() > 0.5 ? 1 : -1;

    const layerRoll = Math.random() * 100;
    let depthLayer = 1;
    if (layerRoll < 30) depthLayer = 0;
    else if (layerRoll > 75) depthLayer = 2;

    let depthZIndex = 20;
    let scaleModifier = 1.0;
    if (depthLayer === 0) { depthZIndex = 10; scaleModifier = 0.65; }
    else if (depthLayer === 2) { depthZIndex = 30; scaleModifier = 1.35; }

    const baseSpeedY = 2.4 + Math.random() * 1.6;

    return {
      id: `bubble_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      imgSrc: getRandomAssetUrl(type),
      depthLayer,
      zIndex: depthZIndex,
      x: (Math.random() - 0.5) * 8, 
      y: 0,
      spawnTime: Date.now(),
      speedY: baseSpeedY,
      maxScale: (0.75 + Math.random() * 0.3) * scaleModifier,
      driftFrequency: 0.011 + Math.random() * 0.015,
      driftAmplitude: (depthLayer === 0 ? 15 : depthLayer === 2 ? 40 : 25) + Math.random() * 5,
      driftPhase: Math.random() * Math.PI * 2,
      biasDrift: (0.1 + Math.random() * 0.25) * initialDriftDirection,
      rotation: (Math.random() - 0.5) * 35,
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      wobbleFrequency: 0.03 + Math.random() * 0.04,
      wobbleIntensity: depthLayer === 0 ? 0.02 : depthLayer === 2 ? 0.06 : 0.04,
      wobblePhase: Math.random() * Math.PI,
      scale: 0.15,
      opacity: 0,
      isExpelled: false,
      
      // ── 🎯 PHASE 3 PROPERTIES ──
      isPopped: false,
      popTime: null
    };
  };

  // --- 🎵 LOW-LATENCY AUDIO EVENT ENGINE TRIGGER ---
  const playPopAudioTrack = () => {
    try {
      const audioNode = new Audio("/sounds/bubble_pop.mp3");
      audioNode.volume = 0.65;
      audioNode.play();
    } catch (err) {
      console.warn("Audio contextual play blocked or uninitialized: ", err);
    }
  };

  // --- 🎯 UNIFIED INTERACTION MULTIPLEXER ---
  const handleBubbleInteraction = (bubble) => {
    // Stop interaction if bubble is already undergoing garbage collection pop sequence
    if (bubble.isPopped) return;

    // 1. Immediately trigger audio context feedback sound
    playPopAudioTrack();

    // 2. State-Driven Flagging: Freeze coordinates inside the loop context locally first
    setBubbles((prev) => 
      prev.map((b) => b.id === bubble.id ? { ...b, isPopped: true, popTime: Date.now() } : b)
    );

    // 3. Inform Host Game Shell Auth Matrix of point / life updates
    if (bubble.type === "scrunchie" && onScrunchieTap) {
      onScrunchieTap(bubble.id);
    } else if (bubble.type === "heart" && onHeartTap) {
      onHeartTap(bubble.id);
    } else if (bubble.type === "scissors" && onScissorsTap) {
      onScissorsTap(bubble.id);
    } else if (bubble.type === "heartbreak" && onHeartbreakTap) {
      onHeartbreakTap(bubble.id);
    }
  };

  // --- 1. Background Pacing Populator Loop ---
  useEffect(() => {
    if (!isActive) {
      setBubbles([]);
      return;
    }

    const paceInterval = setInterval(() => {
      // Don't count popping items toward active bubble limits to keep layout crowded cleanly
      const activeUnpoppedCount = bubblesRef.current.filter(b => !b.isPopped).length;
      if (activeUnpoppedCount >= 8) return;
      
      setBubbles((prev) => [...prev, createNewBubbleNode()]);
    }, 450);

    return () => clearInterval(paceInterval);
  }, [isActive]);

  // --- 2. Master 60FPS Parallax Physics & Garbage Collection Loop ---
  // 💡 Note: speedMultiplier included in the tracking array below to handle mid-game recalculations smoothly
  useEffect(() => {
    if (!isActive) return;

    let animationFrameId;

    const updatePhysicsFrame = () => {
      const now = Date.now();
      let replacementSpawnCount = 0;

      setBubbles((prevBubbles) => {
        const processedList = prevBubbles.map((b) => {
          // ── 🗑️ GARBAGE CLEANUP TIMELINE PROCESSOR (PHASE 3) ──
          if (b.isPopped) {
            const timeSincePop = now - b.popTime;
            
            // Pop timeline completes at 250ms -> Trigger death removal flag
            if (timeSincePop >= 250) {
              return { ...b, opacity: 0, isExpelled: true, _triggerBirth: true };
            }
            
            // Fast scaling expansion + quick linear opacity dip during burst timeline
            const popProgress = timeSincePop / 250;
            return {
              ...b,
              scale: b.maxScale * (1 + popProgress * 0.35),
              opacity: Math.max(0, 1 - popProgress),
              _triggerBirth: false
            };
          }

          // ── STANDARD CRUISING MOVEMENTS PLANE ──
          // 💡 FIXED: Multiplied the vertical displacement step by our authoritative speed prop modifier
          const ageMs = now - b.spawnTime;
          const nextY = b.y + (b.speedY * speedMultiplier); 
          const nextRotation = b.rotation + (b.rotationSpeed * speedMultiplier);

          let currentScale = b.scale;
          let currentOpacity = b.opacity;
          let nextX = b.x;

          if (ageMs < 500) {
            const progress = ageMs / 500;
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            currentScale = 0.15 + (b.maxScale - 0.15) * easeOutCubic;
            currentOpacity = easeOutCubic;
            nextX = (Math.sin(nextY * b.driftFrequency + b.driftPhase) * b.driftAmplitude) * easeOutCubic;
          } else {
            currentScale = b.maxScale;
            nextX = Math.sin(nextY * b.driftFrequency + b.driftPhase) * b.driftAmplitude + (nextY * b.biasDrift);
            
            if (nextY > 330) {
              currentOpacity = Math.max(0, 1 - (nextY - 330) / 130);
            } else {
              currentOpacity = 1;
            }
          }

          if (b.depthLayer === 0 && nextY <= 330) {
            currentOpacity *= 0.75;
          }

          let nodeShouldTriggerBirth = false;
          if ((nextY >= 460 || currentOpacity <= 0) && !b.isExpelled) {
            nodeShouldTriggerBirth = true;
          }

          return {
            ...b,
            x: nextX,
            y: nextY,
            scale: currentScale,
            rotation: nextRotation,
            opacity: currentOpacity,
            isExpelled: b.isExpelled || nodeShouldTriggerBirth,
            _triggerBirth: nodeShouldTriggerBirth
          };
        });

        processedList.forEach((node) => {
          if (node._triggerBirth) replacementSpawnCount++;
        });

        // Retain popping elements on screen during their structural fade window
        const activeRemainingBubbles = processedList.filter(
          (b) => (b.y < 465 && b.opacity > 0) || (b.isPopped && !b.isExpelled)
        );

        if (replacementSpawnCount > 0 && activeRemainingBubbles.filter(b => !b.isPopped).length < 8) {
          const spawnSlotsAvailable = 8 - activeRemainingBubbles.filter(b => !b.isPopped).length;
          const trueSpawns = Math.min(replacementSpawnCount, spawnSlotsAvailable);
          
          for (let i = 0; i < trueSpawns; i++) {
            activeRemainingBubbles.push(createNewBubbleNode());
          }
        }

        return activeRemainingBubbles;
      });

      animationFrameId = requestAnimationFrame(updatePhysicsFrame);
    };

    animationFrameId = requestAnimationFrame(updatePhysicsFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, speedMultiplier]); // Added hook to rebuild layout rules if speed shifts mid-round

  return (
    <div className="absolute inset-0 w-full h-full bg-transparent overflow-hidden z-20">
      
      {/* Dynamic Injecting Inline CSS Keyframe Layer For Shockwave Celebrations */}
      <style>{`
        @keyframes customPopBurst {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; border-width: 6px; }
        }
        .animate-bubble-burst {
          animation: customPopBurst 0.25s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>

      {bubbles.map((b) => {
        const isNegative = b.type === "scissors" || b.type === "heartbreak";
        const isPositive = b.type === "heart";

        let layeredBrightness = "brightness-100";
        let glossIntensity = "bg-white/60";
        
        if (b.depthLayer === 0) {
          layeredBrightness = "brightness-90 opacity-90";
          glossIntensity = "bg-white/40";
        } else if (b.depthLayer === 2) {
          layeredBrightness = "brightness-105 contrast-105";
          glossIntensity = "bg-white/75";
        }

        let bubbleGlowStyles = {
          borderColor: "rgba(255, 255, 255, 0.8)",
          background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 65%, rgba(230, 242, 255, 0.28) 100%)",
          boxShadow: `
            0 ${b.depthLayer === 2 ? "12px 28px" : "8px 24px"} rgba(224, 33, 113, 0.16), 
            inset 0 4px 12px rgba(255, 255, 255, 0.6), 
            inset -4px -4px 12px rgba(224, 33, 113, 0.08),
            0 0 12px rgba(255, 255, 255, 0.45)
          `
        };

        if (isNegative) {
          bubbleGlowStyles = {
            borderColor: b.depthLayer === 2 ? "rgba(239, 68, 68, 0.95)" : "rgba(239, 68, 68, 0.75)",
            background: "radial-gradient(circle at 30% 30%, rgba(255, 225, 225, 0.35) 0%, rgba(239, 68, 68, 0.05) 75%, rgba(239, 68, 68, 0.22) 100%)",
            boxShadow: `
              0 0 ${b.depthLayer === 2 ? "28px" : "18px"} rgba(239, 68, 68, 0.6), 
              inset 0 4px 10px rgba(255, 255, 255, 0.55), 
              inset -4px -4px 10px rgba(239, 68, 68, 0.25)
            `
          };
        } else if (isPositive) {
          bubbleGlowStyles = {
            borderColor: b.depthLayer === 2 ? "rgba(255, 71, 148, 0.95)" : "rgba(255, 71, 148, 0.75)",
            background: "radial-gradient(circle at 30% 30%, rgba(255, 230, 240, 0.4) 0%, rgba(255, 71, 148, 0.05) 75%, rgba(255, 71, 148, 0.22) 100%)",
            boxShadow: `
              0 0 ${b.depthLayer === 2 ? "28px" : "18px"} rgba(255, 71, 148, 0.6), 
              inset 0 4px 10px rgba(255, 255, 255, 0.55), 
              inset -4px -4px 10px rgba(255, 71, 148, 0.25)
            `
          };
        }

        const dynamicWobble = Math.sin(b.y * b.wobbleFrequency + b.wobblePhase) * b.wobbleIntensity;
        const wobbleX = 1 + dynamicWobble;
        const wobbleY = 1 - dynamicWobble;

        return (
          <div
            key={b.id}
            onClick={() => handleBubbleInteraction(b)}
            className="absolute left-[calc(50%-50px)] bottom-[32px] -translate-x-1/2 flex items-center justify-center will-change-transform pointer-events-auto cursor-pointer select-none"
            style={{
              transform: `translate3d(${b.x}px, -${b.y}px, 0) scale(${b.scale})`,
              opacity: b.opacity,
              zIndex: b.zIndex
            }}
          >
            {/* Volumetric Layer-Styled Bubble Frame */}
            <div 
              className={`w-24 h-24 rounded-full border flex items-center justify-center relative transition-all ${layeredBrightness} ${
                b.isPopped ? "animate-bubble-burst" : isNegative ? "animate-pulse" : ""
              }`}
              style={{
                ...bubbleGlowStyles,
                transform: b.isPopped ? "none" : `scale(${wobbleX}, ${wobbleY})`
              }}
            >
              {/* Glossy Highlights vanish smoothly upon popping event */}
              {!b.isPopped && (
                <>
                  <div className={`absolute top-2 left-3 w-6 h-3 ${glossIntensity} rounded-full rotate-[-28deg] filter blur-[0.2px]`} />
                  <div className="absolute bottom-2 right-4 w-4 h-1.5 bg-white/20 rounded-full rotate-[-28deg] filter blur-[0.5px]" />
                </>
              )}

              {/* Stabilized Centered Core Branding Asset Graphic */}
              <div className={`w-14 h-14 flex items-center justify-center relative bg-transparent transition-all duration-200 ${b.isPopped ? "scale-50 opacity-40 rotate-12 blur-[1px]" : ""}`}>
                <img
                  src={b.imgSrc}
                  alt={b.type}
                  className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_3px_5px_rgba(0,0,0,0.12)]"
                  style={{
                    transform: `rotate(${b.rotation}deg)`
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BubbleEngine;