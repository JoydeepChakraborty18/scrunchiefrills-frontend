// src/components/profile/ProfileAvatarPickerModal.jsx
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Lock, Upload, Sparkles } from "lucide-react";
import { AVATAR_REGISTRY } from "../../data/avatarRegistry";

const ProfileAvatarPickerModal = ({
  isOpen,
  onClose,
  currentAvatarId,
  userStats,
  onSelectAvatar,
  onCustomUpload,
}) => {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const isUnlocked = (item) => {
    if (item.unlocked) return true;
    if (item.reqKey === "ordersCount" && (userStats.ordersCount || 0) >= item.reqThreshold) return true;
    if (item.reqKey === "bubbleCardsCollected" && (userStats.bubbleCardsCollected || 0) >= item.reqThreshold) return true;
    return false;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCustomUpload(reader.result);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border-2 border-pink-100 p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎀</span>
              <h3 className="text-base font-black text-gray-900 tracking-tight">Choose Your Avatar</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pink-50 text-gray-500 hover:text-[#E02171] flex items-center justify-center cursor-pointer transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Grid Selection */}
          <div className="overflow-y-auto py-4 space-y-4 pr-1">
            <p className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
              Official 2D Frill Sticker Avatars
            </p>

            <div className="grid grid-cols-2 gap-3">
              {AVATAR_REGISTRY.map((item) => {
                const unlocked = isUnlocked(item);
                const isSelected = currentAvatarId === item.avatarId;

                return (
                  <button
                    key={item.avatarId}
                    disabled={!unlocked}
                    onClick={() => {
                      if (unlocked) {
                        onSelectAvatar(item.avatarId);
                        onClose();
                      }
                    }}
                    className={`relative p-3 rounded-2xl border-2 text-left transition-all flex flex-col items-center text-center group cursor-pointer ${
                      isSelected
                        ? "border-[#E02171] bg-[#FFF2F8] shadow-md"
                        : unlocked
                        ? "border-pink-100 bg-white hover:border-pink-300"
                        : "border-gray-200 bg-gray-50/70 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-[#E02171] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
                        <Check size={12} />
                      </span>
                    )}

                    {/* Lock Overlay */}
                    {!unlocked && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-[10px]">
                        <Lock size={11} />
                      </div>
                    )}

                    <div className="w-20 h-20 rounded-full bg-pink-50/70 p-1 mb-2 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <span className="text-xs font-black text-gray-900 leading-tight block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium line-clamp-1">
                      {unlocked ? item.tagline : item.unlockRequirement}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Upload Option */}
            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-pink-200 hover:border-[#E02171] bg-pink-50/40 text-xs font-black text-[#E02171] flex items-center justify-center gap-2 cursor-pointer transition hover:bg-pink-50"
              >
                <Upload size={14} />
                Upload Your Own Image
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileAvatarPickerModal;