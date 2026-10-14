// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Edit2,
  X,
  Lock,
} from "lucide-react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import toast from "react-hot-toast";

// 🎀 Sub-Component Imports
import PersonaCard from "../components/profile/PersonaCard";
import FrillStatsGrid from "../components/profile/FrillStatsGrid";
import AvatarCollectionSection from "../components/profile/AvatarCollectionSection";
import OrderHistoryCard from "../components/profile/OrderHistoryCard";
import ScrapbookGridSection from "../components/profile/ScrapbookGridSection";
import RewardsSection from "../components/profile/RewardsSection";
import AddressManager from "../components/profile/AddressManager";
import PreferencesModal from "../components/profile/PreferencesModal";
import NotificationSettingsModal from "../components/profile/NotificationSettingsModal";
import AccountPrivacyModal from "../components/profile/AccountPrivacyModal";
import ProfileAvatarPickerModal from "../components/profile/ProfileAvatarPickerModal";
import { AVATAR_REGISTRY } from "../data/avatarRegistry";

// 🧮 Central Progression Engine
import {
  calculateLevel,
  PERSONA_ASSETS,
  ACHIEVEMENTS_REGISTRY,
  getWeeklyQuestState,
} from "../utils/progressionEngine";

// 🫧 Single Source of Truth for Bubble Cards
import { bubbleCards } from "../data/bubbleCards";

