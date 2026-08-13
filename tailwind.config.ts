import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        caddy: {
          orange: "#FF7A1A",
          "orange-dark": "#E4650A",
          "orange-light": "#FFE9D9",
          cream: "#FFFBF8",
          ink: "#20180F",
          gray: "#8A8078",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 12px rgba(32, 24, 15, 0.06)",
        floating: "0 8px 30px rgba(228, 101, 10, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
