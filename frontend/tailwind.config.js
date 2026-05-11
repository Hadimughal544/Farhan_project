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
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        lift: "0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out forwards",
        "slide-up": "slide-up 0.35s ease-out forwards",
      },
    },
  },
  plugins: [],
};
