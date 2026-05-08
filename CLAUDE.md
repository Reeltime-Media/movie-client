Build a movie streaming homepage for "Reeltime Media" using Next.js 15 (App Router) with Tailwind CSS and TypeScript. Single page, no routing, no backend — pure UI.

# Brand identity

Reeltime is a Cambodia-focused movie streaming platform. The brand is bold, cinematic, geometric, high-contrast. Think Netflix-meets-something-younger. The logo is a white "R" on a saturated red field with "REELTIME" wordmark below in heavy geometric sans.

# Design system tokens

Use these as Tailwind theme extensions in `tailwind.config.ts`:

Colors:
- bg: #0A0A0A (page background, near-black)
- surface: #141414 (cards, modals, hovers)
- surface-elevated: #1F1F1F
- border: #2A2A2A
- border-hover: #3A3A3A
- text: #FAFAFA (primary)
- text-muted: #A3A3A3 (secondary, metadata)
- text-disabled: #525252
- brand: #E50914 (THE red — used surgically, never as background fill)
- brand-hover: #F40612
- brand-pressed: #B81D24
- success: #22C55E (Subscribed badges)
- warning: #F59E0B (star ratings, Expiring soon)
- danger: #EF4444 (errors only — different shade from brand)

Typography:
- Inter font, weights 400/500/600/700/800
- Hero titles: 44px, weight 800, letter-spacing -0.025em, line-height 1.05
- Section headings: 17px, weight 700, letter-spacing -0.01em
- Body: 13-14px, weight 400, line-height 1.6
- Metadata: 12px, weight 500
- Sentence case everywhere except brand wordmark "REELTIME" and small all-caps labels like "FEATURED", "OWNED", "HD"

Geometry:
- Buttons: 6px border-radius (not pill, not square)
- Posters: 4px border-radius
- No gradients on UI chrome (only on poster overlays for text legibility)
- No drop shadows, no glows, no glassmorphism, no neumorphism
- Decisive flat shapes that match the logo's geometric feel

# Page structure

The page is a single dark scrollable page. Build these sections in order:

## 1. Top navigation bar

