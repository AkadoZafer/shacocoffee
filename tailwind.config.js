/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'shaco-black': '#09090b', // Slightly lighter than pure black for depth
        'shaco-red': '#ef4444', // Bright red accent
        'shaco-dark-red': '#991b1b',
        'shaco-gray': '#27272a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
