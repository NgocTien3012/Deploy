import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import lineClamp from "@tailwindcss/line-clamp";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        spline: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        "accent-blue": "#33B1FA",
        navy: "#003366",
      },
    },
  },
  plugins: [forms, lineClamp],
};

export default config;