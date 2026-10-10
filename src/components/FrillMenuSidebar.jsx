import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ✨ THE FRILL MENU SIDEBAR COMPONENT ✨
 * Designed for: Scrunchiefrills™ Shop (Cozy Nintendo/Sanrio Custom Game Style HUD)
 * Functionality: 100% Dynamic attribute extraction with nested sub-accordions & mobile drawer support.
 * Enforces: Complete block uppercase display matching reference sketches.
 */
const FrillMenuSidebar = ({ 
  allProducts = [], 
  activeFilters = {}, 
  onFilterChange, 
  searchQuery = "", 
  onSearchChange 
}) => {
  // 📱 Mobile Collapsible Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 🎛️ State management tracking main accordion and nested aura sub-accordion layout expansions
  const [expandedSection, setExpandedSection] = useState("size");
  const [openAuraSubSections, setOpenAuraSubSections] = useState({ colours: true, prints: true });

  // 🔄 State variables to trigger randomized micro wiggles on local image tags
  const [tapeWiggle, setTapeWiggle] = useState(false);
  const [chestBounce, setChestBounce] = useState(false);

  // ⏱️ Run background layout interval engines to drive idle custom game wiggles
  useEffect(() => {
    const tapeInterval = setInterval(() => {
      setTapeWiggle(true);
      setTimeout(() => setTapeWiggle(false), 600);
    }, 8000);

    const chestInterval = setInterval(() => {
      setChestBounce(true);
      setTimeout(() => setChestBounce(false), 500);
    }, 10000);

    return () => {
      clearInterval(tapeInterval);
      clearInterval(chestInterval);
    };
  }, []);

  // =========================================================================
  // 🧮 1. DYNAMIC DATA INTROSPECTION & LIVE INVENTORY CALCULATION
  // =========================================================================
  const menuData = useMemo(() => {
    const sizeMap = {};
    const auraColoursMap = {};
    const auraPrintsMap = {};
    const collectionMap = {};
    const fabricMap = {};

    // Standard baseline dictionaries tailored to Scrunchiefrills catalog
    const KNOWN_COLORS = [
      // Signature brand tones
      "hot pink", "pink", "blush", "rose", "peachy", "peach", "coral", "red", "maroon",
      // Warm & vibrant tones
      "orange", "yellow", "champagne", "gold", "neon",
      // Earthy & neutral tones
      "brown", "beige", "cream", "white", "black", "grey", "gray",
      // Cool & pastel tones
      "sky blue", "blue", "navy", "green", "mint", "purple", "lavender", "violet"
    ];

    const KNOWN_PRINTS = [
      // Iconic motifs & character themes
      "liquid hearts", "hearts", "ladybug", "bugs", "petal crush", "petals", "floral", "flowers",
      "fruit print", "fruits", "fruity", "watermelon", "melon", "bananas", "banana",
      // Graphics, doodles & comics
      "smiley faces", "smiley", "emojis", "comic pop", "comic", "doodles", "ufo", "cosmic",
      // Patterns & textures
      "camouflage", "camo", "checkered", "stripes", "polka dot", "printed", "abstract"
    ];

    allProducts.forEach((product) => {
      if (!product) return;

      // 📏 Size Introspection
      const rawSize = (product.sizeTier || product.size || "").toLowerCase();
      if (rawSize.includes("cloud") || rawSize.includes("xxl")) {
        sizeMap["cloud"] = (sizeMap["cloud"] || 0) + 1;
      } else if (rawSize.includes("classic")) {
        sizeMap["classic"] = (sizeMap["classic"] || 0) + 1;
      } else if (rawSize.includes("skinny")) {
        sizeMap["skinny"] = (sizeMap["skinny"] || 0) + 1;
      }

      const tags = (product.tags || []).map((t) => t.trim().toLowerCase());
      const prodName = (product.name || "").toLowerCase();

      // ✨ 1. Dynamic Colours Introspection
      if (product.colour || product.color) {
        const c = (product.colour || product.color).trim().toLowerCase();
        auraColoursMap[c] = (auraColoursMap[c] || 0) + 1;
      }

      KNOWN_COLORS.forEach((color) => {
        if ((product.colour || product.color || "").trim().toLowerCase() === color) return;

        const tagMatch = tags.some((t) => t === color || t === `${color} color` || t === `${color} colour`);
        const nameMatch = new RegExp(`\\b${color}\\b`, "i").test(prodName);
        if (tagMatch || nameMatch) {
          auraColoursMap[color] = (auraColoursMap[color] || 0) + 1;
        }
      });

      // 🌸 2. Dynamic Prints Introspection
      if (product.print || product.pattern) {
        const p = (product.print || product.pattern).trim().toLowerCase();
        auraPrintsMap[p] = (auraPrintsMap[p] || 0) + 1;
      }

      KNOWN_PRINTS.forEach((print) => {
        if ((product.print || product.pattern || "").trim().toLowerCase() === print) return;

        const tagMatch = tags.includes(print);
        const nameMatch = new RegExp(`\\b${print}\\b`, "i").test(prodName);
        if (tagMatch || nameMatch) {
          auraPrintsMap[print] = (auraPrintsMap[print] || 0) + 1;
        }
      });

      tags.forEach((tag) => {
        if ((tag.endsWith("print") || tag.endsWith("pattern")) && !KNOWN_PRINTS.includes(tag)) {
          auraPrintsMap[tag] = (auraPrintsMap[tag] || 0) + 1;
        }
      });

      // 📦 Collections Introspection (Loot Case Bundles)
      const rawCollection = product.collection;
      if (rawCollection && rawCollection.trim() !== "") {
        const collName = rawCollection.trim().toLowerCase();
        collectionMap[collName] = (collectionMap[collName] || 0) + 1;
      }

      // 🧵 Fabric Introspection
      const rawFabric = product.fabric;
      if (rawFabric && rawFabric.trim() !== "") {
        const fabricStr = rawFabric.trim().toLowerCase();
        fabricMap[fabricStr] = (fabricMap[fabricStr] || 0) + 1;
      }
    });

    // 📋 Restricted display sequence focused on active Cloud (XXL)
    const sizeOrderOrder = ["cloud"];
    const organizedOrderedSizes = [];

    sizeOrderOrder.forEach((label) => {
      const activeCount = sizeMap[label] || sizeMap["cloud (xxl)"] || 0;
      if (activeCount > 0) {
        organizedOrderedSizes.push({ 
          label: "cloud", 
          displayName: "Cloud (XXL)", 
          count: activeCount 
        });
      }
    });

    return {
      sizes: organizedOrderedSizes,
      auraColours: Object.keys(auraColoursMap).map((k) => ({ label: k, count: auraColoursMap[k] })),
      auraPrints: Object.keys(auraPrintsMap).map((k) => ({ label: k, count: auraPrintsMap[k] })),
      collections: Object.keys(collectionMap).map((k) => ({ label: k, count: collectionMap[k] })),
      fabrics: Object.keys(fabricMap).map((k) => ({ label: k, count: fabricMap[k] }))
    };
  }, [allProducts]);

  const toggleSection = (sectionKey) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
  };

  const toggleAuraSubSection = (subKey) => {
    setOpenAuraSubSections((prev) => ({ ...prev, [subKey]: !prev[subKey] }));
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length + (searchQuery ? 1 : 0);

  return (
    <aside className="w-full md:w-[340px] flex-shrink-0 select-none static md:sticky top-28 h-fit pb-4 md:pb-6 z-40">
      
      {/* 📱 MOBILE COLLAPSIBLE TOGGLE BUTTON */}
      <div className="md:hidden w-full mb-3">
        <button
          onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
          className="w-full bg-gradient-to-r from-pink-500 to-[#E02171] text-white border-4 border-black px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#000] flex items-center justify-between active:translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span>🎛️ The Frill Menu Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded-full font-black">
                {activeFilterCount} Active
              </span>
            )}
          </div>
          <span className="text-sm font-black">{isMobileDrawerOpen ? "▲ HIDE" : "▼ OPEN"}</span>
        </button>
      </div>

      {/* 🎪 MASTER CARTOON HUB PARENT CONTAINER */}
      <div 
        className={`${
          isMobileDrawerOpen ? "flex" : "hidden md:flex"
        } border-4 border-black bg-gradient-to-b from-[#fff2f8] to-[#ffe5f0] p-4 md:p-5 rounded-2xl md:rounded-[32px] shadow-[4px_4px_0px_#000] md:shadow-[6px_6px_0px_#000] relative overflow-hidden flex-col gap-4 transition-all duration-300`}
      >
        
        {/* 🌟 SLOW FLOATING BACKDROP HIGHLIGHT SHIMMERS */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none animate-pulse duration-10000" />

        {/* 🎀 GAME HUD CONTAINER HEADER (IMAGE ASSET) */}
        <div className="text-center relative py-1 border-b-4 border-dashed border-black/10 flex justify-center items-center">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full max-w-[280px] flex justify-center items-center py-1"
          >
            <img 
              src="/images/FrillMenuHeading.png" 
              alt="The Frill Menu - Find Your Next Obsession" 
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[2px_2px_0px_#fff]"
            />
          </motion.div>
        </div>

        {/* 🔍 LIVE INPUT SEARCH CONSOLE */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔍 SEARCH SCRUNCHIES..."
            className="w-full border-4 border-black bg-white px-3.5 md:px-4 py-2.5 md:py-3 rounded-2xl font-black text-[11px] md:text-xs uppercase tracking-wider text-black placeholder-gray-400 shadow-[3px_3px_0px_#000] focus:outline-none focus:bg-pink-50 transition-colors"
          />
        </div>

        {/* =========================================================================
            📏 CARD 1: COMMAND YOUR SIZE (SIZE PROPERTIES FILTER)
            ========================================================================= */}
        {menuData.sizes.length > 0 && (
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="border-4 border-black bg-white rounded-2xl overflow-hidden shadow-[3px_3px_0px_#000] md:shadow-[4px_4px_0px_#000] flex flex-col text-left"
          >
            <button 
              onClick={() => toggleSection("size")}
              className="w-full p-3 md:p-4 flex items-center justify-between bg-gradient-to-r from-pink-100 to-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 md:gap-3">
                <motion.img 
                  src="/images/command_your_size.png" 
                  alt="" 
                  animate={tapeWiggle ? { rotate: [0, -15, 15, -10, 10, 0] } : { scale: [1, 1.05, 1] }}
                  transition={tapeWiggle ? { duration: 0.6 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
                <div>
                  <h3 className="text-[11px] md:text-xs font-black tracking-wider text-black uppercase">Command Your Size</h3>
                  <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-wider">main character energy</p>
                </div>
              </div>
              <span className="text-sm md:text-lg font-black text-gray-400">{expandedSection === "size" ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "size" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-white px-3 pb-3 border-t-2 border-black"
                >
                  <div className="flex flex-col gap-1.5 pt-3">
                    {menuData.sizes.map((size) => {
                      const isSelected = activeFilters.size === size.label;
                      return (
                        <button
                          key={size.label}
                          onClick={() => onFilterChange("size", size.label)}
                          className={`w-full px-3 py-2 text-xs font-black rounded-xl uppercase tracking-widest transition-all text-left flex justify-between items-center border-2 cursor-pointer ${
                            isSelected 
                              ? "bg-gray-900 text-white border-black shadow-[2px_2px_0px_#E02171] scale-[1.01]" 
                              : "bg-gray-50 text-gray-700 hover:bg-pink-50 border-gray-200"
                          }`}
                        >
                          <span className="truncate">{size.displayName || size.label} ({size.count})</span>
                          {isSelected && <span className="text-pink-400 text-xs animate-bounce">✨</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =========================================================================
            ✨ CARD 2: CHOOSE YOUR AURA (NESTED ACCORDIONS FOR COLOURS & PRINTS)
            ========================================================================= */}
        {(menuData.auraColours.length > 0 || menuData.auraPrints.length > 0) && (
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="border-4 border-black bg-white rounded-2xl overflow-hidden shadow-[3px_3px_0px_#000] md:shadow-[4px_4px_0px_#000] flex flex-col text-left"
          >
            <button 
              onClick={() => toggleSection("aura")}
              className="w-full p-3 md:p-4 flex items-center justify-between bg-gradient-to-r from-purple-100 to-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 md:gap-3">
                <motion.img 
                  src="/images/choose_your_aura.png" 
                  alt=""
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  whileHover={{ scale: 1.2 }}
                  className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
                <div>
                  <h3 className="text-[11px] md:text-xs font-black tracking-wider text-black uppercase">Choose Your Aura</h3>
                  <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-wider">your signature manifesto</p>
                </div>
              </div>
              <span className="text-sm md:text-lg font-black text-gray-400">{expandedSection === "aura" ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "aura" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-white px-3 pb-3 border-t-2 border-black space-y-3 pt-3"
                >
                  {/* 🎨 NESTED ACCORDION 1: COLOURS */}
                  {menuData.auraColours.length > 0 && (
                    <div className="border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_#000]">
                      <button
                        onClick={() => toggleAuraSubSection("colours")}
                        className="w-full px-3 py-2 bg-pink-50 flex items-center justify-between text-left transition-colors hover:bg-pink-100 cursor-pointer"
                      >
                        <span className="text-[10px] md:text-[11px] font-black text-[#f02d8d] uppercase tracking-wider flex items-center gap-1.5">
                          <span>🎨</span> Colours ({menuData.auraColours.length})
                        </span>
                        <span className="text-xs font-black text-[#f02d8d]">
                          {openAuraSubSections.colours ? "▲" : "▼"}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {openAuraSubSections.colours && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-white p-2 border-t-2 border-black"
                          >
                            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                              {menuData.auraColours.map((col) => {
                                const isSelected = activeFilters.colour === col.label;
                                return (
                                  <button
                                    key={col.label}
                                    onClick={() => onFilterChange("colour", col.label)}
                                    className={`w-full px-2.5 py-1.5 text-[9px] md:text-[10px] font-black rounded-lg uppercase tracking-wider transition-all text-left flex justify-between items-center border cursor-pointer ${
                                      isSelected 
                                        ? "bg-[#f02d8d] text-white border-black shadow-[1.5px_1.5px_0px_#000]" 
                                        : "bg-gray-50 text-gray-700 hover:bg-pink-50 border-gray-200"
                                    }`}
                                  >
                                    <span className="truncate">{col.label} ({col.count})</span>
                                    {isSelected && <span className="text-white text-xs">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 🌸 NESTED ACCORDION 2: PRINTS */}
                  {menuData.auraPrints.length > 0 && (
                    <div className="border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_#000]">
                      <button
                        onClick={() => toggleAuraSubSection("prints")}
                        className="w-full px-3 py-2 bg-purple-50 flex items-center justify-between text-left transition-colors hover:bg-purple-100 cursor-pointer"
                      >
                        <span className="text-[10px] md:text-[11px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🌸</span> Prints ({menuData.auraPrints.length})
                        </span>
                        <span className="text-xs font-black text-purple-600">
                          {openAuraSubSections.prints ? "▲" : "▼"}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {openAuraSubSections.prints && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-white p-2 border-t-2 border-black"
                          >
                            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                              {menuData.auraPrints.map((pr) => {
                                const isSelected = activeFilters.print === pr.label;
                                return (
                                  <button
                                    key={pr.label}
                                    onClick={() => onFilterChange("print", pr.label)}
                                    className={`w-full px-2.5 py-1.5 text-[9px] md:text-[10px] font-black rounded-lg uppercase tracking-wider transition-all text-left flex justify-between items-center border cursor-pointer ${
                                      isSelected 
                                        ? "bg-[#f02d8d] text-white border-black shadow-[1.5px_1.5px_0px_#000]" 
                                        : "bg-gray-50 text-gray-700 hover:bg-purple-50 border-gray-200"
                                    }`}
                                  >
                                    <span className="truncate">{pr.label} ({pr.count})</span>
                                    {isSelected && <span className="text-white text-xs">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =========================================================================
            🎁 CARD 3: LOOT CASE BUNDLES (COLLECTIONS FILTER)
            ========================================================================= */}
        {menuData.collections.length > 0 && (
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="border-4 border-black bg-white rounded-2xl overflow-hidden shadow-[3px_3px_0px_#000] md:shadow-[4px_4px_0px_#000] flex flex-col text-left"
          >
            <button 
              onClick={() => toggleSection("collection")}
              className="w-full p-3 md:p-4 flex items-center justify-between bg-gradient-to-r from-amber-100 to-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 md:gap-3">
                <motion.img 
                  src="/images/loot_box_bundles.png" 
                  alt="" 
                  animate={chestBounce ? { y: [0, -10, 0, -4, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
                <div>
                  <h3 className="text-[11px] md:text-xs font-black tracking-wider text-black uppercase">Loot Case Bundles</h3>
                  <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-wider">the signature vault</p>
                </div>
              </div>
              <span className="text-sm md:text-lg font-black text-gray-400">{expandedSection === "collection" ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "collection" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-white px-3 pb-3 border-t-2 border-black"
                >
                  <div className="flex flex-col gap-1.5 pt-3">
                    {menuData.collections.map((coll) => {
                      const isSelected = activeFilters.collection === coll.label;
                      return (
                        <button
                          key={coll.label}
                          onClick={() => onFilterChange("collection", coll.label)}
                          className={`w-full px-3 py-2 text-xs font-black rounded-xl uppercase tracking-widest transition-all text-left flex justify-between items-center border-2 cursor-pointer ${
                            isSelected 
                              ? "bg-amber-500 text-white border-black shadow-[2px_2px_0px_#000]" 
                              : "bg-gray-50 text-gray-700 hover:bg-amber-50 border-gray-100"
                          }`}
                        >
                          <span className="truncate">{coll.label} ({coll.count})</span>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =========================================================================
            🧵 CARD 4: PICK A FABRIC (TEXTILE SELECTION FILTER)
            ========================================================================= */}
        {menuData.fabrics.length > 0 && (
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="border-4 border-black bg-white rounded-2xl overflow-hidden shadow-[3px_3px_0px_#000] md:shadow-[4px_4px_0px_#000] flex flex-col text-left"
          >
            <button 
              onClick={() => toggleSection("fabric")}
              className="w-full p-3 md:p-4 flex items-center justify-between bg-gradient-to-r from-emerald-100 to-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 md:gap-3">
                <motion.img 
                  src="/images/pick_a_fabric.png" 
                  alt="" 
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
                <div>
                  <h3 className="text-[11px] md:text-xs font-black tracking-wider text-black uppercase">Pick a Fabric</h3>
                  <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-wider">design your own drip</p>
                </div>
              </div>
              <span className="text-sm md:text-lg font-black text-gray-400">{expandedSection === "fabric" ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "fabric" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-white px-3 pb-3 border-t-2 border-black"
                >
                  <div className="flex flex-col gap-1.5 pt-3">
                    {menuData.fabrics.map((fabric) => {
                      const isSelected = activeFilters.fabric === fabric.label;
                      return (
                        <button
                          key={fabric.label}
                          onClick={() => onFilterChange("fabric", fabric.label)}
                          className={`w-full px-3 py-2 text-xs font-black rounded-xl uppercase tracking-widest transition-all text-left flex justify-between items-center border-2 cursor-pointer ${
                            isSelected 
                              ? "bg-gray-900 text-white border-black shadow-[2px_2px_0px_#4ade80]" 
                              : "bg-gray-50 text-gray-700 hover:bg-pink-50 border-gray-100"
                          }`}
                        >
                          <span className="truncate">{fabric.label} ({fabric.count})</span>
                          {isSelected && <span className="text-pink-400 text-xs">✨</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </aside>
  );
};

export default FrillMenuSidebar;