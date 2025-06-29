import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
import flowbite from "flowbite-react/tailwind";
/**@ts-ignore */
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        "synergy-light-blue": "#0CC0DF",
        "synergy-light-grey": "#EFEFEF",
        "synergy-dark-grey": "#333333",
      },
      screens: {
        xs: "520px",
      },
      backgroundImage: {
        "glow-conic":
          "conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)",
        "aurora-gradient":
          "linear-gradient(270deg, #ff9a9e, #fad0c4, #a1c4fd, #c2e9fb)",
      },
      backgroundSize: {
        aurora: "400% 400%",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
        "playfair-display": ["Playfair Display", "serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        "2xl": ["1.5rem", { lineHeight: "1.415", letterSpacing: "-0.037em" }],
        "3xl": [
          "1.875rem",
          { lineHeight: "1.3333", letterSpacing: "-0.037em" },
        ],
        "4xl": ["2.25rem", { lineHeight: "1.2777", letterSpacing: "-0.037em" }],
        "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.037em" }],
        "6xl": ["4rem", { lineHeight: "1", letterSpacing: "-0.037em" }],
        "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.037em" }],
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        shine: "shine var(--duration) infinite linear",
        aurora: "aurora 8s ease-in-out infinite alternate",
      },
      keyframes: {
        "code-1": {
          "0%": { opacity: 0 },
          "2.5%": { opacity: 1 },
          "97.5%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "code-2": {
          "16.2%": { opacity: 0 },
          "18.75%": { opacity: 1 },
          "97.5%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "code-3": {
          "32.5%": { opacity: 0 },
          "35%": { opacity: 1 },
          "97.5%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "code-4": {
          "48.75%": { opacity: 0 },
          "51.25%": { opacity: 1 },
          "97.5%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "code-5": {
          "65%": { opacity: 0 },
          "72.5%": { opacity: 1 },
          "97.5%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "code-6": {
          "81.25%": { opacity: 0 },
          "83.75%": { opacity: 1 },
          "97.5%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        breath: {
          "0%, 100%": { transform: "scale(0.95)" },
          "50%": { transform: "scale(1.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5%)" },
        },
        line: {
          "0%, 100%": { left: 0, opacity: 0 },
          "50%": { left: "100%", transform: "translateX(-100%)" },
          "10%, 40%, 60%, 90%": { opacity: 0 },
          "25%, 75%": { opacity: 1 },
        },
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        shine: {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
        aurora: {
          "0%": {
            backgroundPosition: "0% 50%",
            transform: "rotate(-5deg) scale(0.9)",
          },
          "25%": {
            backgroundPosition: "50% 100%",
            transform: "rotate(5deg) scale(1.1)",
          },
          "50%": {
            backgroundPosition: "100% 50%",
            transform: "rotate(-3deg) scale(0.95)",
          },
          "75%": {
            backgroundPosition: "50% 0%",
            transform: "rotate(3deg) scale(1.05)",
          },
          "100%": {
            backgroundPosition: "0% 50%",
            transform: "rotate(-5deg) scale(0.9)",
          },
        },
      },
    },
  },
  content: [flowbite.content()],
  plugins: [
    addVariablesForColors,
    flowbite.plugin(),
    require("flowbite-typography"),
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default config;
