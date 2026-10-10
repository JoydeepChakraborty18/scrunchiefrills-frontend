// src/components/profile/PersonaCard.jsx
import React from "react";
import { RotateCcw } from "lucide-react";
import { QUIZ_PERSONA_ASSETS } from "../../utils/progressionEngine";

const PersonaCard = ({
  personaName = "The Soft Girlie",
  customPersonaImage = null,
  onRetakeQuiz,
}) => {
  const persona =
    QUIZ_PERSONA_ASSETS[personaName] || QUIZ_PERSONA_ASSETS["The Soft Girlie"];
  const displayImage = customPersonaImage || persona.image;

  return (
    <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-pink-100 shadow-sm relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black text-gray-900 tracking-tight uppercase">
          My Frill Persona
        </span>
        <button
          onClick={onRetakeQuiz}
          className="text-[11px] font-bold text-gray-500 hover:text-[#E02171] flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw size={11} /> Retake Quiz
        </button>
      </div>

      {/* Two-Column Middle Section: Floating Persona Sticker + Personality Copy */}
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
          <img
            src={displayImage}
            alt={persona.name}
            className="w-full h-full object-contain filter drop-shadow-md transition-transform hover:scale-105 duration-300"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-[#E02171] font-serif italic tracking-tight leading-tight">
            ✨ {persona.name}
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
            {persona.subtitle}
          </p>
          <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
            {persona.description}
          </p>
        </div>
      </div>

      {/* Trait Pills Tag Bar */}
      <div className="flex flex-wrap justify-between gap-1.5 mt-3 pt-3 border-t border-pink-50">
        {persona.traits?.map((trait, idx) => (
          <span
            key={idx}
            className="px-3 py-0.5 rounded-full bg-pink-50 text-[10px] font-bold text-[#E02171] border border-pink-100/80 shadow-2xs"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PersonaCard;