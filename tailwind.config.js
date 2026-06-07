/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter Tight", "sans-serif"],
        number: ["IBM Plex Sans", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#3B5BDB",
          hover: "#2F4FC7",
        },
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        accentBrown: {
          DEFAULT: "var(--accent-brown)",
          hover: "var(--accent-brown-hover)",
        },
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
