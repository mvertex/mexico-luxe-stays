# Design

Visual system for the Mexico Luxe Stays marketing site. Source of truth for tokens is `assets/css/styles.css` (`:root` custom properties); this document explains the intent behind them. Brand values come from `Componentes marca/MLS_Manual_de_Marca.pdf`.

## Theme

Bold, glamorous, exclusive luxury hospitality. Full-bleed photography carries the design; deep green sections act as the velvet rope between chapters of the page. The logo's double-arch is the recurring shape signature (arch-topped image masks, arched cards). Light theme only — cream, not white.

## Color

Brand palette (from the brand manual — never recolor):

| Token | Value | Role |
|---|---|---|
| `--green` | `#3A4638` | Verde de Marca — dominant dark sections, footer, hero overlays |
| `--sage` | `#4E5D4B` | Verde Salvia — accents, icon strokes, hover states |
| `--ink` | `#141414` | Negro Tinta — headings/body on light backgrounds |
| `--cream` | `#F6F4EF` | Crema — light section background (never pure white) |
| `--stone` | `#8E8B84` | Gris Piedra — secondary text, captions, rules |

Derived (site-only, stay subordinate): `--green-deep #2C362B` (footer/pressed), `--sage-tint #E9ECE6` (subtle fills), `--gold #C2A878` (sparing metallic accent for eyebrow rules and hover details — jewelry, not paint).

Strategy: **Committed drench on green.** Dark green sections are full-bleed and confident (hero scrim, CTA banners, footer, testimonials). Cream sections in between. Text on green is cream; on cream is ink with stone for secondary. No other hues; turquoise/orange are banned (anti-reference).

## Typography

- **Display: Cormorant Garamond** (Google Fonts; 400/500 + italic). All large headings. Tight tracking (`-0.02em`), `clamp()` fluid sizes, line-height ~1.05 on hero sizes. Italic reserved for one-word emphasis inside headings.
- **UI & body: Montserrat** (Google Fonts; 300–600). Closest free stand-in for Brandon Grotesque (brand font, licensed). Nav, buttons, labels, body copy. Body 300/400 at 1.7 line-height. Uppercase + `0.18em` tracking for eyebrows, nav, and buttons only — never body copy.
- Wordmark is always the logo image, never re-set in a substitute font.
- Scale (fluid, ratio ≥1.25): body 1rem → lead 1.25rem → h3 1.6rem → h2 `clamp(2.2rem, 4vw, 3.4rem)` → display `clamp(3rem, 7vw, 5.5rem)`.

## Shape & space

- **Arch radius**: signature mask `border-radius: 50% 50% 0 0 / 38% 38% 0 0` (approximation of the logo arch) on featured imagery; standard cards use `4px` — luxury = sharp, not bubbly. Buttons: `2px`.
- Spacing tokens: 4px base; section padding `clamp(5rem, 10vw, 9rem)` vertical. Generous separations between sections, tight groupings within a card.
- Container: 1200px max, `clamp(1.25rem, 5vw, 3rem)` side padding.

## Imagery

- Full-bleed photography with a green-tinted scrim: `linear-gradient(rgba(20,26,19,.25), rgba(20,26,19,.65))` over hero/CTA images so cream type always passes contrast.
- Card images get a soft ink gradient from the bottom third.
- All current photos are **placeholders** (verified stock) to be replaced with real villa photography / Hostaway media — marked with `<!-- PLACEHOLDER IMAGE -->` comments.
- Alt text in brand voice: "Infinity pool meeting the Caribbean at dusk, Villa Aqua" — never "pool".

## Components

- **Header**: transparent over hero (cream/negative logo), solid cream with positive logo after scroll; uppercase Montserrat nav; WhatsApp pill button.
- **Buttons**: `.btn-solid` (green fill, cream text), `.btn-ghost` (1px cream/green outline). Hover: sage fill shift + 2px lift (`transform`), never color-only. Focus-visible: 2px gold outline offset 3px.
- **Villa card**: arch-top image, name in Cormorant, location tag as gold eyebrow, guests/bedrooms meta row in stone, "View details" underline link.
- **Testimonial**: oversized Cormorant italic quote on green, guest name + villa in gold eyebrow style.
- **Accordion (FAQ)**: hairline stone rules, plus/minus rotation, `max-height` transition.
- **Forms**: cream fields with 1px stone borders on green panel, sage focus border; labels uppercase small.

## Motion

- Entrance: one orchestrated hero reveal on load (scrim fade + headline rise, 700ms, `cubic-bezier(.22,1,.36,1)`).
- Scroll: single `IntersectionObserver` reveal (`opacity` + 24px `translateY`), staggered 80ms in card grids. Nothing re-animates.
- Only `transform` and `opacity` are animated. No `transition-all`. All motion gated behind `prefers-reduced-motion`.

## Accessibility

WCAG 2.1 AA. Cream `#F6F4EF` on green `#3A4638` ≈ 8.6:1 ✓. Stone `#8E8B84` only for ≥18px secondary text on cream. Focus-visible everywhere, skip-link, semantic landmarks, heading order strict.
