import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
          text: "var(--accent-text)",
          light: "var(--accent-light)",
        },
        eira: {
          yellow: {
            DEFAULT: "var(--accent)",
            hover: "var(--accent-hover)",
            active: "var(--accent-active)",
            light: "var(--accent-light)",
            contrast: "var(--accent-text)",
          },
          black: {
            DEFAULT: "#0A0A0A",
            soft: "#18181B",
            muted: "#27272A",
          },
          gray: {
            50: "#FAFAFA",
            100: "#F4F4F5",
            200: "#E4E4E7",
            400: "#A1A1AA",
            500: "#71717A",
            700: "#3F3F46",
          },
        },
      },
      borderRadius: {
        box: "var(--radius-box)",
        btn: "var(--radius-btn)",
      },
      fontFamily: {
        sans: ["var(--font-main)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-main)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 10, 10, 0.05)",
        hover: "0 4px 12px rgba(10, 10, 10, 0.08)",
        modal: "0 12px 32px -4px rgba(10, 10, 10, 0.14)",
        hard: "3px 3px 0px #0A0A0A",
      },
    },
  },
  plugins: [],
};

export default config;
