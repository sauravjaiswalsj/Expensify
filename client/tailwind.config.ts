import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        dark: {
          bg: "#0b1120",
          surface: "#111827",
          elevated: "#151d2e",
          card: "#1a2332",
          hover: "#1e293b",
          border: "#1e293b",
          "border-secondary": "#2a3a4e",
          "border-accent": "#334155",
        },
        accent: {
          cyan: "#22d3ee",
          teal: "#14b8a6",
          blue: "#3b82f6",
          green: "#22c55e",
          emerald: "#10b981",
          red: "#ef4444",
          coral: "#f97066",
          amber: "#f59e0b",
          violet: "#8b5cf6",
          pink: "#ec4899",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
        shimmer: "shimmer 2s infinite",
        "pulse-glow": "pulse-glow 2s infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34, 211, 238, 0.15)" },
          "50%": { boxShadow: "0 0 0 8px rgba(34, 211, 238, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
