import React from "react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  const cartItem = cart?.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="relative rounded-3xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 bg-white border border-pink-100">
      
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('/images/Scrunchiefrills_Website_Bestsellers.png')"
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col items-center text-center">
        
        <img
          src={product.image}
          alt={product.name}
          className="w-40 h-40 object-cover rounded-2xl border border-gray-100"
        />

        <h3 className="mt-4 text-sm font-black text-gray-800 uppercase tracking-tight line-clamp-1">
          {product.name}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-[#E02171] font-black text-base">
            ₹{product.price}
          </p>
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <span className="text-xs font-bold text-gray-400 line-through">
              MRP ₹{product.compareAtPrice}
            </span>
          )}
        </div>

        {/* Action Button: Blinkit-style Quick Add / Counter */}
        <div className="mt-4 w-full h-9">
          {quantity === 0 ? (
            <button 
              onClick={() => addToCart(product)}
              className="w-full h-full bg-[#E02171] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Add to Cart
            </button>
          ) : (
            <div className="w-full h-full bg-[#E02171] text-white rounded-xl flex items-center justify-between px-3 shadow-md font-black">
              <button 
                onClick={() => {
                  if (quantity === 1) removeFromCart(product.id);
                  else updateQuantity(product.id, -1);
                }}
                className="text-base font-black hover:bg-white/10 w-6 h-6 rounded flex items-center justify-center select-none"
              >
                −
              </button>
              <span className="text-xs font-black select-none">{quantity} Added</span>
              <button 
                onClick={() => updateQuantity(product.id, 1)}
                className="text-base font-black hover:bg-white/10 w-6 h-6 rounded flex items-center justify-center select-none"
              >
                +
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCard;