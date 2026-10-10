import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { syncUserProgression } from "../utils/progressionEngine";

const questions = [
  {
    id: 1,
    question: "It’s 10 AM on a Saturday. Where are you?",
    options: [
      { id: "A", image: "/quiz_vibe_cards/Catcafe.png", type: "cutesy" },
      { id: "B", image: "/quiz_vibe_cards/Gym.png", type: "main" },
      { id: "C", image: "/quiz_vibe_cards/lazy.png", type: "chill" },
      { id: "D", image: "/quiz_vibe_cards/trendsetter.png", type: "trend" }
    ]
  },
  {
    id: 2,
    question: "Pick your Zippy K-Pop / Anime Aesthetic:",
    options: [
      { id: "A", image: "/quiz_vibe_cards/NewJeans.png", type: "cutesy" },
      { id: "B", image: "/quiz_vibe_cards/SailorMoon.png", type: "main" },
      { id: "C", image: "/quiz_vibe_cards/StudioGhibli.png", type: "chill" },
      { id: "D", image: "/quiz_vibe_cards/BlackPink.png", type: "trend" }
    ]
  },
  {
    id: 3,
    question: "What's the Slick snack of choice?",
    options: [
      { id: "A", image: "/quiz_vibe_cards/donut.png", type: "cutesy" },
      { id: "B", image: "/quiz_vibe_cards/sourstrip.png", type: "main" },
      { id: "C", image: "/quiz_vibe_cards/fruitbowl.png", type: "chill" },
      { id: "D", image: "/quiz_vibe_cards/matcha.png", type: "trend" }
    ]
  },
  {
    id: 4,
    question: "Your Snazzy Emoji Personality is...",
    options: [
      { id: "A", image: "/quiz_vibe_cards/Girly.png", type: "cutesy" },
      { id: "B", image: "/quiz_vibe_cards/Fast.png", type: "main" },
      { id: "C", image: "/quiz_vibe_cards/space.png", type: "chill" },
      { id: "D", image: "/quiz_vibe_cards/lady.png", type: "trend" }
    ]
  }
];

const PERSONA_NAMES = {
  cutesy: "The Soft Girlie",
  main: "The Main Character",
  chill: "The Cosmic Dreamer",
  trend: "The Downtown Muse"
};

const resultsData = {
  cutesy: {
    cardImage: "/quiz_results/TheSoftGirlieQuizResultCard.jpeg",
    fallbackCardImage: "/quiz_results/TheSoftGirlie.png",
    buttons: [
      {
        src: "/quiz_results/SoftGirlieScrunchies/LiquidHeartsButton.png",
        targetId: "SFS-STN-CLD-LH-001", // ✅ Links to Liquid Hearts Product Listing
      },
      {
        src: "/quiz_results/SoftGirlieScrunchies/PetalCrushButton.png",
        targetId: "SFS-STN-CLD-PC-004", // ✅ Links to Petal Crush Product Listing
      },
      {
        src: "/quiz_results/SoftGirlieScrunchies/PinkCamoButton.png",
        targetId: "SFS-STN-CLD-PKC-009", // ✅ Links to Pink Camo Product Listing
      },
      {
        src: "/quiz_results/SoftGirlieScrunchies/PinkSoftieButton.png",
        targetId: "SFS-STN-CLD-PKS-014", // ✅ Links to Pink Softie Product Listing
      },
    ],
  },
  main: {
    cardImage: "/quiz_results/TheMainCharacterQuizResultCard.jpeg",
    fallbackCardImage: "/quiz_results/TheMainCharacter.png",
    buttons: [
      {
        src: "/quiz_results/MainCharacterScrunchies/ComicPopButton.png",
        targetId: "SFS-STN-CLD-CP-007", // ✅ Links to Comic Pop Product Listing
      },
      {
        src: "/quiz_results/MainCharacterScrunchies/GoBananasButton.png",
        targetId: "SFS-STN-CLD-GOB-013", // ✅ Links to Go Bananas Product Listing
      },
      {
        src: "/quiz_results/MainCharacterScrunchies/OrangeRideButton.png",
        targetId: "SFS-STN-CLD-OR-008", // ✅ Links to Orange Ride Product Listing
      },
      {
        src: "/quiz_results/MainCharacterScrunchies/PinkierCamoButton.png",
        targetId: null, // 🛍️ Unlisted: Redirects directly to /shop
      },
    ],
  },
  chill: {
    cardImage: "/quiz_results/TheCosmicDreamerQuizResultCard.jpeg",
    fallbackCardImage: "/quiz_results/TheCosmicDreamer.png",
    buttons: [
      {
        src: "/quiz_results/CosmicDreamerScrunchies/ComicPopButton.png",
        targetId: "SFS-STN-CLD-CP-007", // ✅ Links to Comic Pop Product Listing
      },
      {
        src: "/quiz_results/CosmicDreamerScrunchies/GoBananasButton.png",
        targetId: "SFS-STN-CLD-GOB-013", // ✅ Links to Go Bananas Product Listing
      },
      {
        src: "/quiz_results/CosmicDreamerScrunchies/UFOButton.png",
        targetId: "SFS-STN-CLD-UFO-011", // ✅ Links to UFO Product Listing
      },
      {
        src: "/quiz_results/CosmicDreamerScrunchies/LadybugButton.png",
        targetId: "SFS-STN-CLD-LB-003", // ✅ Links to Ladybug Product Listing
      },
    ],
  },
  trend: {
    cardImage: "/quiz_results/TheDowntownMuseQuizResultCard.jpeg",
    fallbackCardImage: "/quiz_results/TheDowntownMuse.png",
    buttons: [
      {
        src: "/quiz_results/DowntownMuseScrunchies/BrowniePinkCamoButton.png",
        targetId: "SFS-STN-CLD-BRPKC-012", // ✅ Links to Brownie Pink Camo Product Listing
      },
      {
        src: "/quiz_results/DowntownMuseScrunchies/ChampagneSkyButton.png",
        targetId: "SFS-STN-CLD-CS-010", // ✅ Links to Champagne Sky Product Listing
      },
      {
        src: "/quiz_results/DowntownMuseScrunchies/LiquidHeartsButton.png",
        targetId: "SFS-STN-CLD-LH-001", // ✅ Links to Liquid Hearts Product Listing
      },
      {
        src: "/quiz_results/DowntownMuseScrunchies/PinkParfaitButton.png",
        targetId: "SFS-STN-CLD-PP-006", // ✅ Links to Pink Parfait Product Listing
      },
    ],
  },
};

