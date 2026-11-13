import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/domains/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fingrow: {
          ivory: "#F7F6F1",
          emerald: "#0B6B4B",
          darkEmerald: "#084F38",
          lime: "#7CE000",
          midnight: "#07101A",
          coral: "#FF6B4A",
          tangerine: "#FF9F1C",
          yellow: "#FFD166",
          softMint: "#D8F3DC",
          mutedSage: "#84A98C",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        editorial: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      boxShadow: {
        finCard: "0 10px 30px -10px rgba(7, 16, 26, 0.07), 0 2px 6px -2px rgba(7, 16, 26, 0.04)",
        finElevated: "0 20px 40px -15px rgba(11, 107, 75, 0.12), 0 0 1px 1px rgba(7, 16, 26, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;

