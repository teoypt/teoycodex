---
name: Teoycodex Control Ledger
description: A restrained technical-paper system for clear administrative control.
colors:
  paper: "#f1f0ee"
  paper-bright: "#f7f7f4"
  ink: "#050b0b"
  ink-soft: "#34433f"
  inspection-green: "#1f5b4d"
  inspection-green-soft: "#4d7a6f"
  rule: "#aebbb6"
  rail-rule: "#31403c"
typography:
  display:
    fontFamily: "Anuphan, Tahoma, sans-serif"
    fontSize: "clamp(3.3rem, 6.8vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Anuphan, Tahoma, sans-serif"
    fontSize: "1.16rem"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "Anuphan, Tahoma, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0.08em"
rounded:
  square: "0"
  status-dot: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "28px"
  section: "36px"
components:
  button-primary:
    backgroundColor: "{colors.inspection-green}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.square}"
    padding: "15px 16px"
    height: "72px"
  button-filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.square}"
    padding: "7px 12px"
  button-filter-selected:
    backgroundColor: "{colors.inspection-green}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.square}"
    padding: "7px 12px"
  navigation-rail:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.square}"
    width: "92px"
---

# Design System: Teoycodex Control Ledger

## Overview

**Creative North Star: “The Control Ledger”**

Teoycodex should feel like a calm technical register: precise enough for administrative work, spacious enough to scan under pressure, and honest about the product’s discovery state. Cool paper, near-black structure, inspection green, and fine ruled lines establish a quiet operational character without imitating a generic card dashboard.

The system is flat, rectilinear, and information-led. Hierarchy comes from scale, position, rules, and disciplined color scarcity. Domain claims, production status, and real activity must never be implied before the product has evidence for them.

**Key Characteristics:**

- Cool technical-paper surfaces with near-black structural anchors.
- One inspection-green accent used for state, selection, and primary action.
- Fine rules and ledger rows instead of floating cards.
- Large, calm Thai typography paired with monospace only for data and measurement labels.
- Responsive layouts that preserve reading order rather than shrinking the desktop grid.

## Colors

The palette is restrained and utilitarian: paper neutrals carry content, near-black defines structure, and inspection green marks deliberate action.

### Primary

- **Inspection Green** (`#1f5b4d`): Primary actions, emphasized words, selected filters, focus language, and important state labels.
- **Soft Inspection Green** (`#4d7a6f`): Active markers, fine section rules, and low-intensity inspection tinting.

### Neutral

- **Technical Paper** (`#f1f0ee`): Default application ground.
- **Bright Paper** (`#f7f7f4`): Light foreground against the dark rail.
- **Ledger Ink** (`#050b0b`): Primary text and navigation structure.
- **Soft Ink** (`#34433f`): Secondary copy and metadata.
- **Measured Rule** (`#aebbb6`): Major separators and table boundaries.
- **Rail Rule** (`#31403c`): Dividers within the near-black navigation rail.

**The Inspection Mark Rule.** Green is rare and functional. Use it to identify action, selection, focus, or verified state—not to decorate large areas.

## Typography

**Display Font:** Anuphan (with Tahoma and sans-serif fallback)
**Body Font:** Anuphan (with Tahoma and sans-serif fallback)
**Label/Mono Font:** Native `ui-monospace` for data, time, version, and measurement language only

**Character:** Anuphan keeps Thai interface copy open and contemporary while remaining practical at ledger density. Monospace supplies a measured register voice, but never replaces the reading face for ordinary content.

### Hierarchy

- **Display** (500, `clamp(3.3rem, 6.8vw, 6rem)`, 0.94): The single dominant page greeting or operational statement.
- **Title** (600, `1.16rem`, 1.55): Ledger and section titles.
- **Body** (400, `1rem`, 1.55): Interface copy, with long explanatory passages kept near 65–75 characters per line.
- **Label** (500, `0.72rem`, `0.08em` tracking): Uppercase English measurements, metadata, section rules, timestamps, and system vocabulary.

**The Measured Mono Rule.** Monospace indicates data or system measurement. Thai prose, actions, and explanations stay in Anuphan.

## Layout

The desktop shell uses a fixed `92px` dark navigation rail and a flexible control surface. The first content region divides into a dominant shift brief and a narrow `270px` inspection rail; the activity ledger then spans the full content width. Major horizontal edges align through shared one-pixel rules.

Spacing uses a compact `4/8/16/24/28/36px` rhythm, with substantially more space before the display heading than after it. At `820px`, the rail becomes an off-canvas drawer, the shift brief and inspection rail become one reading sequence, and the header sheds secondary metadata. At `520px`, explanatory row copy collapses while task names and icons remain. Tables retain semantic columns and scroll horizontally instead of compressing into illegibility.

## Elevation & Depth

The system uses no shadows. Depth is conveyed through dark/light contrast, ruled boundaries, restrained tonal fills, and the mobile navigation backdrop. A hover may move a primary control by `2px`, but it must not acquire card-like elevation.

**The Flat Register Rule.** Use a border or a tonal change to separate operational regions. Do not introduce floating cards or decorative shadows.

## Shapes

Controls and containers are square-cornered. One-pixel rules provide the recurring geometry, while circles are reserved for status dots and the internal construction of authored icons. Avoid pills, soft cards, and ornamental clipping.

## Components

### Buttons

- **Shape:** Square (`0` radius), with authored line icons and explicit text labels.
- **Primary:** Inspection-green fill, bright-paper text, `15px 16px` padding, and a `72px` minimum height for the main administrative action.
- **Hover / Focus:** Darken the green and lift by `2px` on hover; use the shared high-contrast focus outline for keyboard interaction.
- **Filter:** Transparent at rest with soft-ink text; selected state becomes inspection green with bright text.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Technical paper or a very low-percentage inspection-green tint.
- **Shadow Strategy:** None.
- **Border:** One-pixel measured or green rules.
- **Internal Padding:** Usually `16–24px`, tightened inside ledger rows.

### Navigation

The desktop navigation is a narrow near-black rail with authored `1.7px` stroke icons, a green active-edge marker, and visible hover/active tonal states. Below `820px`, it expands into a labeled drawer with a dimmed backdrop. A closed drawer must be removed from keyboard navigation.

### Activity Ledger

Use a real table with tabular numerals, monospace headers, thin cell rules, and a subtle green row hover. Identify Supabase as the live source near both the title and footer, and show an explicit empty state when no rows exist. Preserve horizontal scrolling on narrow screens.

### Discovery Notice

Use a square one-pixel green border, a light green-tinted ground, one authored information icon, and direct copy that distinguishes confirmed product facts from unresolved decisions.

## Do's and Don'ts

### Do:

- **Do** make the current role, environment, and data source explicit.
- **Do** align task rows, inspection fields, and ledger columns to visible rules.
- **Do** label live data sources and empty states clearly.
- **Do** preserve keyboard focus, semantic tables, and a logical mobile reading order.
- **Do** use authored icons from the same stroke family.

### Don't:

- **Don't** introduce metric cards, gradient fills, rounded dashboard tiles, or decorative shadows.
- **Don't** use green as ambient decoration; its rarity carries meaning.
- **Don't** use monospace for ordinary Thai prose or primary action labels.
- **Don't** fabricate business workflows, customer data, production health, or domain entities.
- **Don't** hide authorization only in navigation; production access control must also exist at the backend/API boundary.
