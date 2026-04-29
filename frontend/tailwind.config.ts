import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch:   "#16a34a",
        ink:     "#0f172a",
        panel:   "#f8fafc",
        line:    "#e2e8f0",
        accent:  "#0ea5e9",
        warning: "#f59e0b",
        sidebar: "#0f172a",
        "sidebar-hover": "#1e293b",
        "sidebar-active": "#1e293b",
        "sidebar-text": "#94a3b8",
        "sidebar-text-active": "#f1f5f9",
      },
      boxShadow: {
        soft:  "0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)",
        card:  "0 4px 24px rgba(15,23,42,0.10)",
        glow:  "0 0 0 3px rgba(14,165,233,0.15)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
