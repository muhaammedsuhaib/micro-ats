/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0F1115",
          900: "#14161C",
          800: "#1D2027",
          700: "#2A2E38",
          600: "#3D414D",
          500: "#5B6072",
          400: "#868C9E",
          300: "#B4B9C6",
          200: "#D8DBE3",
          100: "#EEF0F4",
          50: "#F7F8FA",
        },
        accent: {
          600: "#4338CA",
          500: "#4F46E5",
          400: "#6366F1",
          100: "#E0E1FA",
        },
        signal: {
          applied: "#5B6072",
          technical: "#B45309",
          "technical-bg": "#FEF3C7",
          offered: "#047857",
          "offered-bg": "#D1FAE5",
          rejected: "#B91C1C",
          "rejected-bg": "#FEE2E2",
          conflict: "#DC2626",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15,17,21,0.04), 0 8px 24px -12px rgba(15,17,21,0.12)",
      },
    },
  },
  plugins: [],
};
