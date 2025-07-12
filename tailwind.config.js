/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#E31B1B',
        'phenom-black': '#000000',
        'phenom-gray': '#888888',
        'cream-white': '#F8F5F1',
        'phenom-dark': '#1F2937',
      },
      fontFamily: {
        'spartan': ['League Spartan', 'Montserrat', 'Oswald', 'Arial Black', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
