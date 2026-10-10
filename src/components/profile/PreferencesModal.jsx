// src/components/profile/PreferencesModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import toast from "react-hot-toast";

const COLOUR_OPTIONS = [
  "Pink", "Purple", "Blue", "Green", "Yellow", "Orange", "Red", "Neutrals", "Multicolour"
];

const VIBE_OPTIONS = [
  "Cute", "Girly", "Y2K", "Minimal", "Bold", "Quirky", "Kawaii", "Coquette", "Street"
];

const CATEGORY_OPTIONS = [
  "Scrunchies", "Gift hampers", "Stickers", "Candles", "Soaps", "Cookies", "Apparel", "Accessories"
];

const PreferencesModal = ({ isOpen, onClose, savedPreferences = {}, onSave }) => {
  const [colours, setColours] = useState(savedPreferences.colours || ["Pink", "Purple"]);
  const [vibes, setVibes] = useState(savedPreferences.vibes || ["Cute", "Y2K"]);
  const [categories, setCategories] = useState(savedPreferences.categories || ["Scrunchies"]);

  // 🌸 Hide mobile bottom nav when preferences modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = () => {
    onSave({ colours, vibes, categories });
    toast.success("Frill preferences updated! 💖");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border-2 border-pink-100 p-6 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-[#E02171] fill-[#E02171]" />
              <h3 className="text-base font-black text-gray-900">My Frill Preferences</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pink-50 text-gray-500 hover:text-[#E02171] flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto py-4 space-y-5 pr-1">
            <p className="text-xs text-gray-400">
              Optional & skippable. Helps customize your personal recommendations!
            </p>

            {/* Colours */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 block mb-2">
                Favourite Colours
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOUR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleItem(colours, setColours, c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      colours.includes(c)
                        ? "bg-[#E02171] text-white border-[#E02171]"
                        : "bg-white text-gray-700 border-pink-200 hover:border-[#E02171]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibes */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 block mb-2">
                Favourite Vibes
              </label>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleItem(vibes, setVibes, v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      vibes.includes(v)
                        ? "bg-[#E02171] text-white border-[#E02171]"
                        : "bg-white text-gray-700 border-pink-200 hover:border-[#E02171]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 block mb-2">
                Favourite Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleItem(categories, setCategories, cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      categories.includes(cat)
                        ? "bg-[#E02171] text-white border-[#E02171]"
                        : "bg-white text-gray-700 border-pink-200 hover:border-[#E02171]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-pink-100 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-black text-gray-700 cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-2xl bg-[#E02171] hover:bg-pink-600 text-xs font-black text-white cursor-pointer shadow-md"
            >
              Save Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PreferencesModal;