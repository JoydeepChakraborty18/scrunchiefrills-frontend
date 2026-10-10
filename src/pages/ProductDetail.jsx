import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../sections/Footer";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

// 📂 Fallback local description matrix
import staticProductDescriptions from "../data/products.json";

// 📏 SCRUNCHIEFRILLS MASTER SIZE TEXT DICTIONARY LOOKUP MATRIX (3 Size Tiers: S, M, XXL)
const SIZE_DETAILS_MAP = {
  // s: { name: "Skinny", code: "S", tagline: "Cute. Compact. Charming." }, // ❌ Commented out for initial launch batch
  // m: { name: "Classic", code: "M", tagline: "Your everyday favourite." }, // ❌ Commented out for initial launch batch
  xxl: { name: "Cloud", code: "XXL", tagline: "Big hair energy." },
  cloud: { name: "Cloud", code: "XXL", tagline: "Big hair energy." }
};

const ProductDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  // 🔄 Real-time Firestore Document State (Supports Direct URL Refresh)
  const [liveProductDoc, setLiveProductDoc] = useState(null);

  const targetProductId = id || location.state?.product?.id || location.state?.product?.sku;

  useEffect(() => {
    if (!targetProductId) return;

    const docRef = doc(db, "products", targetProductId);
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setLiveProductDoc(docSnap.data());
        }
      },
      (err) => {
        console.warn("Firestore ProductDetail listener notice:", err);
      }
    );

    return () => unsub();
  }, [targetProductId]);

  // 🧮 Resolve final product data priority: Live Firestore > Router State > Local Static JSON
  const product = useMemo(() => {
    if (liveProductDoc) return liveProductDoc;
    if (location.state?.product) return location.state.product;
    if (targetProductId && staticProductDescriptions[targetProductId]) {
      return staticProductDescriptions[targetProductId];
    }
    return null;
  }, [liveProductDoc, location.state, targetProductId]);

  // 📸 Multi-Image Gallery Resolution (Amazon / Blinkit Style)
  const galleryImages = useMemo(() => {
    if (!product) return ["/images/ScrunchiefrillsComingSoon1.png"];
    
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image];
    }
    return ["/images/ScrunchiefrillsComingSoon1.png"];
  }, [product]);

  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  // Sync active image when product gallery loads or changes
  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages]);

  // 🛡️ Safety fallback route checks
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF5F7] text-black px-4 text-center">
        <p className="font-black uppercase tracking-widest text-xs sm:text-sm mb-4 text-gray-500">
          Product record loading or unavailable in current vault.
        </p>
        <button 
          onClick={() => navigate("/shop")} 
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black uppercase text-xs hover:bg-[#E02171] transition"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const cartItem = cart?.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const maxAvailable = product.stockCount ?? product.stock ?? 99;

  // 🧮 RESOLVE DYNAMIC SIZE RE-MAPPING STRATEGY
  const productSizeKey = (product.sizeTier || product.size || "cloud").trim().toLowerCase();
  
  const resolvedSize = SIZE_DETAILS_MAP[productSizeKey] || 
    Object.values(SIZE_DETAILS_MAP).find(v => v.name.toLowerCase() === productSizeKey) ||
    SIZE_DETAILS_MAP.cloud ||
    { name: "Cloud", code: "XXL", tagline: "Big hair energy." };

  return (
    <div className="min-h-screen w-full bg-[#FFF5F7] flex flex-col text-black overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full">
        {/* Navigation Breadcrumb backlink track */}
        <button 
          onClick={() => navigate("/shop")} 
          className="text-[#E02171] font-bold text-xs sm:text-sm mb-5 sm:mb-6 flex items-center gap-1.5 hover:underline uppercase cursor-pointer"
        >
          ← Back to Catalogues
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start bg-white p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl border border-pink-100">
          
          {/* 🖼️ Left Side Layout: E-Commerce Multi-Angle Image Gallery */}
          <div className="flex flex-col gap-3.5 sm:gap-4 w-full">
            {/* Main Featured Photo Viewport with Out-of-Stock Corner Badge */}
            <div className="w-full aspect-square max-w-sm sm:max-w-md md:max-w-full mx-auto bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
              <img 
                src={activeImage} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  product.stockCount === 0 ? "grayscale opacity-75" : ""
                }`} 
              />

              {/* 🏷️ Automatic Out of Stock Corner Badge Overlay */}
              {product.stockCount === 0 && (
                <div className="absolute top-3 right-3 z-10 bg-black/85 backdrop-blur-sm text-white border border-white/20 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg flex items-center gap-1.5 select-none pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Out of Stock
                </div>
              )}
            </div>

            {/* Clickable Multi-Angle Thumbnail Strip (Blinkit / Amazon Style) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pink-200">
                {galleryImages.map((imgUrl, index) => {
                  const isSelected = activeImage === imgUrl;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? "border-[#E02171] shadow-md scale-105 ring-2 ring-pink-200" 
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${product.name} angle ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 📋 Right Side Layout: Detailed Description Specifications Sheet */}
          <div className="flex flex-col text-left space-y-3.5 sm:space-y-4 w-full">
            
            {/* Attributes stay explicitly BOLD, BLACK, & CAPITALIZED */}
            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-black">
              <div>
                <span className="font-black text-black uppercase">PRODUCT NAME: </span>
                <span className="text-black normal-case font-medium text-base sm:text-lg">{product.name}</span>
              </div>

              <div>
                <span className="font-black text-black uppercase">COLLECTION: </span>
                <span className="text-black normal-case">{product.collection}</span>
              </div>

              <div>
                <span className="font-black text-black uppercase">SKU: </span>
                <span className="text-black font-mono font-bold uppercase tracking-wider">{product.sku}</span>
              </div>

              <div>
                <span className="font-black text-black uppercase">FABRIC: </span>
                <span className="text-black normal-case">{product.fabric}</span>
              </div>

              <div>
                <span className="font-black text-black uppercase">SIZE TIER: </span>
                <span className="text-black normal-case font-semibold">
                  {resolvedSize.name} ({resolvedSize.code}) — {resolvedSize.tagline}
                </span>
              </div>

              {product.diameter && (
                <div>
                  <span className="font-black text-black uppercase">MEASUREMENTS (DIAMETER): </span>
                  <span className="text-black normal-case">{product.diameter}</span>
                </div>
              )}

              {product.elasticStretch && (
                <div>
                  <span className="font-black text-black uppercase">ELASTIC STRETCH CAPACITY: </span>
                  <span className="text-black normal-case">{product.elasticStretch}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3">
                <span className="font-black text-black uppercase block mb-1">PRODUCT DESCRIPTION (THE VIBE): </span>
                <p className="text-black normal-case leading-relaxed font-medium bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-100 text-xs sm:text-sm">
                  {product.description}
                </p>
              </div>

              <div>
                <span className="font-black text-black uppercase block mb-1">WASHCARE INSTRUCTIONS: </span>
                <p className="text-black normal-case leading-relaxed bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-100 whitespace-pre-line text-xs sm:text-sm">
                  {product.washcare}
                </p>
              </div>
            </div>

            {/* Flat Rate Pricing Matrix (Supports Launch Discount & Seamless Reversion) */}
            <div className="flex items-baseline gap-2.5 sm:gap-3 pt-3.5 sm:pt-4 border-t border-gray-100">
              <span className="font-black text-black uppercase text-xs sm:text-sm">PRICE:</span>
              <span className="text-xl sm:text-2xl font-black text-[#E02171]">₹{product.price}</span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                <span className="text-xs sm:text-sm font-bold text-gray-400 line-through">MRP ₹{product.compareAtPrice}</span>
              )}
            </div>

            {/* Dynamic Scarcity Alert Counter Countdown */}
            {product.stockCount > 0 && product.stockCount <= 3 && (
              <div className="bg-rose-50 text-rose-600 text-[10px] sm:text-xs font-black p-2.5 sm:p-3 rounded-xl border border-rose-200 inline-flex items-center gap-1 max-w-fit animate-pulse uppercase select-none">
                🚨 Only {product.stockCount} items left in stock!
              </div>
            )}

            {/* Dedicated Action Trigger Controller Panel */}
            <div className="w-full sm:w-48 h-11 pt-2">
              {product.stockCount === 0 ? (
                <button 
                  type="button" 
                  disabled 
                  className="w-full h-full bg-gray-100 text-gray-400 font-black rounded-xl cursor-not-allowed uppercase select-none"
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
                  className="w-full h-full bg-[#E02171] hover:bg-pink-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer select-none"
                >
                  Add To Cart
                </button>
              ) : (
                <div className="w-full h-full bg-[#E02171] text-white font-black rounded-xl flex items-center justify-between px-3 shadow-md border border-pink-700 select-none">
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
                    className="text-xl font-black hover:bg-white/20 active:scale-90 w-8 h-8 rounded-lg flex items-center justify-center select-none cursor-pointer transition-transform"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-xs sm:text-sm font-black select-none">{quantity}</span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (quantity < maxAvailable) {
                        updateQuantity(product.id, 1);
                      }
                    }} 
                    disabled={quantity >= maxAvailable}
                    className="text-xl font-black hover:bg-white/20 active:scale-90 w-8 h-8 rounded-lg flex items-center justify-center select-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-transform"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;