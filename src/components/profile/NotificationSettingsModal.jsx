// src/components/profile/NotificationSettingsModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check } from "lucide-react";
import toast from "react-hot-toast";

const NotificationSettingsModal = ({ isOpen, onClose, savedSettings = {}, onSave }) => {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    paymentUpdates: true,
    shippingUpdates: true,
    newDrops: savedSettings.newDrops ?? true,
    restocks: savedSettings.restocks ?? true,
    offers: savedSettings.offers ?? true,
    recommendations: savedSettings.recommendations ?? false,
    bubbleGames: savedSettings.bubbleGames ?? true,
    whatsappUpdates: savedSettings.whatsappUpdates ?? false,
    emailMarketing: savedSettings.emailMarketing ?? true,
  });

  if (!isOpen) return null;

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    onSave(settings);
    toast.success("Notification preferences saved! 🔔");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border-2 border-pink-100 p-6 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[#E02171]" />
              <h3 className="text-base font-black text-gray-900">Notification Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pink-50 text-gray-500 hover:text-[#E02171] flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto py-4 space-y-4 pr-1 text-xs">
            {/* Transactional */}
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">
                Order & Shipping (Mandatory)
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="font-bold text-gray-700">Order & Payment Updates</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">Always On</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="font-bold text-gray-700">Shiprocket Tracking Alerts</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">Always On</span>
                </div>
              </div>
            </div>

            {/* Marketing Toggles */}
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">
                Marketing & Drops (Optional)
              </span>
              <div className="space-y-2">
                {[
                  { key: "newDrops", label: "New Drops & Collections" },
                  { key: "restocks", label: "Restock Alerts" },
                  { key: "offers", label: "Exclusive Offers & Coupons" },
                  { key: "bubbleGames", label: "Bubble Cards & Game Drops" },
                  { key: "whatsappUpdates", label: "WhatsApp Alerts" },
                  { key: "emailMarketing", label: "Email Newsletter" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9FB] border border-pink-100 cursor-pointer"
                  >
                    <span className="font-bold text-gray-800">{label}</span>
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={() => toggle(key)}
                      className="accent-[#E02171] w-4 h-4 rounded-sm cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-pink-100">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-2xl bg-[#E02171] hover:bg-pink-600 text-xs font-black text-white cursor-pointer shadow-md"
            >
              Update Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationSettingsModal;