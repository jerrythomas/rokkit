# Theme System Expansion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `palettes` config field for custom colors (any CSS format including oklch/hsl), implement five new built-in themes (shadcn, daisy-ui, bits-ui, carbon, ant-design), and add a verification page showing all themes side-by-side.

**Architecture:** Three independent subsystems. (1) `palettes` modifies `@rokkit/unocss` config + `@rokkit/core` color handling so custom hex/oklch/hsl palettes merge with UnoCSS defaults. (2) New themes are CSS-only in `@rokkit/themes` — each theme is ~22 files using existing data-attribute selectors. (3) The verification page is a Svelte route under `site/src/routes/(play)/playground/`.

**Tech Stack:** Svelte 5, UnoCSS, CSS `@apply`, Vitest, Bun.

---

## Scope Check

Three distinct subsystems:

- **Chunk 1: `palettes` field** — config.js + preset.ts + core color handling + tests
- **Chunk 2: Five new themes** — CSS source files + build + package.json + CLI
- **Chunk 3: Verification page** — Svelte playground route

Each chunk is independently testable and committable.

---

## Chunk 1: Custom `palettes` Config Field

### Files

| Action | Path                                  | Responsibility                                                |
| ------ | ------------------------------------- | ------------------------------------------------------------- |
| Modify | `packages/core/src/utils.js`          | Add `colorToRgb` to handle hex, hsl, oklch, named colors      |
| Modify | `packages/core/src/theme.ts`          | Use `colorToRgb` instead of `hex2rgb` in `generateColorRules` |
| Modify | `packages/unocss/src/config.js`       | Add `palettes: {}` to `DEFAULT_CONFIG`, merge in `loadConfig` |
| Modify | `packages/unocss/src/preset.ts`       | Pass `config.palettes` merged into `defaultColors` to `Theme` |
| Modify | `packages/unocss/spec/config.spec.js` | Tests for palettes pass-through                               |
| Modify | `packages/unocss/spec/preset.spec.js` | Tests for custom palette in theme.colors                      |

**Run tests with:** `cd packages/unocss && bun run test` (or `bun run test:ci` from repo root)

---

### Task 1: Fix color conversion to support non-hex CSS values

**Why:** `hex2rgb(value)` calls `value.match(/\w\w/g)` which only works for 6-digit hex strings. Passing oklch/hsl/named colors would throw or return garbage. We need a safe fallback: if the value looks like hex, convert; otherwise pass through as-is (the browser handles interpretation in CSS variables).

**Note on tradeoff:** UnoCSS uses `rgba(var(--color-primary-500), <alpha-value>)` for utility classes, which requires the CSS variable to hold `r,g,b` numbers (e.g., `255,0,0`). This only works with hex → rgb conversion. Non-hex custom palette colors will work in raw CSS (e.g., `color: var(--color-brand-500)`) but NOT with UnoCSS opacity utilities like `bg-primary-500/50`. Document this in a comment.

**Files:**

- Modify: `packages/core/src/utils.js`
- Modify: `packages/core/src/theme.ts`

- [ ] **Step 1: Write a failing test for non-hex color pass-through**

Add to an existing core utils test file, or create `packages/core/spec/utils.spec.js` if no color conversion tests exist:

```js
import { colorToRgb } from '../src/utils.js'

describe('colorToRgb', () => {
  it('converts hex to r,g,b', () => {
    expect(colorToRgb('#0f4c81')).toBe('15,76,129')
  })
  it('passes through oklch as-is', () => {
    expect(colorToRgb('oklch(60% 0.18 250)')).toBe('oklch(60% 0.18 250)')
  })
  it('passes through hsl as-is', () => {
    expect(colorToRgb('hsl(210 83% 27%)')).toBe('hsl(210 83% 27%)')
  })
  it('passes through named colors as-is', () => {
    expect(colorToRgb('rebeccapurple')).toBe('rebeccapurple')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/core && bun run test
```

Expected: FAIL — `colorToRgb` is not exported.

- [ ] **Step 3: Add `colorToRgb` to `packages/core/src/utils.js`**

