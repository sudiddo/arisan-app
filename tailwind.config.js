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
        sans: ["var(--font-crimson)", "serif"],
        serif: ["var(--font-crimson)", "serif"],
        mono: ["var(--font-courier)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(35, 80%, 50%)",
          foreground: "hsl(0, 0%, 20%)",
        },
        secondary: {
          DEFAULT: "hsl(160, 50%, 40%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(45, 30%, 90%)",
          foreground: "hsl(0, 0%, 30%)",
        },
        accent: {
          DEFAULT: "hsl(35, 80%, 90%)",
          foreground: "hsl(35, 80%, 30%)",
        },
        popover: {
          DEFAULT: "hsl(45, 30%, 95%)",
          foreground: "hsl(0, 0%, 20%)",
        },
        card: {
          DEFAULT: "hsl(45, 30%, 95%)",
          foreground: "hsl(0, 0%, 20%)",
        },
        paper: "hsl(45, 30%, 95%)",
        ink: "hsl(0, 0%, 20%)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        retro: "6px 6px 0 hsl(0, 0%, 20%)",
      },
    },
  },
  plugins: [animate],
};
