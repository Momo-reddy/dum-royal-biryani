# Design Brief

## Direction

Dum Pukht — a royal Awadhi biryani kitchen presented as a heritage atelier: charcoal lacquer, saffron amber, and parchment cream.

## Tone

Luxury/refined with editorial warmth — deep charcoal surfaces and one dominant saffron accent read as a slow-sealed dum pot rather than a fast-food menu.

## Differentiation

A hairline "dum seal" double-rule and a faint parchment grain overlay give every section the tactile feel of a hand-set royal menu card.

## Color Palette

| Token      | OKLCH         | Role                                       |
| ---------- | ------------- | ------------------------------------------ |
| background | 0.965 0.014 78 | Warm parchment (light) / charcoal (dark)   |
| foreground | 0.205 0.028 52 | Espresso ink text                          |
| card       | 0.99 0.008 80  | Raised parchment surface                   |
| primary    | 0.66 0.158 62  | Saffron amber — CTAs, active states, prices |
| accent     | 0.5 0.115 22   | Muted rose-clay — secondary highlights     |
| muted      | 0.915 0.022 76 | Section alternation, chips                 |
| border     | 0.875 0.024 74 | Hairline rules between zones               |

## Typography

- Display: Fraunces — hero, section headings, dish names; soft-serif with optical character
- Body: Satoshi — paragraphs, nav, labels, buttons
- Mono: Geist Mono — prices (₹), rating numerals, hours
- Scale: hero `text-5xl md:text-7xl font-semibold tracking-tight`, h2 `text-3xl md:text-5xl font-semibold tracking-tight`, label `text-xs font-semibold tracking-[0.2em] uppercase`, body `text-base md:text-lg`

## Elevation & Depth

Layered surfaces with warm shadows (`shadow-subtle` → `shadow-elevated` → `shadow-royal`); depth comes from tonal cards, not glow.

## Structural Zones

| Zone    | Background             | Border     | Notes                                              |
| ------- | ---------------------- | ---------- | -------------------------------------------------- |
| Header  | `bg-card/85` backdrop-blur | `border-b` | Sticky; saffron underline on active nav link       |
| Content | `bg-background`        | —          | Alternate `bg-muted/40` sections; grain overlay    |
| Footer  | `bg-gradient-royal`    | `border-t` | Dark lacquer footer with cream text + saffron rules |

## Spacing & Rhythm

Generous section gaps (`py-20 md:py-28`), content max-width `container`, tight micro-spacing (`gap-2`–`gap-4`) inside card groups.

## Component Patterns

- Buttons: `rounded-md`, saffron `bg-primary` with `hover:bg-primary/90` + `transition-smooth`; ghost variant for secondary actions
- Cards: `rounded-lg bg-card border shadow-subtle`, lift to `shadow-elevated` on hover
- Badges: pill `rounded-full bg-secondary text-secondary-foreground`; veg/non-veg dot indicators
- Rating: saffron star + `font-mono` numeral, review count in `text-muted-foreground`

## Motion

- Entrance: `animate-fade-up` staggered 60–120ms on hero and section headers
- Hover: `transition-smooth` (300ms cubic-bezier) on buttons, cards, nav links
- Decorative: `animate-steam-rise` on hero accent; `animate-shimmer` on featured dish ribbon

## Constraints

- Saffron is the single dominant accent; rose-clay used sparingly — never both competing in one component
- No online ordering or reservation UI surfaces — CTA links out only
- All colors via semantic tokens; no raw hex/arbitrary color classes in components
- Both light and dark themes must meet AA+ contrast

## Signature Detail

The "dum seal" hairline double-rule with a centered diamond glyph — a typographic seal that marks every section boundary, echoing the sealed clay lid of a dum biryani handi.
