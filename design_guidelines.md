# SNES Retro Gaming Website - Design Guidelines

## Design Approach
**Reference-Based Approach**: Inspired by 1990s Super Nintendo console aesthetic and retro gaming websites like Internet Archive's game collections, blended with modern usability standards.

## Core Design Principles
1. **Nostalgic Authenticity**: Evoke 90s gaming culture without sacrificing usability
2. **Game-First Experience**: Minimize barriers between user and gameplay
3. **Visual Boldness**: Chunky, confident design elements that reference classic console UI
4. **Immediate Clarity**: Users should instantly understand this is SNES-focused

---

## Typography System

**Primary Font**: Press Start 2P (Google Fonts) for headers and game titles - authentic pixel aesthetic
**Secondary Font**: Inter or Roboto for body text and smaller UI elements - ensures readability

**Hierarchy**:
- Page Title (H1): Press Start 2P, text-4xl to text-6xl - should feel like console boot screen
- Section Headers: Press Start 2P, text-2xl to text-3xl
- Game Titles: Press Start 2P, text-lg to text-xl
- Body/UI Text: Sans-serif, text-sm to text-base - pixel fonts become unreadable at small sizes
- Button Text: Press Start 2P, text-sm for primary actions

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** (e.g., p-4, gap-8, mt-16)

**Index Page Structure**:

1. **Header Section** (h-24 to h-32):
   - Logo/title centered or left-aligned
   - Tagline beneath: "Classic SNES Games in Your Browser"
   - Fixed positioning with backdrop blur effect

2. **Hero Area** (py-12 to py-20):
   - Bold centered title: "SUPER NINTENDO CLOUD"
   - Subtitle explaining the experience
   - No traditional hero image - lean into typographic impact
   - Retro scan-line effect overlay (CSS pattern)

3. **Game Grid** (py-16):
   - Container: max-w-7xl mx-auto px-4
   - Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`
   - 4 games prominently displayed with equal visual weight
   - Each game card should be interactive with hover states

4. **Footer** (py-8):
   - Emulator credits
   - Link to Archive.org attribution
   - Simple centered layout

**Play Page Structure**:
- Full viewport emulator (w-full h-screen)
- "BACK TO MENU" button absolutely positioned top-left or top-center
- No distractions, pure black background
- Button should use glass-morphism effect for visibility over game content

---

## Component Library

### Game Cards
- **Aspect Ratio**: 3:4 (portrait SNES box art ratio)
- **Structure**:
  - Cover image container with overflow hidden and subtle border
  - Title overlaid at bottom with semi-transparent background
  - Hover state: Scale transform (scale-105), shadow elevation
- **Spacing**: p-0 for image, p-4 for title area
- **Borders**: border-4 with retro chunky style

### Navigation Button ("BACK TO MENU")
- **Size**: px-8 py-3 with text-sm
- **Style**: Pill-shaped (rounded-full) or retro rectangular (rounded-lg)
- **Background**: Backdrop blur (backdrop-blur-md bg-opacity-90)
- **Position**: fixed top-4 left-1/2 -translate-x-1/2 (centered) or top-4 left-4
- **Z-index**: z-50 to stay above emulator

### Header/Title Treatment
- **Container**: Bordered box with retro thick borders (border-8)
- **Inner spacing**: px-8 py-4
- **Shadow**: Multiple layered shadows for depth (90s GUI effect)
- **Text transform**: Uppercase for emphasis

---

## Visual Effects & Patterns

**Retro Elements** (use sparingly):
- CSS scan-line overlay on hero (subtle repeating gradient)
- Pixel-style borders using box-shadow stacking
- CRT screen curve effect on game cards (very subtle border-radius with inset shadow)

**Transitions**:
- Cards: `transition-transform duration-200`
- Buttons: `transition-all duration-150`
- No elaborate animations - keep it snappy like 90s hardware

**Background Treatments**:
- Index page: Gradient or subtle geometric pattern
- Game grid background: Slightly darker than main background for depth
- Play page: Solid black (#000000)

---

## Accessibility & Interaction

- All game cards are clickable/tappable with clear focus states
- Keyboard navigation: Tab through games, Enter to play
- Focus rings visible with retro aesthetic (thick, solid borders)
- Back button large enough for easy touch on mobile (min 44x44px)

---

## Responsive Behavior

**Mobile** (< 768px):
- Single column game grid
- Header title text-3xl
- Larger touch targets on game cards (min h-64)
- Back button positioned top-left for thumb reach

**Tablet** (768px - 1024px):
- 2-column game grid
- Header text-4xl

**Desktop** (> 1024px):
- 4-column game grid showcasing all games without scrolling
- Header text-6xl with dramatic presence

---

## Images

**Game Cover Art**: 
- Display official Wikipedia/archive.org box art for each of the 4 games
- Images should fill card containers completely (object-cover)
- Placement: Within game card components in the grid

**No hero image required** - this design leans on bold typography and the game cards themselves as the visual focus