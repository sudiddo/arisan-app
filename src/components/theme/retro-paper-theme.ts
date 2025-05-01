import { createTheme } from "@radix-ui/themes";

export const retroPaperTheme = createTheme({
  colors: {
    primary: "hsl(35, 80%, 50%)", // Vintage orange
    secondary: "hsl(160, 50%, 40%)", // Retro teal
    background: "hsl(45, 30%, 95%)", // Aged paper
    text: "hsl(0, 0%, 20%)", // Ink-like
  },
  fonts: {
    heading: '"Courier New", monospace',
    body: '"American Typewriter", serif',
  },
  radii: {
    small: "4px",
    medium: "8px",
    large: "12px",
  },
});
