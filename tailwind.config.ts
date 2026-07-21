/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F7F4ED",
          50: "#FCFAF5",
          100: "#F7F4ED",
          200: "#EFEADB",
          300: "#E5DEC7",
        },
        ink: {
          DEFAULT: "#0E0E0C",
          900: "#0E0E0C",
          800: "#1A1A17",
          700: "#2A2A26",
          600: "#403F38",
          500: "#6B6960",
        },
        lime: {
          accent: "#D4FF3F",
        },
        terracotta: {
          DEFAULT: "#E2724B",
          dark: "#C25C36",
        },
        sand: "#EDE6D6",
        night: {
          DEFAULT: "#0a0a0a",
          900: "#0a0a0a",
          800: "#0e0e0e",
          700: "#141414",
          600: "#1c1c1c",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.18em',
      },
    },
  },
  plugins: [],
}