- Sticky to top, full width, padding 14px 24px
- Bottom border: 1px solid #1F1F1F
- Left side: Reeltime logo lockup
  - Red square (26×26px, background #E50914, border-radius 4px) with white "R" centered, font-weight 800, font-size 17px
  - Next to it: "REELTIME" in white, font-weight 800, font-size 14px, letter-spacing 0.06em
- Nav links to the right of the logo (gap 22px): "Home" (active, white), "Movies", "Series", "My library" (inactive in #A3A3A3). Font-size 12px, weight 500
- Right side: search icon, bell icon (both #A3A3A3, 16px), avatar circle (26×26px, background #2A2A2A, with initial)
- Use lucide-react icons (Search, Bell)

## 2. Hero section (featured movie)

- Full-width, height 340px, position: relative, overflow: hidden
- Background built with SVG: a radial gradient (deep red core fading to near-black) with subtle abstract elements suggesting a movie scene
- Overlays:
  - Bottom gradient: linear-gradient to top, #0A0A0A → transparent (for text legibility)
  - Left-side gradient: linear-gradient to right, rgba(10,10,10,0.75) → transparent at 80%
- Content positioned absolute, padding 50px 32px, max-width 460px:
  - Small "FEATURED" pill: background #E50914, white text, font-size 10px, weight 700, padding 4px 9px, border-radius 3px, letter-spacing 0.12em
  - H1 title "The Last Drive": font-size 44px, weight 800, letter-spacing -0.025em, line-height 1.02, color #FAFAFA
  - Metadata row (color #A3A3A3, font-size 12px, weight 500, gap 10px with #3A3A3A dot separators):
    "2026 · 2h 14m · ⭐ 8.7 · Action · Thriller"
    Star icon should be #F59E0B, lucide Star
  - Description (color #E5E5E5, font-size 13px, line-height 1.6, max-width 420px):
    "A rideshare driver picks up the wrong passenger on a quiet Tuesday. By dawn, half the city is hunting them, and the truth is more dangerous than either of them."
  - Two buttons (gap 10px):
    - Primary "Watch now": background #E50914, white text, font-weight 700, font-size 13px, padding 10px 22px, border-radius 6px, with Play icon (lucide PlayCircle, 15px)
    - Secondary "More info": background rgba(255,255,255,0.12), white text, border 1px solid rgba(255,255,255,0.18), backdrop-blur, with Info icon
    - Hover state on primary: background #F40612
- Bottom-left of hero: 4 progress dots (each 22×3px, border-radius 2px), first one #E50914, others #2A2A2A — represents featured movie carousel position

## 3. "Trending now" rail

- Padding 24px 32px 28px
- Section header row: "Trending now" h2 (font-size 17px, weight 700) on left, "See all >" link in #A3A3A3 on right
- Grid: 4 columns, gap 12px
- 4 cards:

Card 1 — "The Last Drive"
- 2:3 aspect ratio poster
- Background: linear-gradient 155deg, #2a0c10 → #6b1419 → #0f0608
- "HD" badge top-right: background rgba(0,0,0,0.6), white text, font-size 9px, weight 700, padding 3px 6px, border-radius 3px, letter-spacing 0.08em
- Bottom of poster: 28×1px red accent line (#E50914), then title "THE LAST DRIVE" in white, font-size 14px, weight 800, line-height 1, with text-shadow 0 2px 4px rgba(0,0,0,0.8)
- Below poster: "The Last Drive" (white, 12px, weight 600), "$2.99" (gray #A3A3A3, 11px, weight 500)

Card 2 — "Echo Valley" (a series, subscribed)
- Background: linear-gradient 180deg, #14101a → #2c1a3d → #0c0612
- No HD badge
- Bottom: 28×1px purple accent (#b08fd9), title "ECHO VALLEY" in white, then "A SERIES" subtitle (#b08fd9, 9px, weight 600, letter-spacing 0.1em)
- Below poster: "Echo Valley" (white, 12px), entitlement badge: green check icon + "Subscribed" in #22C55E, 11px, weight 600

Card 3 — "Crown of Ash" (single, owned, in progress)
- Background: linear-gradient 140deg, #1c0d05 → #3d1e08 → #0f0703
- "OWNED" badge top-right: background #E50914, white, font-size 9px, weight 700
- Bottom: 28×1px gold accent (#d4a04a), title "CROWN OF ASH" in white
- Below poster: "Crown of Ash" (white, 12px), then play icon + "Continue · 42m left" (#A3A3A3, 11px, weight 500)

Card 4 — "After Hours"
- Background: linear-gradient 165deg, #1a0a18 → #4a1538 → #0a040a
- No badge
- Bottom: 28×1px pink accent (#ed7aa6), title "AFTER HOURS" in white
- Below poster: "After Hours" (white, 12px), "$3.99" (gray, 11px)

## 4. "Series · Subscribe to unlock" rail

- Padding 0 32px 28px, padding-top 12px
- Section heading: "Series · Subscribe to unlock" (white, 17px, weight 700)
- Grid: 4 columns, gap 12px
- 4 posters with no entitlement badges (just title + accent line):
  - "Midnight Run" — gradient #0a1f30 → #040a14 → #000, cyan accent #5cb8d4
  - "Final Frame" — gradient #1a1a08 → #404010 → #0a0a04, yellow accent #d4cc5c
  - "Glasshouse" — gradient #0e3d20 → #04140a → #000, green accent #5cd49a
  - "Hollow Coast" — gradient #1a0e08 → #421a08 → #0a0604, orange accent #e8965c

# Hover states (CRITICAL — these make it feel polished)

- Poster cards: scale to 1.03 on hover, transition 200ms ease, add subtle white border (1px, 20% opacity)
- Primary button: brand red shifts to #F40612
- Secondary button: background opacity increases to 0.2
- Nav links: text goes from #A3A3A3 to #FAFAFA on hover
- "See all" link: chevron icon translates 2px right on hover

# Component structure

Build as React components in this structure: