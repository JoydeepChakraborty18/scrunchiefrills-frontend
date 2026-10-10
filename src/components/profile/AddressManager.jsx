// src/components/profile/AddressManager.jsx
import React, { useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Check, X } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";

const ADDRESS_TYPES = ["Home", "Office", "Hostel", "School", "Tuition", "College", "Others"];

const AddressManager = ({ user, profile, onProfileUpdate }) => {
  const addresses = profile?.savedAddresses || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [addressType, setAddressType] = useState("Home");
  const [otherLabel, setOtherLabel] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("West Bengal");
  const [pinCode, setPinCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setAddressType("Home");
    setOtherLabel("");
    setFullName("");
    setPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setStateName("West Bengal");
    setPinCode("");
    setIsDefault(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (addr) => {
    setEditingId(addr.id);
    setIsAdding(true);
    if (ADDRESS_TYPES.includes(addr.type)) {
      setAddressType(addr.type);
      setOtherLabel(addr.type === "Others" ? addr.customLabel || "" : "");
    } else {
      setAddressType("Others");
      setOtherLabel(addr.type || "");
    }
    setFullName(addr.fullName || "");
    setPhone(addr.phone || "");
    setAddressLine1(addr.addressLine1 || "");
    setAddressLine2(addr.addressLine2 || "");
    setCity(addr.city || "");
    setStateName(addr.state || "West Bengal");
    setPinCode(addr.pinCode || "");
    setIsDefault(addr.isDefault || false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine1 || !city || !pinCode) {
      toast.error("Please fill in all mandatory fields!");
      return;
    }

    const finalType = addressType === "Others" ? (otherLabel.trim() || "Others") : addressType;

    const newAddressObj = {
      id: editingId || `addr_${Date.now()}`,
      type: finalType,
      customLabel: addressType === "Others" ? otherLabel.trim() : null,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state: stateName,
      pinCode,
      isDefault: addresses.length === 0 ? true : isDefault,
    };

    let updatedList = [];
    if (editingId) {
      updatedList = addresses.map((a) => (a.id === editingId ? newAddressObj : a));
    } else {
      updatedList = [...addresses, newAddressObj];
    }

    if (newAddressObj.isDefault) {
      updatedList = updatedList.map((a) => ({
        ...a,
        isDefault: a.id === newAddressObj.id,
      }));
    }

    try {
      if (user?.uid) {
        await setDoc(doc(db, "customers", user.uid), { savedAddresses: updatedList }, { merge: true });
      }
      onProfileUpdate({ ...profile, savedAddresses: updatedList });
      toast.success(editingId ? "Address updated! 💖" : "New address added! 🎀");
      resetForm();
    } catch (err) {
      toast.error("Failed to save address. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    try {
      if (user?.uid) {
        await setDoc(doc(db, "customers", user.uid), { savedAddresses: updated }, { merge: true });
      }
      onProfileUpdate({ ...profile, savedAddresses: updated });
      toast.success("Address removed!");
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (id) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    try {
      if (user?.uid) {
        await setDoc(doc(db, "customers", user.uid), { savedAddresses: updated }, { merge: true });
      }
      onProfileUpdate({ ...profile, savedAddresses: updated });
      toast.success("Primary delivery address set! 🚚");
    } catch (err) {
      toast.error("Could not set primary address.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider">
            Saved Delivery Addresses
          </h4>
          <p className="text-[10px] text-gray-400">Manage home, college, hostel, and other locations</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-full bg-[#E02171] text-white text-[10px] font-black uppercase flex items-center gap-1 hover:bg-pink-600 transition shadow-xs cursor-pointer"
          >
            <Plus size={12} /> Add New
          </button>
        )}
      </div>

      {/* Address Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-4 bg-[#FFF9FB] rounded-2xl border-2 border-pink-200 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <span className="font-black text-gray-800 text-[11px] uppercase">
              {editingId ? "Update Address" : "Add New Delivery Address"}
            </span>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          </div>

          {/* Address Category Options */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 block mb-1.5">
              Address Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ADDRESS_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAddressType(type)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                    addressType === type
                      ? "bg-[#E02171] text-white border-[#E02171] shadow-2xs"
                      : "bg-white text-gray-700 border-pink-200 hover:border-pink-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* If "Others" is chosen, let user input custom name */}
            {addressType === "Others" && (
              <div className="mt-2.5">
                <label className="text-[9px] font-black uppercase text-pink-600 block mb-1">
                  Custom Location Name (e.g. Nandu's House, Studio, Gym)
                </label>
                <input
                  type="text"
                  placeholder="Enter location name"
                  value={otherLabel}
                  onChange={(e) => setOtherLabel(e.target.value)}
                  className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold focus:outline-[#E02171]"
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Receiver's name"
                className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">10-Digit Mobile *</label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Address Line 1 *</label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House/Flat/Hostel/Office No, Building name"
              className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Landmark, Street or Area"
              className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">State *</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-gray-400 block mb-0.5">PIN Code *</label>
              <input
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full p-2 bg-white rounded-xl border border-pink-200 text-xs font-bold"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="accent-[#E02171] w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-bold text-gray-700 text-[11px]">Make this my primary delivery address</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#E02171] hover:bg-pink-600 text-white font-black uppercase tracking-wider"
            >
              {editingId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      <div className="space-y-3">
        {addresses.length === 0 && !isAdding ? (
          <div className="p-6 bg-[#FFF9FB] rounded-2xl border border-pink-100 text-center space-y-1">
            <MapPin size={22} className="mx-auto text-pink-300" />
            <p className="text-xs font-bold text-gray-800">No addresses saved yet</p>
            <p className="text-[10px] text-gray-400">Add an address for quick one-click checkouts!</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-2xl border-2 transition-all relative ${
                addr.isDefault ? "border-pink-300 bg-[#FFF9FB]" : "border-pink-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-pink-100/70 text-[#E02171]">
                  {addr.type}
                </span>

                {addr.isDefault ? (
                  <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Check size={10} /> Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#E02171] transition cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <p className="text-xs font-black text-gray-900">{addr.fullName}</p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
              </p>
              <p className="text-[11px] text-gray-600">
                {addr.city}, {addr.state} - {addr.pinCode}
              </p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">Phone: +91 {addr.phone}</p>

              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-pink-50">
                <button
                  onClick={() => startEdit(addr)}
                  className="text-[11px] font-bold text-[#E02171] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Edit2 size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-[11px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressManager;