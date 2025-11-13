# Couples Game - V1

A romantic card-based web application for couples to play together.

## Features

- **Hero Page**: Elegant candlelit introduction
- **Dice Roll**: Determine starting player
- **Game Play**: Draw cards from personalized decks (A-D) with swap mechanics
- **Black Deck**: Unlocks when a player collects 3 swap cards
- **Local Storage**: Game state persists between sessions

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- React Router

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
/src
  /assets       - Visual assets (textures, SVGs)
  /components   - React components (Candle, Card, CardModal, DeckGrid, Hud)
  /data         - Card data (cards.json)
  /pages        - Page components (Hero, Dice, Game)
  /state        - Zustand store (game state management)
  /styles       - Global CSS styles
```

## Game Rules

1. Roll dice to determine starting player (even = blue/male, odd = red/female)
2. Current player's decks (A-D) are displayed
3. Draw cards from decks - each card has an action to perform
4. Swap cards can be found in any deck - collect 3 to unlock the black deck
5. Black deck contains special cards available to both players
6. Cards never repeat within a session

## Performance

- Animation durations capped (flip: 0.42-0.45s, modal: 0.28-0.32s)
- Assets optimized (<300KB combined)
- CSS gradients used for backgrounds
- `will-change` only on animated elements

## Mobile Support

- Touch-friendly tap targets (≥44px)
- Responsive layout
- Modal scroll lock on mobile
- Portrait-optimized

## Future Enhancements (V3+)

- Supabase authentication
- Custom card creation
- Admin panel
- Multi-session support
- Remote play
