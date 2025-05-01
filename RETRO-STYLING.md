# ArisanKu Retro Styling Guide

This document outlines the retro 70s/80s Indonesian "Arisan" styling implemented in the application.

## 🎨 Theme Overview

The application uses a nostalgic retro aesthetic with:

- Vintage colors (orange, green, aged paper)
- Comic book style shadows
- Playful animations and micro-interactions
- Bahasa Indonesia copywriting

## 🧩 Components & Classes

### Colors

- `primary` (#FF7A45): Vintage orange
- `secondary` (#4CAF50): Retro green
- `paper` (#FFF5E6): Aged paper background
- `stamp` (#E91E63): Rubber stamp pink

### Typography

- Headings: "Press Start 2P" (pixel font)
- Body: "Courier Prime" (typewriter style)

### Animations

- `.stamp`: Rubber stamp effect
- `.animate-bounce`: Bouncing effect
- `.animate-confetti`: Confetti celebration

### Component Classes

- `.retro-card`: Card with comic book shadow
- `.sticker`: Rotated sticker style badge
- `.retro-divider`: Hand-drawn divider
- `.retro-input`: Styled form inputs
- `.retro-table`: Styled tables
- `.retro-badge`: Badge with rotation

## 📝 UX Writing Guidelines

1. Use playful Bahasa Indonesia mixed with English:

   - "Bikin Arisan Baru" instead of "Create Group"
   - "Iuran Bulanan" instead of "Monthly Contribution"

2. Keep sentences short and energetic:

   - "Ngumpul bareng, nabung bareng, dapat giliran bareng!" 🎉

3. Use retro emoticons: ✨🎉💸

4. Indonesian-friendly interfaces:
   - "Sudah Bayar" instead of "Mark as Paid"
   - "Peraturan Arisan" instead of "Group Rules"

## 🖼️ Assets

The following assets are used for the retro styling:

- `/retro-pattern.png`: Background pattern
- `/paper-texture.png`: Paper texture
- `/money-coins.png`: Coin illustrations
- `/retro-piggybank.png`: Piggy bank illustration
- `/squiggle-divider.svg`: Hand-drawn divider

## 🧠 Implementation Details

### Shadow System

- Buttons: 4px offset shadow
- Cards: 8px offset shadow
- Active state: Shadow removed, element translated

### Animation System

- Subtle hover effects on all interactive elements
- Typing effect for hero headings
- Bounce animations for playful elements
- Stamp animation for confirmations

---

Created with ♥ for the ArisanKu app
