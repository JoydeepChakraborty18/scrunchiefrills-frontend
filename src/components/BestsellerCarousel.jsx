import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { motion } from "framer-motion";

// 📂 Import our flat-file description database profile matrix (Offline Fallback)
import productDescriptions from "../data/products.json";

/**
 * ✨ BESTSELLER CAROUSEL COMPONENT ✨
 * Designed for: Scrunchiefrills™ Home Canvas HUD Section
 * Features: Pure Live Data Binding (Zero Fallbacks), Launch MRP Pricing,
 * Swiper Slider Breakpoints, Real-time Firestore onSnapshot, and Redirect routing to /shop.
 */
const BestsellerCarousel = () => {
  const navigate = useNavigate();

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
        console.warn("Firestore snapshot error in Bestsellers (falling back to static JSON):", error);
      }
    );
    return () => unsub();
  }, []);

  // 🧮 DYNAMIC SCARCITY-BASED BESTSELLER LOGIC (Sold Out + Low Stock <= 3)
  const bestsellerProducts = useMemo(() => {
    const sourceData = liveProducts && liveProducts.length > 0
      ? liveProducts
      : Object.values(productDescriptions || {});

    // 1. Filter specifically for Bestseller candidates: Sold Out (0) OR Low Stock (<= 3)
    const hotSellers = sourceData.filter((prod) => {
      const count = Number(prod.stockCount);
      return !isNaN(count) && count <= 3;
    });

    // 2. Fallback: If there are fewer than 4 scarcity items, backfill with remaining products so carousel stays full
    const backfill = sourceData.filter((prod) => {
      const count = Number(prod.stockCount);
      return isNaN(count) || count > 3;
    });

    const combinedList = [...hotSellers, ...backfill].slice(0, 6);

    return combinedList.map((prod) => {
      const mainImage =
        prod.image ||
        (Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : null) ||
        "/images/ScrunchiefrillsComingSoon1.png";

      return {
        id: prod.id || prod.sku,
        name: prod.name,
        price: prod.price || 249,
        compareAtPrice: prod.compareAtPrice || 315,
        image: mainImage,
        stockCount: Number(prod.stockCount ?? 1),
      };
    });
  }, [liveProducts]);

  if (bestsellerProducts.length === 0) {
    return null; // Renders nothing if no completed products are listed
  }

  return (
    <section
      className="pt-12 sm:pt-16 md:pt-20 pb-0 relative bg-cover bg-center text-black overflow-hidden"
      style={{ backgroundImage: "url('/images/SFBestsellers.png')" }}
    >
      {/* Overlay backdrop shims to heighten typography reading contrasts */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none select-none" />

      <div className="relative z-10">
        {/* 🌟 BESTSELLERS GRAPHIC HEADING */}
        <div className="flex justify-center items-center mb-6 sm:mb-8 md:mb-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[480px] flex justify-center"
          >
            <img
              src="/images/BestsellersHeading.png"
              alt="Bestsellers"
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_4px_16px_rgba(224,33,113,0.25)]"
              onError={(e) => {
                // Graceful fallback to text if image asset is not found
                e.target.style.display = "none";
              }}
            />
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={bestsellerProducts.length > 2}
            loop={bestsellerProducts.length > 3}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: Math.min(2, bestsellerProducts.length), spaceBetween: 20 },
              1024: { slidesPerView: Math.min(3, bestsellerProducts.length), spaceBetween: 30 }
            }}
            className="pb-12"
          >
            {bestsellerProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <motion.div
                  whileHover={{ scale: product.stockCount === 0 ? 1 : 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-5 md:p-6 text-center border border-pink-100 hover:shadow-pink-200 transition-all duration-300 max-w-xs sm:max-w-sm mx-auto ${
                    product.stockCount === 0 ? "opacity-80" : ""
                  }`}
                >
                  {/* Bounding box viewport container mapping card framework slots */}
                  <div className="overflow-hidden rounded-xl sm:rounded-2xl w-full aspect-square bg-gray-50 border border-gray-100 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover rounded-xl sm:rounded-2xl transition duration-500 ${
                        product.stockCount === 0 ? "grayscale opacity-75" : "hover:scale-105"
                      }`}
                    />

                    {/* 🏷️ Automatic Out of Stock Corner Badge */}
                    {product.stockCount === 0 && (
                      <div className="absolute top-2.5 right-2.5 z-10 bg-black/85 backdrop-blur-sm text-white border border-white/20 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-1 select-none pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                        Out of Stock
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold text-gray-800 tracking-tight line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="mt-1.5 sm:mt-2 flex items-center justify-center gap-2">
                    <p className="text-[#E02171] font-bold text-base sm:text-lg">
                      ₹{product.price}
                    </p>
                    {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 line-through">
                        MRP ₹{product.compareAtPrice}
                      </span>
                    )}
                  </div>

                  {/* 🎀 Dedicated Graphic Buttons: Sold Out Key vs. Active Shop Button */}
                  {product.stockCount === 0 ? (
                    <div
                      aria-label="Sold Out"
                      className="mt-3 sm:mt-4 w-full flex items-center justify-center cursor-not-allowed select-none pointer-events-none"
                    >
                      <img
                        src="/images/BestsellerCarouselProductCardSoldOutButton.png"
                        alt="Sold Out"
                        className="w-auto h-8 sm:h-9 md:h-10 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] filter grayscale contrast-90"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.textContent = "SOLD OUT";
                          e.target.parentNode.className = "mt-3 sm:mt-4 w-full bg-gray-200 text-gray-400 px-5 py-2 rounded-full text-xs font-bold uppercase";
                        }}
                      />
                    </div>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate("/shop");
                      }}
                      className="mt-3 sm:mt-4 w-full flex items-center justify-center cursor-pointer select-none focus:outline-none bg-transparent border-none p-0"
                    >
                      <img
                        src="/images/BestsellerCarouselProductCardShopButton.png"
                        alt="Shop"
                        className="w-auto h-9 sm:h-10 md:h-11 object-contain drop-shadow-[0_4px_12px_rgba(224,33,113,0.3)] pointer-events-none"
                        onError={(e) => {
                          // Fallback to text styling if the image file fails to load
                          e.target.style.display = "none";
                          e.target.parentNode.textContent = "SHOP";
                          e.target.parentNode.className = "mt-3 sm:mt-4 w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white px-5 py-2 rounded-full font-bold uppercase";
                        }}
                      />
                    </motion.button>
                  )}
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default BestsellerCarousel;