import type { Config } from "tailwindcss";

// Design tokens for ExecFlow AI.
// The brief calls for a "professional executive-style" interface, clean
// rather than flashy, with no unnecessary animation — so the palette stays
// restrained (cool neutrals + one deep navy accent) and the one place we
// spend visual "signal" is priority/status color, since that's real data
// the user needs to scan quickly (not decoration).
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#161A23",        // primary text
        canvas: "#F5F6F8",     // app background
        surface: "#FFFFFF",    // cards / panels
        border: "#E2E4EA",
        muted: "#6B7280",
        accent: {
          DEFAULT: "#1F3A5F",  // deep navy - primary actions, links
          hover: "#16293F",
        },
        priority: {
          low: "#6B7280",
          medium: "#2B6CB0",
          high: "#C2751B",
          urgent: "#B42318",
        },
        status: {
          pending: "#6B7280",
          progress: "#2B6CB0",
          completed: "#1B8A5A",
          overdue: "#B42318",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
