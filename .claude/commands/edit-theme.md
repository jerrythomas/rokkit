---
description: Edit theme CSS for a component. Usage: /edit-theme ComponentName style=rokkit|minimal|material|glass
---

You are editing theme CSS. Request: **$ARGUMENTS**

Parse the style from the arguments (e.g. `style=rokkit`, `style=minimal`, or just the style name). If no style is specified, edit all four themes.

## MANDATORY: Rebuild After Every CSS Change

```bash
cd packages/themes && bun run build
```

Changes to source CSS have NO effect until this runs. Do it after every edit.

## File Locations

```
packages/themes/src/
  base/<name>.css          ← structural layout (padding, flex, border-radius, border-width)
  rokkit/<name>.css        ← gradients, glows, rich colors
  minimal/<name>.css       ← flat, border-only, no gradients
  material/<name>.css      ← elevation, subtle shadows, material-style depth
  glass/<name>.css         ← backdrop-blur, translucency, frosted glass
```

Each theme folder has an `index.css` — import new files there.

---

## Style-Specific Patterns

### `style=rokkit` (Gradients + Glows)

```css
/* Background: gradient surface layers */
[data-style='rokkit'] [data-<name>] {
  @apply bg-surface-z2 border-surface-z4;
}

/* Hover: step up the surface gradient */
[data-style='rokkit'] [data-<name>]:hover:not(:disabled) {
  @apply bg-surface-z3 text-surface-z8;
}

/* Selected/active with focus: primary→secondary gradient */
[data-style='rokkit'] [data-<name>-list]:focus-within [data-<name>-item][data-selected] {
  @apply from-primary-z5 to-secondary-z5 text-primary-z9 bg-gradient-to-b;
}

/* Vertical gradient direction: before=left-to-right, after=right-to-left */
/* Horizontal gradient direction: before=top-to-bottom, after=bottom-to-top */
```

**Rokkit gradient rules:**

- Use `bg-gradient-to-b` (top→bottom) for horizontal tabs/triggers (before position)
- Use `bg-gradient-to-t` for horizontal after-position
- Use `bg-gradient-to-r` for vertical before-position (left side tabs)
- Use `bg-gradient-to-l` for vertical after-position (right side tabs)
- Always pair with `from-primary-z5 to-secondary-z5`

### `style=minimal` (Flat + Border Indicators)

```css
/* NO gradients, NO shadows — flat with subtle borders */
[data-style='minimal'] [data-<name>] {
  @apply text-surface-z7 border-surface-z4 border bg-transparent bg-none;
}

/* Hover: border color step up + secondary accent */
[data-style='minimal'] [data-<name>]:hover:not(:disabled) {
  @apply text-surface-z9 border-l-secondary-z4 border-l-2 bg-none outline-none;
}

/* Selected/active: primary accent border */
[data-style='minimal'] [data-<name>][data-selected] {
  @apply text-surface-z8 border-primary-z4 border-l-2 bg-none;
}

/* Dropdown/panel background */
[data-style='minimal'] [data-<name>-panel] {
  @apply bg-surface-z1 border-surface-z3 border bg-none shadow-sm;
}
```

**Minimal rules:**

- `bg-none` is REQUIRED on any rule that competes with a rokkit gradient rule — prevents bleed-through from `body[data-style='rokkit']`
- Hover items: `border-l-secondary-z4 border-l-2` (left accent, secondary color)
- Selected items: `border-l-primary-z4 border-l-2` (left accent, primary color)
- When focus is within: `border-l-primary-z4` + `text-primary-z7`
- No `background-color` unless it's `bg-transparent` or `bg-surface-z1`

**Tabs orientation-specific borders for minimal:**

```css
/* Horizontal before: bottom border */
@apply border-b-2 border-b-transparent;
/* Horizontal before hover: */
@apply border-b-secondary-z4;
/* Horizontal before selected: */
@apply border-b-primary-z4;

/* Horizontal after: top border */
@apply border-t-2 border-b-0 border-t-transparent;
/* Hover: */
@apply border-t-secondary-z4;
/* Selected: */
@apply border-t-primary-z4;

/* Vertical before (left): right border, rounded-l */
@apply rounded-none rounded-l border-r-2 border-b-0 border-r-transparent;
/* Hover: */
@apply border-r-secondary-z4;
/* Selected: */
@apply border-r-primary-z4;

/* Vertical after (right): left border, rounded-r — MUST zero border-t/b/r */
@apply rounded-none rounded-r border-t-0 border-r-0 border-b-0 border-l-2 border-l-transparent;
/* Hover: */
@apply border-l-secondary-z4 border-t-0 border-r-0 border-b-0;
/* Selected: */
@apply border-l-primary-z4 border-t-0 border-r-0 border-b-0;
```

