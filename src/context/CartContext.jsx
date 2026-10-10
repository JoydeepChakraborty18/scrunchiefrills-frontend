import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const localCart = localStorage.getItem("sf_guest_cart");
      return localCart ? JSON.parse(localCart) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isCartLoading, setIsCartLoading] = useState(true);

  // 🛡️ Track whether an update originated locally to prevent onSnapshot race-condition echoes
  const isLocalUpdateRef = useRef(false);

  // 🔑 1. Listen for Auth Changes & Attach Real-Time Firestore Listener
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        const cartRef = doc(db, "carts", user.uid);

        unsubscribeSnapshot = onSnapshot(
          cartRef,
          (docSnap) => {
            // Ignore snapshot trigger if we just performed a local write
            if (isLocalUpdateRef.current) {
              isLocalUpdateRef.current = false;
              setIsCartLoading(false);
              return;
            }

            if (docSnap.exists()) {
              const remoteItems = docSnap.data().items || [];
              setCart(remoteItems);
              try {
                localStorage.setItem("sf_guest_cart", JSON.stringify(remoteItems));
              } catch (e) {
                console.warn("LocalStorage write error:", e);
              }
            }
            setIsCartLoading(false);
          },
          (err) => {
            console.warn("Firestore Cart Listener Notice:", err.message);
            setIsCartLoading(false);
          }
        );
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        try {
          const localCart = localStorage.getItem("sf_guest_cart");
          setCart(localCart ? JSON.parse(localCart) : []);
        } catch {
          setCart([]);
        }
        setIsCartLoading(false);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // 💾 2. Single-Source Persistence Function
  const syncCartStorage = useCallback(async (updatedCart, user = currentUser) => {
    try {
      localStorage.setItem("sf_guest_cart", JSON.stringify(updatedCart));
    } catch (e) {
      console.warn("LocalStorage write error:", e);
    }

    if (user) {
      try {
        isLocalUpdateRef.current = true;
        const cartRef = doc(db, "carts", user.uid);
        await setDoc(cartRef, { items: updatedCart, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        isLocalUpdateRef.current = false;
        console.error("Failed to commit cart update to Firestore:", err);
      }
    }
  }, [currentUser]);

  // 🛍️ 3. Safe Add To Cart (Debounced / Single Execution)
  const addToCart = useCallback((product) => {
    if (!product?.id) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);
      let updatedCart;

      if (existingIndex > -1) {
        updatedCart = prevCart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [
          ...prevCart,
          {
            id: product.id,
            name: product.name || "Scrunchie",
            sku: product.sku || product.id || "SF-DEFAULT-SKU",
            price: Number(product.price || 249),
            compareAtPrice: Number(product.compareAtPrice || 315),
            image: product.image || "/images/ScrunchiefrillsComingSoon1.png",
            quantity: 1,
            sizeTier: product.sizeTier || "cloud",
            fabric: product.fabric || "Premium Satin",
            collection: product.collection || "The Debut Lot",
          },
        ];
      }

      // Sync persistence asynchronously
      syncCartStorage(updatedCart);
      return updatedCart;
    });

    // 🔔 Toast notification executed outside setCart to prevent StrictMode duplicates
    toast.success(`${product.name || "Scrunchie"} added to bag! 💖`, {
      id: `toast-add-${product.id}`, // Unique ID prevents duplicate popups
      duration: 2000,
    });
  }, [syncCartStorage]);

  // 🔢 4. Safe Quantity Adjuster (+1 or -1)
  const updateQuantity = useCallback((productId, delta) => {
    if (!productId || delta === 0) return;

    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      syncCartStorage(updatedCart);
      return updatedCart;
    });
  }, [syncCartStorage]);

  // 🗑️ 5. Safe Remove Item
  const removeFromCart = useCallback((productId) => {
    if (!productId) return;

    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== productId);
      syncCartStorage(updatedCart);
      return updatedCart;
    });

    toast("Removed from case! 🎀", {
      id: `toast-rem-${productId}`,
      icon: "🗑️",
      duration: 2000,
    });
  }, [syncCartStorage]);

  // ✨ 6. Post-Payment Cart Cleanup
  const clearCart = useCallback(async () => {
    setCart([]);
    try {
      localStorage.removeItem("sf_guest_cart");
    } catch {}

    if (currentUser) {
      try {
        isLocalUpdateRef.current = true;
        const cartRef = doc(db, "carts", currentUser.uid);
        await setDoc(cartRef, { items: [], updatedAt: new Date().toISOString() });
      } catch (err) {
        isLocalUpdateRef.current = false;
        console.warn("Failed to clear Firestore cart:", err);
      }
    }
  }, [currentUser]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
};