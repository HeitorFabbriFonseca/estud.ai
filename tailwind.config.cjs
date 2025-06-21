/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgb(226 232 240)",
        input: "rgb(226 232 240)",
        ring: "rgb(20 20 20)",
        background: "rgb(255 255 255)",
        foreground: "rgb(20 20 20)",
        primary: {
          DEFAULT: "#2F70C1",
          50: "#EBF2FA",
          100: "#D7E5F5",
          200: "#B0CBEB",
          300: "#88B2E1",
          400: "#6198D7",
          500: "#2F70C1",
          600: "#265A9B",
          700: "#1D4374",
          800: "#142D4E",
          900: "#0B1627"
        },
        secondary: {
          DEFAULT: "rgb(241 245 249)",
          foreground: "rgb(20 20 20)",
        },
        destructive: {
          DEFAULT: "rgb(239 68 68)",
          foreground: "rgb(255 255 255)",
        },
        muted: {
          DEFAULT: "rgb(241 245 249)",
          foreground: "rgb(100 116 139)",
        },
        accent: {
          DEFAULT: "rgb(241 245 249)",
          foreground: "rgb(20 20 20)",
        },
        popover: {
          DEFAULT: "rgb(255 255 255)",
          foreground: "rgb(20 20 20)",
        },
        card: {
          DEFAULT: "rgb(255 255 255)",
          foreground: "rgb(20 20 20)",
        },
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A"
        }
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 