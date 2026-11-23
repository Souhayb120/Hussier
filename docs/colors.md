# Mofawid colour palette: « Vert Maroc »

The palette of the app. The public landing page uses the same colours through its own
`--mf-*` variables (`src/components/landing/landing.css`), plus a few fixed green/gold blocks in its components.
Built with the steps of `color-palette.md` (context, scales, semantic colours, WCAG AA checks, designed
dark mode, HEX/RGB/HSL values, usage rules) and the priorities of `SKILL.md` (UI/UX Pro Max).

**Concept:** an official tool for Moroccan *commissaires de justice*, with the look of Moroccan government
services: the **green of the national flag** (`#006233`) for actions and identity, the **red of the flag**
(`#C1272D`) for errors and destructive actions, a discreet **brass gold** for "waiting / to approve",
on clean warm white. Dark mode is a deep green-black with the same meanings.

## How it works

- Every colour is a CSS variable in `src/styles/index.css`, written as RGB channels
  (`--brand-600: 0 98 51;`). Light values are in `:root`, dark values in `.dark`.
- `tailwind.config.js` turns them into Tailwind colours with `rgb(var(--x) / <alpha-value>)`,
  so opacities like `bg-canvas/60` keep working.
- Text has its own variables (`--brand-text-*`, `--red-text-*`…): in dark mode `text-brand-700`
  becomes light while `bg-brand-700` stays dark.
- `color-palette.md` suggests HSL variables. We keep RGB channels because Tailwind's opacity
  modifiers rely on them; HSL values are listed below for reference.
- The token **names** never change with the palette (`brand`, `gold`, `emerald`, `red`, `sky`, `slate`),
  so components never need editing: change the values here, not the classes.
- **Never write a hex value or a raw Tailwind colour (`amber`, `blue`, `gray`…) in a component.**
  Use the tokens, or the colour will not follow dark mode. (Exception: the Moroccan flag in
  `LoginIllustration.tsx` keeps its official red and green.)

## Semantic colours

| Meaning | Token family | Badge tone | Used for |
|---|---|---|---|
| Primary | `brand`: flag green, hue ≈ 151° (`#006233`) | `brand` | Primary buttons, links, active navigation, focus ring, avatars, "direct" observations |
| Accent | `gold`: brass gold | `gold` | Awaiting approval, declarations, "from the field" tags |
| Warning | `gold`, stronger tint | `warning` | Partially paid, things that need attention soon |
| Success | `emerald`: leaf green, hue ≈ 100° (yellower) | `success` | In progress, approved, paid, completed |
| Error / destructive | `red`: flag red (`#C1272D`) | `danger` | Unpaid, delete buttons, error messages |
| Info | `sky`: sky blue | `info` | Assigned, AI drafts |
| Neutral | `slate`: warm neutral grey | `neutral` | Drafts, closed, cancelled |

The brand and success are both green, so success is a clearly yellower **leaf** green: an "Approved"
badge never looks like a brand badge (checked below: the two text colours are far apart).

## Usage guidelines

**Do**

- Use `text-ink` for main text, `text-ink-muted` for secondary text, `text-ink-soft` for hints,
  table headers and placeholders: all three pass 4.5:1 in both modes.
- Use `StatusBadge` for any status: it maps the back-end value to a tone in one place (`ui.tsx`).
- Always show a status with **text** (and the dot), never with colour alone.
- Use `bg-brand-600` + white text for one primary action per area.
- Keep red for destructive actions and errors only; keep gold for "waiting / to approve".

**Don't**

- Don't put `text-ink-soft` on a coloured background (badge, button): use the badge's own text colour.
- Don't use `--line` for form fields: fields use `--line-strong` (3:1, WCAG 1.4.11) through the `.input` class.
- Don't use the brand green to mean "success": use the `success` tone.
- Don't invent a new colour for one screen: add a token (light **and** dark value) and check it below.

## UI rules applied from SKILL.md

The skill's search database (`scripts/search.py` and its data files) is not in the project, so these come
from its built-in priority table, not from a database match.

- **Accessibility (priority 1):** every text pair below passes 4.5:1, field borders and focus rings 3:1;
  form labels are tied to their fields; toasts are announced to screen readers.
- **Touch (priority 2):** on touch screens (`pointer: coarse`) buttons and icon buttons are at least 44 px
  (`Button` sizes in `ui.tsx`); mouse layouts keep their original sizes.
- **Typography (priority 6):** form fields use 16 px text on phones (no automatic zoom on iPhone),
  14 px from the `sm` breakpoint up.
