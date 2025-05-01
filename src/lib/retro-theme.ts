export const retroTheme = {
  colors: {
    primary: "#FF7A45", // Vintage orange (like old posters)
    secondary: "#4CAF50", // Retro green
    paper: "#FFF5E6", // Aged paper
    ink: "#2A2A2A", // Typewriter ink
    stamp: "#E91E63", // Rubber stamp pink
  },
  fonts: {
    heading: '"Press Start 2P", cursive', // Retro pixel font
    body: '"Courier Prime", monospace', // Typewriter style
  },
  shadows: {
    card: "8px 8px 0px #2A2A2A", // Comic book style
    button: "4px 4px 0px #2A2A2A",
  },
  animations: {
    bounce: "bounce 0.5s ease-in-out",
    stamp: "stamp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
};

export const retroAnimations = {
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
};
