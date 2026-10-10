import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FrillMenuSidebar from "../components/FrillMenuSidebar";
import { useCart } from "../context/CartContext";
import Footer from "../sections/Footer";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

// 📂 Import flat-file description database profile matrix
import productDescriptions from "../data/products.json";

/**
 * ✨ SHOP COMPONENT ✨
 * Designed for: Scrunchiefrills™ 
 * Features: Pure Data Binding (Zero Procedural Fallbacks), LocalStorage Filter Memory,
 * Introspective Game HUD Sidebar, Dynamic Filter Chips, and Live Search.
 */
const Shop = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  // 🔄 Real-time Firestore Collection State
  const [liveProducts, setLiveProducts] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((doc) => items.push(doc.data()));
          setLiveProducts(items);
        }
      },
      (error) => {
        console.warn("Firestore snapshot error (falling back to static JSON):", error);
      }
    );
    return () => unsub();
  }, []);

  // =========================================================================
  // 🏷️ STATE MANAGEMENT WITH AUTOMATIC LOCAL STORAGE SYNCHRONIZATION
  // =========================================================================
  const [activeFilters, setActiveFilters] = useState(() => {
    const savedFilters = localStorage.getItem("sf_active_filters");
    return savedFilters ? JSON.parse(savedFilters) : { size: null, colour: null, print:null, collection: null, fabric: null };
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("sf_search_query") || "";
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    localStorage.setItem("sf_active_filters", JSON.stringify(activeFilters));
  }, [activeFilters]);

  useEffect(() => {
    localStorage.setItem("sf_search_query", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchQuery]);

  // =========================================================================
  // 📦 1. PURE INVENTORY PASS (Loads ONLY actual listed products from data source)
  // =========================================================================
  const actualProducts = useMemo(() => {
    const sourceData = liveProducts && liveProducts.length > 0
      ? liveProducts
      : Object.values(productDescriptions || {});
    
    return sourceData.map((prod) => {
      const resolvedImage = prod.image || (Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : null) || "/images/ScrunchiefrillsComingSoon1.png";

      return {
        ...prod,
        image: resolvedImage,
        sizeTier: (prod.sizeTier || "Cloud (XXL)").trim()
      };
    });
  }, [liveProducts]);

  // =========================================================================
  // 🔍 2. APPLY MULTI-ATTRIBUTE SELECTION FILTER CRITERIA
  // =========================================================================
  const filteredProducts = useMemo(() => {
    return actualProducts.filter(product => {
      // 1. Live search query check
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = (product.name || "").toLowerCase().includes(query);
        const matchesFabric = (product.fabric || "").toLowerCase().includes(query);
        const matchesCollection = (product.collection || "").toLowerCase().includes(query);
        const matchesTags = (product.tags || []).some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesFabric && !matchesCollection && !matchesTags) return false;
      }

      // 2. Sizing parameter check
      if (activeFilters.size) {
        const prodSize = (product.sizeTier || "").toLowerCase();
        if (activeFilters.size === "cloud" && !prodSize.includes("cloud") && !prodSize.includes("xxl")) {
          return false;
        }
      }

      // 3. Independent Colour Check
      if (activeFilters.colour) {
        const cKey = activeFilters.colour.toLowerCase();
        const tags = (product.tags || []).map(t => t.toLowerCase());
        const prodName = (product.name || "").toLowerCase();
        const prodColor = (product.colour || product.color || "").toLowerCase();
        const matches = prodColor === cKey || tags.includes(cKey) || prodName.includes(cKey);
        if (!matches) return false;
      }

      // 4. Independent Print Check
      if (activeFilters.print) {
        const pKey = activeFilters.print.toLowerCase();
        const tags = (product.tags || []).map(t => t.toLowerCase());
        const prodName = (product.name || "").toLowerCase();
        const prodPrint = (product.print || product.pattern || "").toLowerCase();
        const matches = prodPrint === pKey || tags.includes(pKey) || prodName.includes(pKey);
        if (!matches) return false;
      }

      // 5. Collection parameter check (Loot Case Bundles)
      if (activeFilters.collection) {
        const prodColl = (product.collection || "").toLowerCase();
        if (prodColl !== activeFilters.collection.toLowerCase()) {
          return false;
        }
      }

      // 6. Fabric parameter check
      if (activeFilters.fabric && (product.fabric || "").toLowerCase() !== activeFilters.fabric.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [actualProducts, activeFilters, searchQuery]);

  // =========================================================================
  // 🧮 3. COMPUTE PAGINATION GRID METRICS
  // =========================================================================
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const productsToDisplay = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handleFilterToggle = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === value ? null : value
    }));
  };

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== null);

  return (
    <div 
      className="min-h-screen w-full bg-fixed bg-cover bg-center text-black overflow-x-hidden"
      style={{ backgroundImage: "url('/images/SFBestsellers.png')" }}
    >

      <div className="pt-24 sm:pt-28 pb-10 px-3 sm:px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-5 md:gap-6 items-start">
        
        {/* 📑 SIDEBAR HUD MODULE PANEL (Driven 100% by live inventory) */}
        <FrillMenuSidebar 
          allProducts={actualProducts}
          activeFilters={activeFilters}
          onFilterChange={handleFilterToggle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* 🛍️ MAIN PRODUCT GALLERY VIEWPORT */}
        <main className="flex-grow w-full">
          
          {/* Header Info Status Summary Console */}
          <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-t-3xl border-b border-pink-100 flex flex-col gap-3 sm:gap-4 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h2 className="text-gray-600 font-medium italic tracking-wide text-xs md:text-sm">
                {totalItems > 0 ? (
                  <>Showing <span className="font-bold text-[#E02171]">{startIndex + 1} - {endIndex}</span> of {totalItems} Collectible Frills Available</>
                ) : (
                  <span className="text-rose-500 font-bold uppercase tracking-widest">🚨 No matching items!</span>
                )}
              </h2>
              {(hasActiveFilters || searchQuery !== "") && (
                <button 
                  onClick={() => {
                    setActiveFilters({ size: null, colour: null, print: null, collection: null, fabric: null });
                    setSearchQuery("");
                    localStorage.removeItem("sf_active_filters");
                    localStorage.removeItem("sf_search_query");
                  }}
                  className="text-[9px] sm:text-[10px] font-black tracking-widest bg-rose-500 text-white px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 uppercase transition-all self-start sm:self-auto cursor-pointer"
                >
                  Clear All Filters 🔄
                </button>
              )}
            </div>

            {/* 🏷️ DYNAMIC ACTIVE CHIPS DISPLAY STRIP AREA */}
            <AnimatePresence>
              {(hasActiveFilters || searchQuery) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {searchQuery && (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      exit={{ scale: 0.8 }} 
                      className="inline-flex items-center gap-1.5 bg-gray-900 text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md border border-black shadow-sm"
                    >
                      SEARCH: "{searchQuery}" 
                      <button onClick={() => setSearchQuery("")} className="hover:text-pink-400 font-bold ml-1">×</button>
                    </motion.span>
                  )}
                  
                  {Object.keys(activeFilters).map((filterKey) => {
                    const activeVal = activeFilters[filterKey];
                    if (!activeVal) return null;
                    
                    return (
                      <motion.span 
                        key={filterKey}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-1.5 bg-white border-2 border-black text-black text-[9px] font-black px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#000] uppercase"
                      >
                        {filterKey}: {activeVal}
                        <button 
                          onClick={() => handleFilterToggle(filterKey, activeVal)}
                          className="text-[#E02171] font-black hover:text-black transition-colors ml-1"
                        >
                          ×
                        </button>
                      </motion.span>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic Render Product Grid Layout Viewport */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 items-start content-start gap-3 sm:gap-5 p-3 sm:p-5 bg-white/40 backdrop-blur-sm shadow-2xl rounded-b-2xl sm:rounded-b-3xl border border-white/20 min-h-[500px]">
            {productsToDisplay.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {productsToDisplay.map((product) => {
                  const cartItem = cart?.find((item) => item.id === product.id);
                  const quantity = cartItem ? cartItem.quantity : 0;

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      whileHover={{ y: -6, scale: 1.01 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="h-fit w-full bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-sm flex flex-col items-center group relative overflow-hidden text-black"
                    >
                      {/* Image Router Target Trigger with Out-of-Stock Corner Badge */}
                      <div 
                        onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                        className="w-full aspect-square bg-gray-50 rounded-lg sm:rounded-xl mb-3 overflow-hidden border border-gray-100 relative cursor-pointer"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                            product.stockCount === 0 ? "grayscale opacity-75" : ""
                          }`} 
                        />

                        {/* 🏷️ Automatic Out of Stock Corner Badge Overlay */}
                        {product.stockCount === 0 && (
                          <div className="absolute top-2 right-2 z-10 bg-black/85 backdrop-blur-sm text-white border border-white/20 px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black tracking-widest uppercase shadow-md flex items-center gap-1 select-none pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Metadata Specs Matrix Block */}
                      <div className="w-full text-left mb-2.5 space-y-0.5">
                        <div className="text-[8px] sm:text-[9px] text-black tracking-tight line-clamp-1">
                          <span className="font-black uppercase">SIZE & FABRIC: </span>
                          <span className="inline-block uppercase">{product.sizeTier || "CLOUD (XXL)"}</span> • <span className="inline-block">{product.fabric}</span>
                        </div>
                        
                        <h3 className="text-[10px] sm:text-[11px] md:text-xs text-black uppercase leading-tight tracking-tight line-clamp-2 min-h-[28px] sm:min-h-[32px]">
                          <span className="font-black uppercase">PRODUCT: </span>
                          <span className="inline-block font-medium">{product.name}</span>
                        </h3>

                        {product.stockCount > 0 && product.stockCount <= 3 ? (
                          <div className="bg-rose-50 text-rose-600 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded border border-rose-200 inline-flex items-center gap-0.5 animate-pulse uppercase tracking-tight select-none">
                            🔥 Only {product.stockCount} Left!
                          </div>
                        ) : product.stockCount === 0 ? (
                          <div className="bg-gray-100 text-gray-400 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded inline-flex items-center uppercase tracking-tight select-none">
                            🚫 Out Of Stock
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between w-full pt-2 border-t border-gray-50 gap-2 sm:gap-0">
                        <span className="text-black text-[10px] sm:text-xs flex flex-wrap items-center gap-1">
                          <span className="font-black uppercase">PRICE: </span>
                          <span className="text-[#E02171] font-extrabold text-xs sm:text-sm">₹{product.price}</span>
                          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 line-through">
                              ₹{product.compareAtPrice}
                            </span>
                          )}
                        </span>
                        
                        {/* Blinkit-Style Dynamic Core Context Counter Interface */}
                        <div className="w-full sm:w-24 h-7 sm:h-8 relative z-30">
                          {product.stockCount === 0 ? (
                            <button 
                              type="button" 
                              disabled 
                              className="w-full h-full bg-gray-100 text-gray-400 font-black text-[9px] sm:text-[10px] rounded-lg cursor-not-allowed uppercase select-none"
                            >
                              Sold Out
                            </button>
                          ) : quantity === 0 ? (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault(); 
                                addToCart(product);
                              }}
                              className="w-full h-full bg-white text-[#E02171] text-[9px] sm:text-[10px] font-black border-2 border-gray-900 px-2 rounded-lg hover:bg-gray-900 hover:text-white transition-colors duration-200 shadow-sm uppercase cursor-pointer select-none active:scale-95"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="w-full h-full bg-[#E02171] text-white rounded-lg flex items-center justify-between px-1.5 shadow-md border border-pink-700 font-black select-none">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault(); 
                                  if (quantity === 1) {
                                    removeFromCart(product.id);
                                  } else {
                                    updateQuantity(product.id, -1);
                                  }
                                }}
                                className="w-6 h-6 rounded hover:bg-white/20 active:scale-90 text-sm flex items-center justify-center cursor-pointer transition-transform"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="text-[10px] font-black tracking-tight">{quantity}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const maxAvailable = product.stockCount ?? product.stock ?? 99;
                                  if (quantity < maxAvailable) {
                                    updateQuantity(product.id, 1);
                                  }
                                }}
                                disabled={quantity >= (product.stockCount ?? product.stock ?? 99)}
                                className="w-6 h-6 rounded hover:bg-white/20 active:scale-90 text-sm flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-transform"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                <p className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-widest">
                  No active products found in this vault section.
                </p>
              </div>
            )}
          </div>

          {/* 🔢 PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6 sm:mt-8 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-full shadow-lg border border-pink-100 max-w-fit mx-auto">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black border-2 border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 hover:text-white transition cursor-pointer"
              >
                PREV
              </button>
              <div className="flex gap-1.5 sm:gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                      currentPage === i + 1 ? "bg-pink-500 text-white shadow-md" : "bg-pink-50 text-pink-500 hover:bg-pink-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black border-2 border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 hover:text-white transition cursor-pointer"
              >
                NEXT
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;