import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0E17",
        panel: "#121826",
        panel2: "#1A2233",
        line: "#2A3448",
        ink: "#E7ECF3",
        dim: "#8B96AC",
        signal: "#4CF2C0",
        pulse: "#7C6CF6",
        flare: "#FFB454",
        danger: "#FF6B6B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        "circuit-fade":
          "radial-gradient(60% 60% at 80% 10%, rgba(124,108,246,0.16) 0%, rgba(10,14,23,0) 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
