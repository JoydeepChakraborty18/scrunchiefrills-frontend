/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        scrunchiePink: "#FF4F9A",
        scrunchieYellow: "#FFD84D",
        scrunchiePurple: "#7B61FF",
        softCream: "#FFF6E9",
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        handwritten: ["'Pacifico'", "cursive"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
      },
    },
  },
  plugins: [],
};