- **Animation (priority 7):** every animation and transition stops with `prefers-reduced-motion`.

## Colour blindness

- Red/green is never the only signal: badges carry a text label, deadlines show the date and a word
  ("En retard", "Aujourd'hui"), and destructive buttons have an icon and a label.
- The flag green and the flag red also differ strongly in lightness, so they stay apart for
  red-green colour-blind users.

## Values

| Role | Token | Light (HEX · RGB · HSL) | Dark (HEX · RGB · HSL) |
|---|---|---|---|
| Page background | `--canvas` | #f7f7f4 · rgb(247, 247, 244) · hsl(60, 16%, 96%) | #0d1210 · rgb(13, 18, 16) · hsl(156, 16%, 6%) |
| Card / surface | `--surface` | #ffffff · rgb(255, 255, 255) · hsl(0, 0%, 100%) | #151c19 · rgb(21, 28, 25) · hsl(154, 14%, 10%) |
| Soft border (cards, dividers) | `--line` | #e5e5e0 · rgb(229, 229, 224) · hsl(60, 9%, 89%) | #26302b · rgb(38, 48, 43) · hsl(150, 12%, 17%) |
| Field border | `--line-strong` | #8a8c86 · rgb(138, 140, 134) · hsl(80, 3%, 54%) | #627069 · rgb(98, 112, 105) · hsl(150, 7%, 41%) |
| Main text | `--ink` | #1c1f1d · rgb(28, 31, 29) · hsl(140, 5%, 12%) | #eceeea · rgb(236, 238, 234) · hsl(90, 11%, 93%) |
| Secondary text | `--ink-muted` | #525754 · rgb(82, 87, 84) · hsl(144, 3%, 33%) | #a8b2ac · rgb(168, 178, 172) · hsl(144, 6%, 68%) |
| Tertiary text (hints, placeholders) | `--ink-soft` | #686d69 · rgb(104, 109, 105) · hsl(132, 2%, 42%) | #828f88 · rgb(130, 143, 136) · hsl(148, 5%, 54%) |
| Primary button | `--brand-600` | #006233 · rgb(0, 98, 51) · hsl(151, 100%, 19%) | #007a40 · rgb(0, 122, 64) · hsl(151, 100%, 24%) |
| Primary button hover | `--brand-700` | #00522b · rgb(0, 82, 43) · hsl(151, 100%, 16%) | #006837 · rgb(0, 104, 55) · hsl(152, 100%, 20%) |

Light scales:

| Scale | 50 | 100 | 300 | 500 | 600 | 700 | 900 |
|---|---|---|---|---|---|---|---|
| brand: Moroccan green (primary) | #ecf7f1 | #d1ecdd | #6ab88f | #107c4d | #006233 | #00522b | #02341d |
| gold: brass gold (accent / warning) | #fbf7ed | #f5ecd6 | #d6ba78 | #b08a3e | #94712e | #765924 | #463517 |
| emerald: leaf green (success) | #f3faec | #e2f3d4 | #9cd070 | #529628 | #42801e | #366918 | #244414 |
| red: Moroccan red (error / destructive) | #fdf2f2 | #fadfe0 | #e8878b | #cc373d | #c1272d | #a01e24 | #641418 |
| sky: sky blue (info) | #f0f9ff | #e0f2fe | #7dd3fc | #0ea5e9 | #0284c7 | #0369a1 | #0c4a6e |
| slate: warm neutral (neutral) | #fafaf8 | #f3f3f0 | #d2d2cc | #787a74 | #5c5e59 | #444642 | #1e1f1d |

## WCAG contrast (checked)

Every text/background pair the UI really uses, computed from the values above
(normal text needs 4.5:1, borders and focus rings 3:1).

### Light mode

