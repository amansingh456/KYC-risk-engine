/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        bar: "bar 1s infinite ease-in-out",
        wave: "wave 1.2s infinite",
        vox: "vox 800ms infinite ease-in-out",
      },
      keyframes: {
        bar: {
          "0%, 100%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(1.5)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(1)", opacity: "0.8" },
          "50%": { transform: "scaleY(2)", opacity: "1" },
        },

        vox: {
          "0%, 100%": { transform: "scaleY(1)", opacity: "0.5" },
          "50%": { transform: "scaleY(1.5)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
