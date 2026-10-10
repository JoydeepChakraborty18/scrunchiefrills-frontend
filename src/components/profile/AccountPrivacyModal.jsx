// src/components/profile/AccountPrivacyModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, User, Mail, Phone, Lock, Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";

const AccountPrivacyModal = ({
  isOpen,
  onClose,
  userData,
  onUpdateAccount,
  onLogout,
}) => {
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const [fullName, setFullName] = useState(userData.fullName || "");
  const [phone, setPhone] = useState(userData.phone || "");
  const [birthdayMonth, setBirthdayMonth] = useState(userData.birthdayMonth || "");

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateAccount({ displayName, fullName, phone, birthdayMonth });
    toast.success("Account information saved! 🌸");
    onClose();
  };

  const handleRequestData = () => {
    toast("Your data archive has been generated and sent to your email 📁", { icon: "🎀" });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border-2 border-pink-100 p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#E02171]" />
              <h3 className="text-base font-black text-gray-900">Account & Privacy Controls</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-pink-50 text-gray-500 hover:text-[#E02171] flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="overflow-y-auto py-4 space-y-4 pr-1 text-xs">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 rounded-xl border border-pink-200 focus:outline-[#E02171] text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-xl border border-pink-200 focus:outline-[#E02171] text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                Email (Registered)
              </label>
              <input
                type="email"
                disabled
                value={userData.email || ""}
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-xs font-bold cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-pink-200 focus:outline-[#E02171] text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Birthday Month (Optional)
                </label>
                <select
                  value={birthdayMonth}
                  onChange={(e) => setBirthdayMonth(e.target.value)}
                  className="w-full p-3 rounded-xl border border-pink-200 focus:outline-[#E02171] text-xs font-bold bg-white"
                >
                  <option value="">Select</option>
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#E02171] text-white font-black hover:bg-pink-600 transition cursor-pointer"
            >
              Save Profile Changes
            </button>

            {/* Privacy Rights & Controls */}
            <div className="pt-4 border-t border-pink-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Privacy & Data Rights
              </span>
              <button
                type="button"
                onClick={handleRequestData}
                className="w-full p-2.5 rounded-xl border border-pink-200 bg-pink-50/50 hover:bg-pink-50 text-[#E02171] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                Request Personal Data Copy
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Logout from Scrunchiefrills
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AccountPrivacyModal;