| Pair | Ratio | Needs | |
|---|---|---|---|
| Body text on page (`body`) | 15.49:1 | 4.5:1 | pass |
| Body text on card (`.card`) | 16.63:1 | 4.5:1 | pass |
| Muted text on card (`text-ink-muted`) | 7.37:1 | 4.5:1 | pass |
| Muted text on page (`text-ink-muted`) | 6.86:1 | 4.5:1 | pass |
| Soft text on card (`text-ink-soft`) | 5.28:1 | 4.5:1 | pass |
| Soft text on page (`text-ink-soft`) | 4.92:1 | 4.5:1 | pass |
| Placeholder in field (`.input placeholder`) | 5.28:1 | 4.5:1 | pass |
| Primary button (`Button primary`) | 7.51:1 | 4.5:1 | pass |
| Primary button hover (`Button primary:hover`) | 9.37:1 | 4.5:1 | pass |
| Danger button (`Button danger`) | 5.84:1 | 4.5:1 | pass |
| Secondary button (`Button secondary`) | 8.54:1 | 4.5:1 | pass |
| Link / brand text on card (`text-brand-700`) | 9.37:1 | 4.5:1 | pass |
| Error text on card (`.error-text`) | 5.84:1 | 4.5:1 | pass |
| Error text on page (`.error-text`) | 5.44:1 | 4.5:1 | pass |
| Avatar / logo initials (`bg-brand-700 text-white`) | 9.37:1 | 4.5:1 | pass |
| Login panel text (`login panel`) | 13.89:1 | 4.5:1 | pass |
| Badge neutral (`Badge tone="neutral"`) | 8.58:1 | 4.5:1 | pass |
| Badge brand (`Badge tone="brand"`) | 8.54:1 | 4.5:1 | pass |
| Badge info (`Badge tone="info"`) | 5.57:1 | 4.5:1 | pass |
| Badge warning (`Badge tone="warning"`) | 5.54:1 | 4.5:1 | pass |
| Badge danger (`Badge tone="danger"`) | 7.08:1 | 4.5:1 | pass |
| Badge success (`Badge tone="success"`) | 6.17:1 | 4.5:1 | pass |
| Badge gold (`Badge tone="gold"`) | 6.09:1 | 4.5:1 | pass |
| Field border (`.input border (WCAG 1.4.11)`) | 3.40:1 | 3:1 | pass |
| Field hover border (`.input:hover`) | 5.23:1 | 3:1 | pass |
| Focus ring on page (`:focus-visible`) | 7.00:1 | 3:1 | pass |

### Dark mode

| Pair | Ratio | Needs | |
|---|---|---|---|
| Body text on page (`body`) | 16.19:1 | 4.5:1 | pass |
| Body text on card (`.card`) | 14.84:1 | 4.5:1 | pass |
| Muted text on card (`text-ink-muted`) | 7.94:1 | 4.5:1 | pass |
| Muted text on page (`text-ink-muted`) | 8.67:1 | 4.5:1 | pass |
| Soft text on card (`text-ink-soft`) | 5.14:1 | 4.5:1 | pass |
| Soft text on page (`text-ink-soft`) | 5.61:1 | 4.5:1 | pass |
| Placeholder in field (`.input placeholder`) | 5.44:1 | 4.5:1 | pass |
| Primary button (`Button primary`) | 5.44:1 | 4.5:1 | pass |
| Primary button hover (`Button primary:hover`) | 6.92:1 | 4.5:1 | pass |
| Danger button (`Button danger`) | 5.84:1 | 4.5:1 | pass |
| Secondary button (`Button secondary`) | 9.81:1 | 4.5:1 | pass |
| Link / brand text on card (`text-brand-700`) | 10.53:1 | 4.5:1 | pass |
| Error text on card (`.error-text`) | 9.13:1 | 4.5:1 | pass |
| Error text on page (`.error-text`) | 9.96:1 | 4.5:1 | pass |
| Avatar / logo initials (`bg-brand-700 text-white`) | 6.92:1 | 4.5:1 | pass |
| Login panel text (`login panel`) | 13.89:1 | 4.5:1 | pass |
| Badge neutral (`Badge tone="neutral"`) | 9.42:1 | 4.5:1 | pass |
| Badge brand (`Badge tone="brand"`) | 9.81:1 | 4.5:1 | pass |
| Badge info (`Badge tone="info"`) | 10.11:1 | 4.5:1 | pass |
| Badge warning (`Badge tone="warning"`) | 8.62:1 | 4.5:1 | pass |
| Badge danger (`Badge tone="danger"`) | 9.84:1 | 4.5:1 | pass |
| Badge success (`Badge tone="success"`) | 10.75:1 | 4.5:1 | pass |
| Badge gold (`Badge tone="gold"`) | 10.08:1 | 4.5:1 | pass |
| Field border (`.input border (WCAG 1.4.11)`) | 3.52:1 | 3:1 | pass |
| Field hover border (`.input:hover`) | 3.50:1 | 3:1 | pass |
| Focus ring on page (`:focus-visible`) | 7.16:1 | 3:1 | pass |

Semantic colours are also checked to stay apart from each other (brand, info, success, warning,
error): the closest pair is well separated in both modes.

To re-check after changing a colour: compute the ratio of the new pair (any WCAG contrast checker
works) and keep it at or above the "Needs" column.
