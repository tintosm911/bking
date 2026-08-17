import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf8e8",
          100: "#f9ecc4",
          200: "#f3d98c",
          300: "#ecc454",
          400: "#e5b126",
          500: "#d49a1a",
          600: "#b07a14",
          700: "#8c5f10",
          800: "#6b4b0d",
          900: "#4d3609",
        },
        dark: {
          50: "#f0f0f0",
          100: "#d1d1d1",
          200: "#a3a3a3",
          300: "#757575",
          400: "#474747",
          500: "#2a2a2a",
          600: "#1f1f1f",
          700: "#151515",
          800: "#0d0d0d",
          900: "#050505",
        },
      },
      fontFamily: {
        serif: ["Noto Serif SC", "serif"],
        sans: ["Inter", "Noto Sans SC", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #d49a1a 0%, #ecc454 50%, #d49a1a 100%)",
        "dark-gradient": "linear-gradient(180deg, #0d0d0d 0%, #151515 50%, #0d0d0d 100%)",
        "hero-gradient": "radial-gradient(ellipse at top, #1a1a1a 0%, #0d0d0d 50%, #050505 100%)",
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 154, 26, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 154, 26, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;