Add after the existing `hex2rgb` function (around line 205):

```js
/**
 * Convert a CSS color value to r,g,b for use in CSS variables.
 * Hex values (#rrggbb) are converted to "r,g,b" for rgba() support.
 * All other formats (oklch, hsl, named) are returned as-is.
 * Note: non-hex values will NOT work with UnoCSS opacity utilities like bg-primary/50.
 *
 * @param {string} value
 * @returns {string}
 */
export function colorToRgb(value) {
  if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return hex2rgb(value)
  }
  return value
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
cd packages/core && bun run test
```

Expected: PASS

- [ ] **Step 5: Update `generateColorRules` in `packages/core/src/theme.ts` to use `colorToRgb`**

Change line 5 import:

```ts
import { hex2rgb, colorToRgb } from './utils'
```

Change line 46:

```ts
// Before:
value: hex2rgb(colors[mapping[variant]][`${shade}`])
// After:
value: colorToRgb(colors[mapping[variant]][`${shade}`])
```

- [ ] **Step 6: Run all core tests to confirm nothing broke**

```bash
cd packages/core && bun run test
```

Expected: all tests PASS (existing hex-based colors still work because `colorToRgb` delegates to `hex2rgb` for hex values).

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/utils.js packages/core/src/theme.ts packages/core/spec/
git commit -m "feat(core): add colorToRgb to support non-hex CSS color values in palettes"
```

---

### Task 2: Add `palettes` field to unocss config

**Files:**

- Modify: `packages/unocss/src/config.js`
- Modify: `packages/unocss/spec/config.spec.js`

- [ ] **Step 1: Write failing tests**

Add to `packages/unocss/spec/config.spec.js`:

```js
it('should default palettes to empty object', () => {
  const config = loadConfig()
  expect(config.palettes).toEqual({})
})

it('should pass through custom palettes', () => {
  const palettes = {
    brand: { 500: '#0f4c81', 600: '#0a3a64' }
  }
  const config = loadConfig({ palettes })
  expect(config.palettes).toEqual(palettes)
})