### `style=material` (Elevation + Subtle Depth)

```css
/* Surfaces use z-level elevation steps */
[data-style='material'] [data-<name>] {
  @apply bg-surface-z2 text-surface-z7 bg-none;
}

/* Hover: elevation step */
[data-style='material'] [data-<name>]:hover:not(:disabled) {
  @apply bg-surface-z3 text-surface-z9 bg-none;
}

/* Active/selected: primary background at mid opacity */
[data-style='material'] [data-<name>][data-selected] {
  @apply bg-primary-z3 text-primary-z8 bg-none;
}

/* Dropdown: elevated surface with shadow */
[data-style='material'] [data-<name>-panel] {
  @apply bg-surface-z1 border-surface-z2 border bg-none shadow-md;
}
```

**Material rules:**

- `bg-none` REQUIRED on all rules (same gradient bleed reason as minimal)
- Use `shadow-md` or `shadow-lg` for panels/dropdowns (not `shadow-sm`)
- Hover uses background color shift rather than border accent
- Selected uses subtle `bg-primary-z3` tint

### `style=glass` (Backdrop Blur + Translucency)

```css
/* Translucent surfaces */
[data-style='glass'] [data-<name>] {
  @apply bg-surface-z1/60 border-surface-z3/50 border bg-none backdrop-blur-sm;
}

/* Hover: less transparent */
[data-style='glass'] [data-<name>]:hover:not(:disabled) {
  @apply bg-surface-z2/70 text-surface-z9 bg-none;
}

/* Panel: frosted glass effect */
[data-style='glass'] [data-<name>-panel] {
  @apply bg-surface-z0/80 border-surface-z2/40 border bg-none shadow-lg backdrop-blur-md;
}
```

**Glass rules:**

- Use `/60`, `/70`, `/80` opacity modifiers on surface colors
- `backdrop-blur-sm` on items, `backdrop-blur-md` on panels/dropdowns
- Border colors get `/40` or `/50` opacity modifiers
- `bg-none` REQUIRED

---

## Color Token Reference

```
Surface levels (neutral):
  bg-surface-z0 → z1 → z2 → z3 (light to elevated)
  text-surface-z4 → z5 → z6 → z7 → z8 → z9 → z10 (subtle to high-contrast)
  border-surface-z2 → z3 → z4 → z5 (subtle to visible)

Primary/secondary accents:
  bg-primary-z3 → z4 → z5 → z6 (light tint to saturated)
  text-primary-z6 → z7 → z8 → z9 (readable to bold)
  border-primary-z4 → z5 (accent border)
  from-primary-z5 to-secondary-z5 (gradient pair)

Semantic:
  text-on-primary  → white-ish text on primary background
  bg-error/warning/success-z*  → semantic state backgrounds
```

## CSS Specificity Rules

Attribute selectors: each `[attr]` = `(0,1,0)`

When layering modifiers, the most-specific rule wins. For vertical-after tabs that must override position='after' rules, you must explicitly zero out borders from lower-specificity rules.

**Specificity order for tab variants:**

1. `[data-tabs][data-orientation='vertical'][data-position='after']` (5 attrs) overrides
2. `[data-tabs][data-position='after']` (4 attrs) overrides
3. `[data-tabs][data-orientation='vertical']` (3 attrs) overrides
4. base `[data-tabs-trigger]` rules

---

## Zero-Errors Policy (Non-Negotiable)

Theme edits can affect generated CSS and downstream tests. Before starting: run `bun run lint` and record baseline. After changes, run again — zero errors required.

Forbidden rationalizations: "no new errors", "pre-existing", "just CSS". Zero means zero.

## After Editing CSS

```bash
cd packages/themes && bun run build   # MANDATORY first
bun run lint                          # zero errors required
```

Then verify at: `http://localhost:5175/playground/components/<name>`
Cycle through all themes using the toolbar dropdown to verify no bleed-through.

## Commit on Completion

```bash
git add packages/themes/
git commit -m "style(<theme>): <component> — <what changed>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