function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [resultKey, setResultKey] = useState(() => localStorage.getItem("sf_quiz_result_key") || null);
  const [showResult, setShowResult] = useState(() => Boolean(localStorage.getItem("sf_quiz_result_key")));
  const [startQuiz, setStartQuiz] = useState(() => Boolean(localStorage.getItem("sf_quiz_result_key")));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (location.hash === "#quiz" || location.state?.scrollToQuiz) {
      setTimeout(() => {
        const quizElement = document.getElementById("quiz");
        if (quizElement) {
          quizElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  }, [location]);

  const handleAnswer = (type) => {
    const updatedAnswers = [...answers, type];
    setAnswers(updatedAnswers);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = async (completedAnswers) => {
    const count = { cutesy: 0, main: 0, chill: 0, trend: 0 };
    completedAnswers.forEach((ans) => count[ans]++);

    const maxCount = Math.max(...Object.values(count));
    const tiedTypes = Object.keys(count).filter((t) => count[t] === maxCount);

    let finalType = tiedTypes[0];
    for (let i = completedAnswers.length - 1; i >= 0; i--) {
      if (tiedTypes.includes(completedAnswers[i])) {
        finalType = completedAnswers[i];
        break;
      }
    }

    setResultKey(finalType);
    setShowResult(false); // 💖 Keeps "Claim My Vibe" visible first until clicked
    setStartQuiz(true);

    const personaName = PERSONA_NAMES[finalType];
    localStorage.setItem("sf_quiz_result_key", finalType);
    localStorage.setItem("sf_quiz_persona", personaName);

    // 🎀 Connect Quiz to the Central Progression Engine
    if (currentUser?.uid) {
      try {
        await syncUserProgression(currentUser.uid, "QUIZ_COMPLETED", {
          persona: personaName,
          personaId: finalType,
        });
      } catch (err) {
        console.warn("Could not sync persona to progression engine:", err);
      }
    }
  };

  const restartQuiz = () => {
    localStorage.removeItem("sf_quiz_result_key");
    setStep(0);
    setAnswers([]);
    setResultKey(null);
    setShowResult(false);
    setStartQuiz(true);
  };

  const currentResult = resultKey ? resultsData[resultKey] : null;

  return (
    <section
      id="quiz"
      className="w-full min-h-[600px] md:h-[750px] py-12 md:py-16 flex items-center justify-center overflow-hidden scroll-mt-20"
      style={{
        backgroundImage: "url('/images/SFQuizBG.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-[1400px] h-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-8">
        {!startQuiz ? (
          <div className="relative flex flex-col items-center">
            <img
              src="/images/SFQuizMain.png"
              alt="Quiz Intro"
              className="rounded-2xl w-full max-w-[90vw] sm:max-w-[500px] md:w-[650px] object-contain"
              style={{
                boxShadow: "0 0 25px #E02171, 0 20px 50px rgba(224,33,113,0.5)",
              }}
            />

            <div className="absolute left-1/2 bottom-4 sm:bottom-6 md:top-[75%] md:bottom-auto -translate-x-1/2 w-max">
              <div className="relative p-[2px] rounded-full overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,#E02171,#FF9EC9,#E02171)] bg-[length:220%_220%] animate-[gradientMove_6s_linear_infinite]" />

                <button
                  onClick={() => setStartQuiz(true)}
                  className="relative z-10 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-black uppercase tracking-wider bg-pink-500 text-white rounded-full shadow-[0_0_25px_#E02171] hover:bg-[#c71761] transition active:scale-95 cursor-pointer"
                >
                  Find my Scrunchie! 💖
                </button>
              </div>
            </div>
          </div>
        ) : !resultKey ? (
          <div className="w-full max-w-5xl">
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm font-black uppercase tracking-widest text-gray-700 text-center">
              Question {step + 1} / {questions.length}
            </div>

            <div className="flex justify-center mb-6 sm:mb-10 px-2">
              <div className="px-5 sm:px-10 py-3 sm:py-5 rounded-2xl sm:rounded-full text-base sm:text-xl md:text-2xl font-bold text-[#E02171] bg-pink-200/40 backdrop-blur-sm shadow-[0_0_25px_rgba(224,33,113,0.6)] text-center">
                {questions[step].question}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 md:gap-10 w-full">
              {questions[step].options.map((opt, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(opt.type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.currentTarget.style.setProperty("--x", `${x}px`);
                    e.currentTarget.style.setProperty("--y", `${y}px`);
                  }}
                  className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden group border-2 border-pink-200/50 shadow-md cursor-pointer"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                    <div
                      className="absolute w-32 sm:w-40 h-32 sm:h-40 bg-pink-400/30 blur-2xl rounded-full"
                      style={{
                        left: "var(--x)",
                        top: "var(--y)",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>

                  <img
                    src={opt.image}
                    alt=""
                    className="w-full h-36 sm:h-48 md:h-64 object-cover rounded-xl sm:rounded-2xl"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {!showResult ? (
              /* ✨ CLAIM MY VIBE INTERMEDIATE BUTTON */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative p-[2px] rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full bg-[linear-gradient(120deg,#E02171,#FF9EC9,#E02171)] bg-[length:220%_220%] animate-[gradientMove_5s_linear_infinite]" />

                <motion.button
                  onClick={() => setShowResult(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-lg font-black uppercase tracking-wider bg-pink-500 text-white rounded-full overflow-hidden shadow-[0_0_20px_#E02171] cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <span className="absolute top-0 left-[-80%] h-full w-[40%] bg-white/25 blur-md skew-x-[-20deg] animate-[shimmer_2.8s_linear_infinite]" />
                  </span>
                  <span className="relative z-10">Claim My Vibe 💖</span>
                </motion.button>
              </motion.div>
            ) : (
              /* 🎴 RESULT CARD WITH INTERACTIVE MATCH BUTTONS */
              <div className="flex flex-col items-center gap-4 px-4 w-full">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full max-w-[85vw] sm:max-w-[340px] md:max-w-[390px] aspect-[820/1045] rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center bg-pink-50"
                >
                  <img
                    src={currentResult?.cardImage}
                    onError={(e) => {
                      if (currentResult?.fallbackCardImage && e.currentTarget.src !== currentResult.fallbackCardImage) {
                        e.currentTarget.src = currentResult.fallbackCardImage;
                      }
                    }}
                    alt="Result Card"
                    className="w-full h-full object-contain block select-none pointer-events-none"
                  />

                  {/* 🎀 YOUR SNAZZY SCRUNCHIE MATCHES CONTAINER */}
                  <div className="absolute top-[76%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68%] flex flex-wrap justify-center items-center gap-x-1.5 sm:gap-x-2 gap-y-1 sm:gap-y-1.5 z-20">
                    {currentResult?.buttons.map((btn, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => {
                          if (btn.targetId) {
                            navigate(`/product/${btn.targetId}`);
                          } else {
                            navigate("/shop");
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-[44%] max-w-[96px] sm:max-w-[110px] md:max-w-[118px] flex items-center justify-center cursor-pointer drop-shadow-sm focus:outline-none"
                      >
                        <img
                          src={btn.src}
                          alt="Scrunchie Match"
                          className="w-full h-auto object-contain pointer-events-none"
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <button
                  onClick={restartQuiz}
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800 hover:text-[#E02171] underline cursor-pointer mt-2"
                >
                  Retake Quiz 🔄
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Quiz;