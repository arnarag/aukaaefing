import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: { 50: "#eefbf3", 100: "#d8f5e2", 500: "#19a65b", 600: "#0b8847", 700: "#086c3a", 950: "#073622" },
        sun: "#f6c945",
        ink: "#13271c"
      },
      boxShadow: { card: "0 12px 30px rgba(7,54,34,.09)" }
    },
  },
  plugins: [],
} satisfies Config;
