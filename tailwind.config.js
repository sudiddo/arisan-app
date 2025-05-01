/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-press-start)", "var(--font-courier)", "monospace"],
        serif: ["var(--font-crimson)", "serif"],
        mono: ["var(--font-courier)", "monospace"],
        pixel: ["var(--font-press-start)", "cursive"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF7A45", // Vintage orange
          foreground: "#2A2A2A", // Ink
          dark: "#E56935", // Darker orange for hover states
        },
        secondary: {
          DEFAULT: "#4CAF50", // Retro green
          foreground: "#FFF5E6", // Paper
          dark: "#3D8C40", // Darker green for hover states
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F2EAD3", // Light muted paper
          foreground: "#2A2A2A", // Ink
        },
        accent: {
          DEFAULT: "#E91E63", // Stamp pink
          foreground: "#FFF5E6", // Paper
        },
        popover: {
          DEFAULT: "#FFF5E6", // Paper
          foreground: "#2A2A2A", // Ink
        },
        card: {
          DEFAULT: "#FFF5E6", // Paper
          foreground: "#2A2A2A", // Ink
        },
        paper: "#FFF5E6", // Aged paper
        ink: "#2A2A2A", // Typewriter ink
        stamp: "#E91E63", // Rubber stamp pink
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        stamp: {
          "0%": { transform: "scale(3)", opacity: 0 },
          "50%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        shake: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0)", opacity: 0 },
          "10%": { opacity: 1 },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        stamp: "stamp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        bounce: "bounce 2s ease-in-out infinite",
        shake: "shake 1.5s ease-in-out infinite",
        confetti: "confetti 3s ease-in-out forwards",
      },
      boxShadow: {
        retro: "8px 8px 0 #2A2A2A",
        "retro-sm": "4px 4px 0 #2A2A2A",
        "retro-hover": "6px 6px 0 #2A2A2A",
      },
      backgroundImage: {
        "retro-pattern": "url('/retro-pattern.png')",
        "paper-texture": "url('/paper-texture.png')",
      },
    },
  },
  plugins: [animate],
};
