/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Kita akan pakai font Inter agar terlihat lebih profesional
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["corporate", "business"], // Corporate untuk light mode, Business untuk dark mode
    darkTheme: "business",
  },
}