it('should ignore unknown fields but keep palettes', () => {
  const config = loadConfig({ palettes: { brand: { 500: '#fff' } }, unknown: 'x' })
  expect(config.palettes).toEqual({ brand: { 500: '#fff' } })
  expect(config).not.toHaveProperty('unknown')
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd packages/unocss && bun run test spec/config.spec.js
```

Expected: FAIL — `config.palettes` is `undefined`.

- [ ] **Step 3: Add `palettes` to `DEFAULT_CONFIG` and `loadConfig` in `packages/unocss/src/config.js`**

```js
export const DEFAULT_CONFIG = {
  palettes: {},  // ← add this line
  colors: { ... },
  skins: {},
  themes: ['rokkit'],
  icons: { app: '@rokkit/icons/app.json' },
  switcher: 'manual',
  storageKey: 'rokkit-theme'
}
```

In `loadConfig`, add to the result object:

```js
const result = {
  palettes: pick(cfg.palettes, DEFAULT_CONFIG.palettes), // ← add
  colors: { ...DEFAULT_CONFIG.colors, ...cfg.colors }
  // ... rest unchanged
}
```

- [ ] **Step 4: Run tests**

```bash
cd packages/unocss && bun run test spec/config.spec.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/unocss/src/config.js packages/unocss/spec/config.spec.js
git commit -m "feat(unocss): add palettes field to loadConfig"
```

---

### Task 3: Wire palettes into `presetRokkit`

**Files:**

- Modify: `packages/unocss/src/preset.ts`
- Modify: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Write failing test**

Add to `packages/unocss/spec/preset.spec.js`:

```js
it('should include custom palette in theme.colors', () => {
  const preset = presetRokkit({
    palettes: {
      brand: { 50: '#f0f4ff', 500: '#0f4c81', 950: '#071c30' }
    },
    colors: { primary: 'brand' }
  })
  expect(preset.theme.colors).toHaveProperty('primary')
  // primary maps to brand, which should have UnoCSS-style shade structure
  expect(preset.theme.colors.primary).toHaveProperty('500')
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
cd packages/unocss && bun run test spec/preset.spec.js
```

Expected: FAIL — `theme.colors.primary.500` is undefined because `brand` isn't in `defaultColors`.

- [ ] **Step 3: Update `presetRokkit` in `packages/unocss/src/preset.ts`**

Add the `defaultColors` import and merge palettes before constructing `Theme`:

```ts
import { shades, defaultPalette, DEFAULT_ICONS, iconShortcuts, Theme, defaultColors } from '@rokkit/core'

export function presetRokkit(options = {}): Preset {
  const config = loadConfig(options)
  const mergedColors = { ...defaultColors, ...config.palettes }
  const theme = new Theme({ colors: mergedColors, mapping: config.colors })
  // rest unchanged
```

- [ ] **Step 4: Run tests**

```bash
cd packages/unocss && bun run test spec/preset.spec.js
```

Expected: PASS

- [ ] **Step 5: Run full test suite to confirm no regressions**

```bash
bun run test:ci
```

Expected: all ~2600+ tests PASS, 0 errors.

- [ ] **Step 6: Commit**

```bash
git add packages/unocss/src/preset.ts packages/unocss/spec/preset.spec.js
git commit -m "feat(unocss): wire palettes config into Theme construction"
```

---

## Chunk 2: Five New Themes

### Files

Each theme follows the exact pattern of `packages/themes/src/rokkit/`. The CSS uses `[data-style='<name>']` selectors and Rokkit's `@apply` token classes.

**Files to create per theme (×5 themes):**

```
packages/themes/src/<theme>/
  index.css
  button.css
  toolbar.css
  tabs.css
  toggle.css
  switch.css
  list.css
  tree.css
  connector.css
  select.css
  menu.css
  dropdown.css
  floating-action.css
  input.css
  table.css
  search-filter.css
  range.css
  timeline.css
  floating-navigation.css
  grid.css
  upload-target.css
  upload-progress.css
  toc.css
  card.css
  message.css
  status-list.css
```

**Files to modify:**

| Path                               | Change                                          |
| ---------------------------------- | ----------------------------------------------- |
| `packages/themes/build.mjs`        | Add 5 themes to build loop and bundle           |
| `packages/themes/package.json`     | Add exports for each new theme                  |
| `packages/cli/src/init.js`         | Add to theme choices in `PROMPTS_CONFIG`        |
| `packages/cli/src/doctor.js`       | Add to `KNOWN_THEMES` array                     |
| `packages/cli/spec/doctor.spec.js` | Update count, add new theme names to list       |
| `packages/cli/spec/init.spec.js`   | Update theme choices test to include new themes |

**Build command:** `cd packages/themes && bun run build`
**Verify with skill:** `/build-themes` (or `bun run build.mjs` directly)

---

### Task 4: Scaffold `shadcn` theme

**Visual style:** `rounded-md`, flat `border-surface-z3` borders, no gradients, `ring-2 ring-offset-2` focus. Clean and minimal.

- [ ] **Step 1: Create `packages/themes/src/shadcn/index.css`**

```css
/**
 * @rokkit/themes - shadcn Theme
 *
 * Clean and minimal: rounded-md, flat borders, ring focus.
 */

@import './button.css';
@import './toolbar.css';
@import './tabs.css';
@import './toggle.css';
@import './switch.css';
@import './list.css';
@import './tree.css';
@import './connector.css';
@import './select.css';
@import './menu.css';
@import './dropdown.css';
@import './floating-action.css';
@import './input.css';
@import './table.css';
@import './search-filter.css';
@import './range.css';
@import './timeline.css';
@import './floating-navigation.css';
@import './grid.css';
@import './upload-target.css';
@import './upload-progress.css';
@import './toc.css';
@import './card.css';
@import './message.css';
@import './status-list.css';
```

- [ ] **Step 2: Create `packages/themes/src/shadcn/button.css`**

```css
/**
 * Button - shadcn Theme
 * Flat, bordered, rounded-md. No gradients.
 */

[data-style='shadcn'] [data-button][data-style='default'][data-variant='default'],
[data-style='shadcn'] [data-button]:not([data-style])[data-variant='default'],
[data-style='shadcn'] [data-button][data-style='default']:not([data-variant]),
[data-style='shadcn'] [data-button]:not([data-style]):not([data-variant]) {
  @apply bg-surface-z2 border-surface-z4 text-surface-z8 rounded-md border;
}

[data-style='shadcn'] [data-button][data-style='default'][data-variant='primary'],
[data-style='shadcn'] [data-button]:not([data-style])[data-variant='primary'] {
  @apply bg-primary-z5 text-on-primary rounded-md border-transparent;
}

[data-style='shadcn'] [data-button][data-style='default'][data-variant='secondary'],
[data-style='shadcn'] [data-button]:not([data-style])[data-variant='secondary'] {
  @apply bg-secondary-z4 text-on-secondary rounded-md border-transparent;
}

[data-style='shadcn'] [data-button][data-style='default'][data-variant='danger'],
[data-style='shadcn'] [data-button]:not([data-style])[data-variant='danger'] {
  @apply bg-danger-z4 text-on-danger rounded-md border-transparent;
}

[data-style='shadcn'] [data-button][data-style='outline'][data-variant='default'],
[data-style='shadcn'] [data-button][data-style='outline']:not([data-variant]) {
  @apply border-surface-z4 text-surface-z7 rounded-md border bg-transparent;
}

[data-style='shadcn'] [data-button][data-style='outline'][data-variant='primary'] {
  @apply border-primary-z4 text-primary-z6 rounded-md border bg-transparent;
}

[data-style='shadcn'] [data-button][data-style='outline'][data-variant='secondary'] {
  @apply border-secondary-z4 text-secondary-z6 rounded-md border bg-transparent;
}

[data-style='shadcn'] [data-button][data-style='outline'][data-variant='danger'] {
  @apply border-danger-z4 text-danger-z4 rounded-md border bg-transparent;
}

[data-style='shadcn'] [data-button][data-style='ghost'] {
  @apply rounded-md border-transparent bg-transparent;
}

[data-style='shadcn'] [data-button][data-style='ghost'][data-variant='default'],
[data-style='shadcn'] [data-button][data-style='ghost']:not([data-variant]) {
  @apply text-surface-z7;
}

[data-style='shadcn'] [data-button][data-style='ghost'][data-variant='primary'] {
  @apply text-primary-z6;
}

[data-style='shadcn'] [data-button][data-style='ghost'][data-variant='secondary'] {
  @apply text-secondary-z6;
}

[data-style='shadcn'] [data-button][data-style='ghost'][data-variant='danger'] {
  @apply text-danger-z4;
}

[data-style='shadcn'] [data-button][data-style='gradient'][data-variant='default'],
[data-style='shadcn'] [data-button][data-style='gradient']:not([data-variant]) {
  @apply from-surface-z3 to-surface-z1 text-surface-z10 rounded-md bg-gradient-to-br;
}

[data-style='shadcn'] [data-button][data-style='gradient'][data-variant='primary'] {
  @apply from-primary-z5 to-primary-z3 text-on-primary rounded-md bg-gradient-to-br;
}

[data-style='shadcn'] [data-button][data-style='gradient'][data-variant='secondary'] {
  @apply from-secondary-z5 to-secondary-z3 text-on-secondary rounded-md bg-gradient-to-br;
}

[data-style='shadcn'] [data-button][data-style='gradient'][data-variant='danger'] {
  @apply from-danger-z5 to-danger-z3 text-on-danger rounded-md bg-gradient-to-br;
}

[data-style='shadcn'] [data-button][data-style='link'][data-variant='default'],
[data-style='shadcn'] [data-button][data-style='link']:not([data-variant]) {
  @apply text-surface-z7;
}

[data-style='shadcn'] [data-button][data-style='link'][data-variant='primary'] {
  @apply text-primary-z6;
}

[data-style='shadcn'] [data-button][data-style='link'][data-variant='secondary'] {
  @apply text-secondary-z6;
}

[data-style='shadcn'] [data-button][data-style='link'][data-variant='danger'] {
  @apply text-danger-z4;
}

[data-style='shadcn'] [data-button][data-style='link']:hover:not(:disabled):not([data-disabled]) {
  @apply underline;
}

[data-style='shadcn'] [data-button][data-style='default']:hover:not(:disabled):not([data-disabled]),
[data-style='shadcn'] [data-button]:not([data-style]):hover:not(:disabled):not([data-disabled]) {
  @apply bg-surface-z3;
}

[data-style='shadcn']
  [data-button][data-style='outline']:hover:not(:disabled):not([data-disabled]) {
  @apply bg-surface-z1;
}

[data-style='shadcn'] [data-button][data-style='ghost']:hover:not(:disabled):not([data-disabled]) {
  @apply bg-surface-z2;
}

[data-style='shadcn'] [data-button]:focus-visible {
  @apply ring-primary-z4 ring-2 ring-offset-2 outline-none;
}

[data-style='shadcn'] [data-button-group] {
  @apply gap-px;
}

[data-style='shadcn'] [data-button-group] [data-button]:first-child {
  @apply rounded-l-md rounded-r-none;
}

[data-style='shadcn'] [data-button-group] [data-button]:last-child {
  @apply rounded-l-none rounded-r-md;
}
```

- [ ] **Step 3: Create remaining shadcn CSS files**

For each remaining component file, copy the structure from `packages/themes/src/minimal/<component>.css`, replacing `data-style='minimal'` with `data-style='shadcn'`, then apply the shadcn visual rules:

- Inputs: `rounded-md`, `border-surface-z3 border`, `focus:ring-2 ring-primary-z4 ring-offset-1`
- Cards: `rounded-md`, `border-surface-z3 border`, `bg-surface-z1`
- Lists/Menus: `rounded-md` for containers, items have subtle hover `bg-surface-z2`
- Select/Dropdown: `rounded-md`, `border-surface-z3`, `shadow-md` for dropdowns
- Toggle/Switch: `rounded-full` pill shape (shadcn convention for these two)
- Tabs: `rounded-md`, underline active tab with `border-b-2 border-primary-z5`
- Table: thin `border-surface-z3` dividers, no background on rows, zebra stripe via `bg-surface-z1`
- Range: accent color `accent-primary-z5`

- [ ] **Step 4: Run build to test**

```bash
cd packages/themes && bun run build
```

Expected: `✓ dist/shadcn.css` — if shadcn entries aren't in build.mjs yet, it will be skipped (add in Task 9).

- [ ] **Step 5: Commit scaffold**

```bash
git add packages/themes/src/shadcn/
git commit -m "feat(themes): add shadcn theme CSS source files"
```

---

### Task 5: Scaffold `daisy-ui` theme

**Visual style:** `rounded-full` buttons, bold solid fills, `outline-2 outline-offset-2` focus. Playful and colorful.

- [ ] **Step 1: Create all daisy-ui CSS files**

Follow the same structure as Task 4 but with daisy-ui visual rules:

- Buttons: `rounded-full`, solid fills, no borders
- Default button: `bg-surface-z3 text-surface-z8`
- Primary button: `bg-primary-z5 text-on-primary`
- Focus: `outline-2 outline-primary-z5 outline-offset-2`
- Inputs: `rounded-full`, `border-surface-z4`, bold focus outline
- Cards: `rounded-2xl`, slightly elevated `shadow-sm`
- Toggle: extra-rounded pill
- Tabs: pill-style tabs with solid active fill
- Lists: `rounded-full` for selected items

Create `packages/themes/src/daisy-ui/index.css` (same imports as shadcn/index.css but replace `shadcn` in header).

- [ ] **Step 2: Commit**

```bash
git add packages/themes/src/daisy-ui/
git commit -m "feat(themes): add daisy-ui theme CSS source files"
```

---

### Task 6: Scaffold `bits-ui` theme

**Visual style:** `rounded-lg`, `shadow-sm` + subtle border, polished premium feel. Closer to shadcn but softer.

- [ ] **Step 1: Create all bits-ui CSS files**

Visual rules:

- Buttons: `rounded-lg`, flat with `border-surface-z3`
- Primary button: subtle `shadow-sm`, solid fill `bg-primary-z5`
- Focus: soft `ring-2 ring-primary-z3` (lower z = lighter ring)
- Inputs: `rounded-lg`, `border-surface-z3`, `shadow-inner` on focus
- Cards: `rounded-xl shadow-sm bg-surface-z1`
- Dropdowns: `rounded-xl shadow-lg`
- Tabs: `rounded-lg` pill, softer than shadcn

- [ ] **Step 2: Commit**

```bash
git add packages/themes/src/bits-ui/
git commit -m "feat(themes): add bits-ui theme CSS source files"
```

---

### Task 7: Scaffold `carbon` theme

**Visual style:** `rounded-none` everywhere, bottom-border inputs (`border-b-2`), square buttons, heavy hover fills. Dense enterprise feel.

- [ ] **Step 1: Create all carbon CSS files**

Visual rules:

- **All elements:** `rounded-none` (no border radius anywhere)
- Buttons: flat square, `border-0`, just `bg-surface-z3 text-surface-z8` default
- Primary button: `bg-primary-z5 text-on-primary`, no border-radius
- Hover on buttons: `bg-primary-z6` (heavy fill shift)
- Focus: thick `outline-2 outline-primary-z5` (no ring, no offset — carbon style)
- Inputs: `border-b-2 border-surface-z5`, no side/top borders, no border-radius
- Input focus: `border-b-2 border-primary-z5`
- Cards: flat, `border border-surface-z3`, no shadow
- Menus: flat with dividers, `border-b border-surface-z2` on items
- Tabs: `border-b-2 border-primary-z5` active, no border-radius
- Table: solid header `bg-surface-z3`, alternating row `bg-surface-z1`
- Lists: no rounded corners, solid selected state `bg-primary-z2`

- [ ] **Step 2: Commit**

```bash
git add packages/themes/src/carbon/
git commit -m "feat(themes): add carbon theme CSS source files"
```

---

### Task 8: Scaffold `ant-design` theme

**Visual style:** `rounded` (4px small), thin 1px borders, `shadow-md` dropdowns, clean enterprise/dense.

- [ ] **Step 1: Create all ant-design CSS files**

Visual rules:

- Buttons: `rounded` (4px), `border border-surface-z4`, flat no gradient
- Primary button: `bg-primary-z5 text-on-primary border-primary-z6`
- Focus: `ring-1 ring-primary-z3 outline-none` (thin focus ring)
- Inputs: `rounded border border-surface-z4`, standard height
- Input focus: `border-primary-z5 ring-1 ring-primary-z3`
- Cards: `rounded border border-surface-z3 bg-surface-z0`
- Dropdowns: `shadow-lg border border-surface-z3`
- Menus: dense padding, thin dividers, `bg-primary-z1` selected background
- Tabs: underline only `border-b-2 border-primary-z5` (no background)
- Table: thin borders, alternating rows, fixed header style

- [ ] **Step 2: Commit**

```bash
git add packages/themes/src/ant-design/
git commit -m "feat(themes): add ant-design theme CSS source files"
```

---

### Task 9: Wire new themes into build + package.json + CLI

**Files:**

- Modify: `packages/themes/build.mjs`
- Modify: `packages/themes/package.json`
- Modify: `packages/cli/src/init.js`
- Modify: `packages/cli/src/doctor.js`
- Modify: `packages/cli/spec/doctor.spec.js`
- Modify: `packages/cli/spec/init.spec.js`

- [ ] **Step 1: Update `packages/themes/build.mjs` build loop**

In the `build()` function, extend the `for...of` loop:

```js
for (const [name, label] of [
  ['rokkit', 'gradients + glowing borders'],
  ['minimal', 'clean + subtle'],
  ['material', 'elevation + shadows'],
  ['glass', 'blur + transparency'],
  ['grada-ui', 'coral/purple gradient identity'],
  ['shadcn', 'flat borders + ring focus'], // ← add
  ['daisy-ui', 'rounded-full + bold fills'], // ← add
  ['bits-ui', 'rounded-lg + shadow-sm'], // ← add
  ['carbon', 'square + bottom-border inputs'], // ← add
  ['ant-design', 'thin borders + dense layout'] // ← add
]) {
  await buildFile(join(srcDir, name, 'index.css'), `${name}.css`, label)
}
```

Also update the bundle:

```js
const allThemes = [
  'base',
  'rokkit',
  'minimal',
  'material',
  'glass',
  'grada-ui',
  'shadcn',
  'daisy-ui',
  'bits-ui',
  'carbon',
  'ant-design' // ← add
]
```

- [ ] **Step 2: Update `packages/themes/package.json` exports**

Add entries for all 5 new themes (following the pattern of existing ones):

```json
"./dist/shadcn": "./dist/shadcn.css",
"./dist/daisy-ui": "./dist/daisy-ui.css",
"./dist/bits-ui": "./dist/bits-ui.css",
"./dist/carbon": "./dist/carbon.css",
"./dist/ant-design": "./dist/ant-design.css",
"./shadcn.css": "./dist/shadcn.css",
"./daisy-ui.css": "./dist/daisy-ui.css",
"./bits-ui.css": "./dist/bits-ui.css",
"./carbon.css": "./dist/carbon.css",
"./ant-design.css": "./dist/ant-design.css",
"./shadcn": "./src/shadcn/index.css",
"./shadcn/*": "./src/shadcn/*.css",
"./daisy-ui": "./src/daisy-ui/index.css",
"./daisy-ui/*": "./src/daisy-ui/*.css",
"./bits-ui": "./src/bits-ui/index.css",
"./bits-ui/*": "./src/bits-ui/*.css",
"./carbon": "./src/carbon/index.css",
"./carbon/*": "./src/carbon/*.css",
"./ant-design": "./src/ant-design/index.css",
"./ant-design/*": "./src/ant-design/*.css"
```

- [ ] **Step 3: Run the themes build**

```bash
cd packages/themes && bun run build
```

Expected output includes:

```
✓ dist/shadcn.css (flat borders + ring focus)
✓ dist/daisy-ui.css (rounded-full + bold fills)
✓ dist/bits-ui.css (rounded-lg + shadow-sm)
✓ dist/carbon.css (square + bottom-border inputs)
✓ dist/ant-design.css (thin borders + dense layout)
✓ dist/index.css (full bundle)
```

Fix any CSS `@apply` errors before continuing.

- [ ] **Step 4: Update `packages/cli/src/doctor.js`**

```js
const KNOWN_THEMES = [
  'rokkit',
  'minimal',
  'material',
  'glass',
  'grada-ui',
  'shadcn',
  'daisy-ui',
  'bits-ui',
  'carbon',
  'ant-design' // ← add
]
```

- [ ] **Step 5: Update `packages/cli/src/init.js` theme picker**

In `PROMPTS_CONFIG`, update the themes multiselect choices to include the new themes:

```js
{
  value: 'shadcn',
  label: 'shadcn',
  hint: 'flat borders + ring focus'
},
{
  value: 'daisy-ui',
  label: 'daisy-ui',
  hint: 'rounded-full + bold fills'
},
{
  value: 'bits-ui',
  label: 'bits-ui',
  hint: 'rounded-lg + polished'
},
{
  value: 'carbon',
  label: 'carbon',
  hint: 'square edges + enterprise dense'
},
{
  value: 'ant-design',
  label: 'ant-design',
  hint: 'thin borders + enterprise clean'
},
```

- [ ] **Step 6: Update `packages/cli/spec/doctor.spec.js`**

Update the test that checks `KNOWN_THEMES` ids (if it checks by name) or update any test that asserts on theme names.

- [ ] **Step 7: Update `packages/cli/spec/init.spec.js`**

If there's a test that enumerates available theme choices, add the 5 new themes to the expected list.

- [ ] **Step 8: Run CLI tests**

```bash
cd packages/cli && bun run test
```

Expected: all PASS.

- [ ] **Step 9: Run full test suite**

```bash
bun run test:ci
```

Expected: all tests PASS.

- [ ] **Step 10: Commit**

```bash
git add packages/themes/build.mjs packages/themes/package.json \
        packages/cli/src/init.js packages/cli/src/doctor.js \
        packages/cli/spec/doctor.spec.js packages/cli/spec/init.spec.js
git commit -m "feat(themes): wire 5 new themes into build, exports, CLI init + doctor"
```

---

## Chunk 3: Verification Page

### Files

| Action | Path                                                    | Responsibility                                      |
| ------ | ------------------------------------------------------- | --------------------------------------------------- |
| Create | `site/src/routes/(play)/playground/themes/+page.svelte` | Shows all components across all themes side-by-side |

**Run site:** `cd site && bun run dev` then open `http://localhost:5173/playground/themes`

---

### Task 10: Create the all-themes verification page

This page renders the same set of Rokkit components multiple times, once per theme, using `data-style` attribute on a wrapper div. No routing — all themes visible on one scrollable page.

- [ ] **Step 1: Create the page**

Create `site/src/routes/(play)/playground/themes/+page.svelte`:

```svelte
<script>
  const THEMES = [
    'rokkit',
    'minimal',
    'material',
    'glass',
    'grada-ui',
    'shadcn',
    'daisy-ui',
    'bits-ui',
    'carbon',
    'ant-design'
  ]
</script>

<svelte:head>
  <title>Theme Verification</title>
</svelte:head>

<div class="space-y-12 p-8">
  <h1 class="text-2xl font-bold">Theme Verification</h1>
  <p class="text-surface-z6">All components across all themes for visual inspection.</p>

  {#each THEMES as theme}
    <section data-style={theme} class="border-surface-z3 space-y-6 rounded-lg border p-6">
      <h2 class="text-surface-z7 font-mono text-lg font-semibold">{theme}</h2>

      <!-- Buttons -->
      <div class="space-y-2">
        <h3 class="text-surface-z5 text-sm tracking-wide uppercase">Buttons</h3>
        <div class="flex flex-wrap gap-2">
          <button data-button>Default</button>
          <button data-button data-variant="primary">Primary</button>
          <button data-button data-variant="secondary">Secondary</button>
          <button data-button data-variant="danger">Danger</button>
          <button data-button data-style="outline">Outline</button>
          <button data-button data-style="ghost">Ghost</button>
          <button data-button disabled>Disabled</button>
        </div>
      </div>

      <!-- Input -->
      <div class="space-y-2">
        <h3 class="text-surface-z5 text-sm tracking-wide uppercase">Input</h3>
        <input data-input type="text" placeholder="Type something..." class="w-64" />
      </div>

      <!-- Toggle -->
      <div class="space-y-2">
        <h3 class="text-surface-z5 text-sm tracking-wide uppercase">Toggle</h3>
        <div class="flex gap-4">
          <label data-toggle><input type="checkbox" /> Option A</label>
          <label data-toggle data-checked><input type="checkbox" checked /> Option B</label>
        </div>
      </div>

      <!-- Card -->
      <div class="space-y-2">
        <h3 class="text-surface-z5 text-sm tracking-wide uppercase">Card</h3>
        <div data-card class="w-64 p-4">
          <p class="text-surface-z7">Card content here</p>
        </div>
      </div>
    </section>
  {/each}
</div>
```

- [ ] **Step 2: Start the dev server and verify visually**

```bash
cd site && bun run dev
```

Open `http://localhost:5173/playground/themes` and verify each theme section renders distinctly.

- [ ] **Step 3: Commit**

```bash
git add site/src/routes/\(play\)/playground/themes/
git commit -m "feat(site): add theme verification page showing all themes side-by-side"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
bun run test:ci
```

Expected: all tests PASS, 0 errors.

- [ ] **Run lint**

```bash
bun run lint
```

Expected: 0 errors (warnings OK).

- [ ] **Build themes**

```bash
cd packages/themes && bun run build
```

Expected: all 11 themes build successfully.

- [ ] **Final commit if any remaining changes**

```bash
git add -A
git commit -m "chore: finalize theme system expansion"
```
