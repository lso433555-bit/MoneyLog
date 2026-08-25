import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Tailwind 기본 팔레트에 없는 카테고리 색상만 추가 (나머지는 기본 팔레트 그대로 사용)
        coral: {
          50: "#FFF3F0",
          100: "#FFE1DA",
          200: "#FFC7BA",
          300: "#FFA792",
          400: "#FF8266",
          500: "#F9633F",
          600: "#E14A26",
          700: "#BA3A1C",
          800: "#8F2E19",
          900: "#6E2717",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