const CONFIRMED_STATUSES = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"];

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [bubbleCardsMap, setBubbleCardsMap] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Accordion toggle
  const [activeSection, setActiveSection] = useState(null);

  // Modals
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountPrivacyOpen, setIsAccountPrivacyOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // 🌸 Automatically hide MobileBottomNav whenever ANY modal is opened
  useEffect(() => {
    const isAnyModalActive =
      isAvatarPickerOpen ||
      isPreferencesOpen ||
      isNotificationsOpen ||
      isAccountPrivacyOpen ||
      isStatsModalOpen;

    if (isAnyModalActive) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [
    isAvatarPickerOpen,
    isPreferencesOpen,
    isNotificationsOpen,
    isAccountPrivacyOpen,
    isStatsModalOpen,
  ]);

  // 🎮 Weekly Periodic Quests
  const { weekKey, daysRemaining, activeQuests } = getWeeklyQuestState();

  useEffect(() => {
    let unsubUsersDoc = () => {};
    let unsubCustomerDoc = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast("Please log in to view your profile! 🌸", { icon: "🎀" });
        navigate("/", { replace: true });
        return;
      }

      setCurrentUser(user);

      try {
        // 1. 🔥 Real-time listener for customer doc (live sync for Cyclone rewards & XP)
        const userDocRef = doc(db, "customers", user.uid);
        unsubCustomerDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setProfileData(snap.data());
          }
        });

        // 2. 🫧 Real-time listener on users collection for Scrapbook cards
        const usersDocRef = doc(db, "users", user.uid);
        unsubUsersDoc = onSnapshot(usersDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setBubbleCardsMap(data.bubbleCards || {});
          }
        });

        // 3. 🛍️ Fetch orders across uid and customer.uid indices
        const ordersRef = collection(db, "orders");
        const ordersMap = new Map();

        try {
          const qRootUid = query(ordersRef, where("uid", "==", user.uid));
          const snapRootUid = await getDocs(qRootUid);
          snapRootUid.docs.forEach((d) => ordersMap.set(d.id, { id: d.id, ...d.data() }));
        } catch (e) {
          console.warn("Root uid query notice:", e);
        }

        try {
          const qNestedUid = query(ordersRef, where("customer.uid", "==", user.uid));
          const snapNestedUid = await getDocs(qNestedUid);
          snapNestedUid.docs.forEach((d) => ordersMap.set(d.id, { id: d.id, ...d.data() }));
        } catch (e) {
          console.warn("Nested customer.uid query notice:", e);
        }

        if (user.email) {
          try {
            const qRootEmail = query(ordersRef, where("email", "==", user.email));
            const snapRootEmail = await getDocs(qRootEmail);
            snapRootEmail.docs.forEach((d) => ordersMap.set(d.id, { id: d.id, ...d.data() }));
          } catch (e) {
            console.warn("Root email query notice:", e);
          }

          try {
            const qNestedEmail = query(ordersRef, where("customer.email", "==", user.email));
            const snapNestedEmail = await getDocs(qNestedEmail);
            snapNestedEmail.docs.forEach((d) => ordersMap.set(d.id, { id: d.id, ...d.data() }));
          } catch (e) {
            console.warn("Nested customer.email query notice:", e);
          }
        }

        let customerOrders = Array.from(ordersMap.values());
        customerOrders.sort((a, b) => {
          const getTimestamp = (orderObj) => {
            const val = orderObj.createdAt || orderObj.orderDateTime;
            if (val?.toMillis) return val.toMillis();
            if (val instanceof Date) return val.getTime();
            if (typeof val === "string") return new Date(val).getTime();
            return 0;
          };
          return getTimestamp(b) - getTimestamp(a);
        });

        setOrders(customerOrders);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubUsersDoc();
      unsubCustomerDoc();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("See you soon, Scrunchiefriller! 💖");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleTrackModal = (order) => {
    if (order.awbCode) {
      window.open(`https://shiprocket.co/tracking/${order.awbCode}`, "_blank");
    } else {
      toast(
        `Order #${order.orderId || order.id} is ${order.orderStatus || order.fulfillmentStatus || "PROCESSING"}. Courier tracking is generated upon parcel pickup! 🚚`,
        { icon: "🎀" }
      );
    }
  };

  // 📦 Confirmed orders only
  const confirmedOrders = orders.filter((o) => {
    const status = (o.orderStatus || o.status || o.fulfillmentStatus || "").toUpperCase();
    return CONFIRMED_STATUSES.includes(status);
  });
  const actualOrdersCount = confirmedOrders.length;

  // 🫧 Unique Bubble Cards unlocked
  const unlockedBubbleCardIds = Object.keys(bubbleCardsMap).filter(
    (key) => (bubbleCardsMap[key] || 0) > 0
  );
  const actualCardsCount = unlockedBubbleCardIds.length;

  // 🏆 Dynamic achievements calculation
  const rawAchievements = profileData?.achievements || [];
  const evalState = {
    ordersCount: actualOrdersCount,
    confirmedOrdersCount: actualOrdersCount,
    bubbleCardsCollected: actualCardsCount,
    persona: profileData?.persona || localStorage.getItem("sf_quiz_persona"),
  };

  const resolvedAchievements = ACHIEVEMENTS_REGISTRY.filter((ach) => {
    return rawAchievements.includes(ach.id) || ach.condition(evalState);
  }).map((ach) => ach.id);

  // Background sync for newly unlocked achievements
  useEffect(() => {
    if (!currentUser?.uid || resolvedAchievements.length === 0) return;
    const hasNewAchievements = resolvedAchievements.some(
      (id) => !rawAchievements.includes(id)
    );

    if (hasNewAchievements) {
      setDoc(
        doc(db, "customers", currentUser.uid),
        { achievements: resolvedAchievements },
        { merge: true }
      ).catch((err) => console.warn("Achievement auto-sync notice:", err));
    }
  }, [currentUser?.uid, resolvedAchievements.join(",")]);

  // 👑 Progression Engine metrics
  const totalXp = profileData?.xp || 0;
  const levelMetrics = calculateLevel(totalXp);
  const authenticRewards = profileData?.rewards || [];

  const userStats = {
    level: levelMetrics.level,
    title: levelMetrics.title,
    xp: levelMetrics.xp,
    maxXp: levelMetrics.maxXp,
    progressPercent: levelMetrics.progressPercent,
    ordersCount: actualOrdersCount,
    bubbleCardsCollected: actualCardsCount,
    rewardsCount: authenticRewards.length,
    achievementsCount: resolvedAchievements.length,
  };

  const getQuestCurrentValue = (metricKey) => {
    switch (metricKey) {
      case "weeklyQuizTaken":
        return profileData?.lastQuizWeek === weekKey ? 1 : 0;
      case "weeklyAvatarChanged":
        return profileData?.lastAvatarWeek === weekKey ? 1 : 0;
      case "weeklyCardsEarned":
        return Math.min(2, actualCardsCount % 3);
      case "totalUniqueCards":
        return actualCardsCount;
      case "weeklyOrdersCount":
        return actualOrdersCount;
      default:
        return 0;
    }
  };

  const handleSelectAvatar = async (avatarId) => {
    setProfileData((prev) => ({ ...prev, avatarId, customAvatarUrl: null }));
    if (currentUser?.uid) {
      try {
        await setDoc(
          doc(db, "customers", currentUser.uid),
          { avatarId, customAvatarUrl: null, lastAvatarWeek: weekKey },
          { merge: true }
        );
        toast.success("Avatar changed! ✨");
      } catch (e) {
        console.warn("Avatar update synced locally:", e);
      }
    }
  };

  const handleCustomUpload = async (base64) => {
    setProfileData((prev) => ({ ...prev, customAvatarUrl: base64 }));
    if (currentUser?.uid) {
      try {
        await setDoc(
          doc(db, "customers", currentUser.uid),
          { customAvatarUrl: base64, lastAvatarWeek: weekKey },
          { merge: true }
        );
        toast.success("Custom profile photo saved! 🎀");
      } catch (err) {
        console.warn("Custom photo synced locally:", err);
      }
    }
  };

  const handleSavePreferences = async (newPrefs) => {
    setProfileData((prev) => ({ ...prev, preferences: newPrefs }));
    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, "customers", currentUser.uid), { preferences: newPrefs }, { merge: true });
      } catch (e) {
        console.warn("Preferences synced locally:", e);
      }
    }
  };

  const handleSaveNotifications = async (notifSettings) => {
    setProfileData((prev) => ({ ...prev, notificationPreferences: notifSettings }));
    if (currentUser?.uid) {
      try {
        await setDoc(
          doc(db, "customers", currentUser.uid),
          { notificationPreferences: notifSettings },
          { merge: true }
        );
      } catch (e) {
        console.warn("Notifications synced locally:", e);
      }
    }
  };

  const handleSaveAccountInfo = async (accountFields) => {
    setProfileData((prev) => ({ ...prev, ...accountFields }));
    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, "customers", currentUser.uid), accountFields, { merge: true });
      } catch (e) {
        console.warn("Account info synced locally:", e);
      }
    }
  };

  const toggleSection = (sectionName) => {
    setActiveSection((prev) => (prev === sectionName ? null : sectionName));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF2F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E02171] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#E02171] tracking-wider uppercase">
            Loading your frill lounge... 💗
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    profileData?.displayName || profileData?.fullName || profileData?.customerName || currentUser?.displayName || "Sreyasi";
  const username = profileData?.username || (currentUser?.email ? currentUser.email.split("@")[0] : "sreyasi");

  const activePersonaName = profileData?.persona || localStorage.getItem("sf_quiz_persona");
  const persona = activePersonaName && PERSONA_ASSETS ? PERSONA_ASSETS[activePersonaName] : null;

  const selectedAvatarId = profileData?.avatarId || "bubblegum-girl";
  const matchedAvatar = AVATAR_REGISTRY.find((a) => a.avatarId === selectedAvatarId) || AVATAR_REGISTRY[1];
  const avatarImageSrc = profileData?.customAvatarUrl || matchedAvatar.image;

  return (
    <div className="min-h-screen w-full bg-[#FFF2F8] text-gray-800 font-sans pt-24 sm:pt-28 pb-28 selection:bg-pink-200">
      {/* 🖥️ Wide Full-Canvas Responsive Container */}
      <main className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 md:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
          
          {/* 🌟 LEFT COLUMN: Profile Identity & Gamification Stack (5 Cols on Large, 4 on XL) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5 lg:sticky lg:top-28">
            
            {/* 1. PROFILE HEADER CARD */}
            <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-pink-100 shadow-sm relative overflow-hidden">
              <span className="absolute top-4 right-5 text-2xl select-none filter drop-shadow-xs">🎀</span>

              <div className="flex items-center gap-5 sm:gap-6">
                {/* Left: Avatar with Edit Badge */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 xl:w-32 xl:h-32 rounded-full bg-gradient-to-b from-[#FFF2F8] to-pink-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    <img
                      src={avatarImageSrc}
                      alt={displayName}
                      className="w-full h-full object-cover object-center rounded-full"
                    />
                  </div>
                  <button
                    onClick={() => setIsAvatarPickerOpen(true)}
                    className="absolute bottom-1 right-1 w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-[#E02171] text-white flex items-center justify-center shadow-md border-2 border-white hover:scale-110 active:scale-95 transition cursor-pointer"
                    title="Change Avatar"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>

                {/* Right: User Information */}
                <div className="flex-1 min-w-0 space-y-1.5 text-left">
                  <h2 className="text-lg sm:text-xl xl:text-2xl font-black text-gray-900 tracking-tight leading-snug break-words">
                    {displayName}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold text-gray-400">@{username}</p>

                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E02171] text-[10px] font-black text-white uppercase tracking-wider shadow-2xs">
                      ✓ VERIFIED SCRUNCHIEFRILLER
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 pt-0.5">
                    📅 Scrunchiefriller since Sept 2026
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsAccountPrivacyOpen(true)}
                      className="px-4 py-1.5 rounded-full bg-white border border-pink-200 text-xs font-black text-gray-700 hover:text-[#E02171] hover:border-[#E02171] transition shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-98"
                    >
                      <Edit2 size={12} className="text-[#E02171]" /> Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MY FRILL PERSONA COMPONENT */}
            {persona ? (
              <PersonaCard
                personaName={persona.name}
                onRetakeQuiz={() => {
                  localStorage.removeItem("sf_quiz_result_key");
                  navigate("/home#quiz", { state: { scrollToQuiz: true } });
                }}
              />
            ) : (
              <div className="bg-white rounded-[32px] p-6 border-2 border-dashed border-pink-200 text-center space-y-3 shadow-xs">
                <span className="text-3xl">✨</span>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Discover Your Frill Persona</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Take our quick 4-question aesthetic quiz to discover your vibe, earn +150 XP, and unlock perks!
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem("sf_quiz_result_key");
                    navigate("/home#quiz", { state: { scrollToQuiz: true } });
                  }}
                  className="px-6 py-2.5 bg-[#E02171] text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md hover:bg-pink-600 transition cursor-pointer"
                >
                  Take the Quiz 🎀
                </button>
              </div>
            )}

            {/* 3. GAMIFIED STATS COMPONENT */}
            <FrillStatsGrid
              stats={userStats}
              onViewAllClick={() => setIsStatsModalOpen(true)}
            />
          </div>

          {/* 📂 RIGHT COLUMN: Interactive Accordions & Buyer Protection (7 Cols on Large, 8 on XL) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5">
            {/* 4. NAVIGATION ACCORDION TILES */}
            <div className="bg-white rounded-[32px] border border-pink-100 shadow-sm divide-y divide-pink-50 overflow-hidden">
              {/* MY AVATARS */}
              <button
                onClick={() => toggleSection("avatars")}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl shrink-0 select-none">🎀</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">My Avatars</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Choose, unlock and collect exclusive Scrunchiefrills avatars</span>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-pink-300 transition-transform ${activeSection === "avatars" ? "rotate-90" : ""}`} />
              </button>
              {activeSection === "avatars" && (
                <div className="p-3 sm:p-4 border-t border-pink-100">
                  <AvatarCollectionSection
                    currentAvatarId={selectedAvatarId}
                    userStats={userStats}
                    onSelectAvatar={handleSelectAvatar}
                    onOpenPicker={() => setIsAvatarPickerOpen(true)}
                  />
                </div>
              )}

              {/* MY ORDERS */}
              <button
                onClick={() => toggleSection("orders")}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl shrink-0 select-none">🛍️</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">My Orders</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Track, view or reorder your purchases</span>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-pink-300 transition-transform ${activeSection === "orders" ? "rotate-90" : ""}`} />
              </button>
              {activeSection === "orders" && (
                <div className="p-4 sm:p-5 bg-[#FFFDFE] border-t border-pink-100 space-y-3">
                  {confirmedOrders.length === 0 ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="text-3xl">🛍️</div>
                      <h4 className="text-xs font-black text-gray-900 uppercase">No confirmed orders placed yet!</h4>
                      <p className="text-xs text-gray-400">Your scrunchie stack is waiting to be filled.</p>
                      <button
                        onClick={() => navigate("/shop")}
                        className="px-5 py-2.5 bg-[#E02171] text-white rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    confirmedOrders.map((order) => (
                      <OrderHistoryCard
                        key={order.id || order.orderId}
                        order={order}
                        onTrackClick={handleTrackModal}
                      />
                    ))
                  )}
                </div>
              )}

              {/* MY SCRAPBOOK */}
              <button
                onClick={() => toggleSection("scrapbook")}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl shrink-0 select-none">🫧</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">My Scrapbook</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Your collected Bubble Cards, quiz results and more</span>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-pink-300 transition-transform ${activeSection === "scrapbook" ? "rotate-90" : ""}`} />
              </button>
              {activeSection === "scrapbook" && (
                <div className="p-3 sm:p-4 border-t border-pink-100">
                  <ScrapbookGridSection bubbleCardsMap={bubbleCardsMap} />
                </div>
              )}

              {/* MY REWARDS */}
              <button
                onClick={() => toggleSection("rewards")}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl shrink-0 select-none">🎁</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">My Rewards</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Coupons, freebies and exclusive rewards</span>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-pink-300 transition-transform ${activeSection === "rewards" ? "rotate-90" : ""}`} />
              </button>
              {activeSection === "rewards" && (
                <div className="p-3 sm:p-4 border-t border-pink-100">
                  <RewardsSection rewards={authenticRewards} />
                </div>
              )}

              {/* MY FRILL PREFERENCES */}
              <button
                onClick={() => setIsPreferencesOpen(true)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl shrink-0 select-none">💗</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">My Frill Preferences</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Colours, vibes and products you love</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-pink-300" />
              </button>

              {/* SAVED ADDRESSES */}
              <button
                onClick={() => toggleSection("addresses")}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 filter drop-shadow-[0_2px_4px_rgba(224,33,113,0.3)] shrink-0"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C8.13401 2 5 5.13401 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13401 15.866 2 12 2Z"
                      fill="url(#pinGradientProfilePin)"
                    />
                    <circle cx="12" cy="9" r="3" fill="white" />
                    <defs>
                      <linearGradient id="pinGradientProfilePin" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF4B91" />
                        <stop offset="0.5" stopColor="#E02171" />
                        <stop offset="1" stopColor="#B31255" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">Saved Addresses</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Manage your delivery addresses</span>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-pink-300 transition-transform ${activeSection === "addresses" ? "rotate-90" : ""}`} />
              </button>
              {activeSection === "addresses" && (
                <div className="p-4 sm:p-5 bg-[#FFFDFE] border-t border-pink-100">
                  <AddressManager
                    user={currentUser}
                    profile={profileData}
                    onProfileUpdate={(updated) => setProfileData(updated)}
                  />
                </div>
              )}

              {/* NOTIFICATIONS */}
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl shrink-0 select-none">🔔</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">Notifications</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Order updates, offers, new drops and more</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-pink-300" />
              </button>

              {/* ACCOUNT & PRIVACY */}
              <button
                onClick={() => setIsAccountPrivacyOpen(true)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[#FFF9FB] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl shrink-0 select-none">⚙</span>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-gray-900 block leading-tight">Account & Privacy</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Personal information, security and account settings</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>

            {/* 5. BUYER PROTECTION FOOTER CARD */}
            <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-pink-100/90 shadow-sm relative overflow-hidden flex items-center justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-2xl shrink-0">
                📦
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs sm:text-sm font-black text-[#E02171] uppercase tracking-wider">
                  Scrunchiefrills Buyer Protection
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Every parcel is hand-checked, sanitised, and dispatched with tamper-proof packaging.
                </p>
              </div>
              <div className="text-2xl shrink-0 select-none">
                🎀
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ==================================================
          6. MODALS
      ================================================== */}

      {/* 🏆 LIVE STATS "VIEW ALL" DRILL-DOWN MODAL */}
      <AnimatePresence>
        {isStatsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border-2 border-pink-100 p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <h3 className="text-base font-black text-gray-900">Frill Stats & Progression</h3>
                </div>
                <button
                  onClick={() => setIsStatsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-pink-50 text-gray-500 hover:text-[#E02171] flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-5 pr-1">
                {/* Level Showcase Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-pink-500 tracking-wider">Current Tier</span>
                    <h4 className="text-base font-black text-gray-900">Level 0{levelMetrics.level} — {levelMetrics.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">{levelMetrics.xp} / {levelMetrics.maxXp} Total XP</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl border border-pink-100">
                    👑
                  </div>
                </div>

                {/* Recent Achievement Spotlight */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                    Recent Achievement
                  </span>
                  <div className="p-3.5 rounded-2xl bg-[#FFF9FB] border border-pink-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl shrink-0">
                      🎀
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-black text-gray-900">First Frill</h5>
                      <p className="text-[10px] text-gray-500">
                        {actualOrdersCount > 0 ? "Placed your first confirmed order! (Unlocked 🎉)" : "Place your first confirmed order to unlock!"}
                      </p>
                    </div>
                    {actualOrdersCount > 0 ? (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <Lock size={14} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 🎮 DYNAMIC PERIODIC QUESTS SECTION */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                      Weekly Quests <span className="text-pink-500 font-bold">({weekKey})</span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">
                      ⏳ Resets in {daysRemaining}d
                    </span>
                  </div>

                  {activeQuests.map((quest) => {
                    const currentVal = Math.min(quest.target, getQuestCurrentValue(quest.metricKey));
                    const isCompleted = currentVal >= quest.target;
                    const progressPercent = Math.min(100, (currentVal / quest.target) * 100);

                    return (
                      <div
                        key={quest.id}
                        className={`p-3 rounded-2xl border space-y-1.5 transition-all ${
                          isCompleted
                            ? "bg-[#FFF9FB] border-pink-200"
                            : "bg-white border-pink-100 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{quest.icon}</span>
                            <div>
                              <p className="leading-tight text-gray-900 font-black">{quest.title}</p>
                              <p className="text-[10px] text-gray-400 font-normal">{quest.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-[#E02171] font-black block">
                              {currentVal} / {quest.target}
                            </span>
                            <span className="text-[9px] font-bold text-amber-500 uppercase">
                              +{quest.rewardXp} XP
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-2 bg-pink-50 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? "bg-emerald-500" : "bg-[#E02171]"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* All Achievements Header and List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                    All Achievements ({resolvedAchievements.length} Unlocked)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ACHIEVEMENTS_REGISTRY.map((ach) => {
                      const isAchUnlocked = resolvedAchievements.includes(ach.id);

                      return (
                        <div
                          key={ach.id}
                          className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                            isAchUnlocked
                              ? "bg-[#FFF9FB] border-pink-200"
                              : "bg-gray-50/70 border-gray-200 opacity-60"
                          }`}
                        >
                          <span className="text-xl shrink-0">{ach.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h6 className="text-xs font-black text-gray-900 leading-tight">{ach.title}</h6>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{ach.description}</p>
                          </div>
                          {isAchUnlocked ? (
                            <span className="text-emerald-500 text-xs font-black">✓</span>
                          ) : (
                            <Lock size={12} className="text-gray-400 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Unlocked Bubble Cards Pill List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      Unlocked Bubble Cards ({actualCardsCount})
                    </span>
                    <button
                      onClick={() => {
                        setIsStatsModalOpen(false);
                        navigate("/scrapbook");
                      }}
                      className="text-[10px] font-bold text-[#E02171] hover:underline cursor-pointer"
                    >
                      Open Scrapbook &rarr;
                    </button>
                  </div>
                  {unlockedBubbleCardIds.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-3 bg-pink-50/50 rounded-xl text-center">
                      No bubble cards collected yet. Pop bubbles in the weekly Bubble Pop game to earn cards!
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {unlockedBubbleCardIds.map((cardId) => (
                        <span
                          key={cardId}
                          className="px-3 py-1 rounded-full bg-purple-50 text-[10px] font-bold text-purple-700 border border-purple-200 flex items-center gap-1"
                        >
                          🫧 {bubbleCards[cardId]?.name || cardId}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-pink-100">
                <button
                  onClick={() => setIsStatsModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#E02171] text-white text-xs font-black shadow-md cursor-pointer hover:bg-pink-600 transition"
                >
                  Close Stats
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌸 INTERACTIVE "MY FRILL PREFERENCES" MODAL */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        savedPreferences={profileData?.preferences}
        onSave={handleSavePreferences}
      />

      {/* 🎀 PROFILE AVATAR PICKER MODAL */}
      <ProfileAvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        currentAvatarId={selectedAvatarId}
        userStats={userStats}
        onSelectAvatar={handleSelectAvatar}
        onCustomUpload={handleCustomUpload}
      />

      {/* 🔔 NOTIFICATIONS SETTINGS MODAL */}
      <NotificationSettingsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        savedSettings={profileData?.notificationPreferences}
        onSave={handleSaveNotifications}
      />

      {/* ⚙️ ACCOUNT & PRIVACY MODAL */}
      <AccountPrivacyModal
        isOpen={isAccountPrivacyOpen}
        onClose={() => setIsAccountPrivacyOpen(false)}
        userData={{
          displayName,
          fullName: profileData?.fullName,
          email: currentUser?.email,
          phone: profileData?.phone,
          birthdayMonth: profileData?.birthdayMonth,
        }}
        onUpdateAccount={handleSaveAccountInfo}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Profile;