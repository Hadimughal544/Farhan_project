/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#dceefe",
          200: "#bfdefd",
          300: "#93c8fb",
          400: "#61adf7",
          500: "#3a90f1",
          600: "#2573de",
          700: "#205dbf",
          800: "#224f9b",
          900: "#21447e"
        }
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(14, 42, 71, 0.12)",
      }
    },
  },
  plugins: [],
};
