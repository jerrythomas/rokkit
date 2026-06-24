---
name: semantic-styles-rokkit
description: Use when building, styling, or auditing a Rokkit-powered app (Svelte 5 + UnoCSS presetRokkit) — covers the named-token vocabulary (paper / ink / primary / on-primary / *-soft), EXTENDING it with custom tokens via `overrides:` and the full palette ladder via `tokens: 'extended'`, the rokkit.config.js palette→skin→tokens pipeline, dual-palette dark mode, and the rokkit init / rokkit doctor CLI.
---

# Semantic Styles — Rokkit

Rokkit's token pipeline turns a small config into a consistent, themeable, dark-mode-ready
set of utility classes. Components use **named tokens** (`bg-paper`, `text-ink`,
`text-on-primary`) — never raw hex/oklch values. That indirection is the consistency
guarantee: change the config, the whole app reskins.

```
rokkit.config.js
  palettes + skin + colorSpace + tokens
       ↓
  UnoCSS preset (presetRokkit)  →  CSS custom properties + utility classes
       ↓
  Components use named-token utilities:  bg-paper · text-ink · bg-primary · text-on-primary
```

The pipeline has three layers. Most authoring happens in **Layer 3 (named tokens)**.

---

## Layer 1 — Palettes

**What:** A palette is a named 11-stop color scale from shade `50` (lightest) to `950`
(darkest), declared in `rokkit.config.js` under `palettes:`.

**Why:** Each role needs a range of shades so hover, active, tint-on-surface, and
text-on-fill all come from one color family. 11 stops gives resolution without banding.

**Two formats:**

*RGB hex* — standard web colors; use when you have an existing brand palette:
```js
palettes: { shu: { 50: '#FEF3EE', 500: '#E8552B', 950: '#3C100A' } }
// colorSpace: 'rgb' (default — may be omitted)
```

*OKLCH bare components* — perceptual, uniform lightness steps; best for palettes designed
from scratch (increment L by equal steps for balanced results):
```js
palettes: { shu: { 50: '0.970 0.020 35', 500: '0.580 0.150 35', 950: '0.220 0.060 35' } },
colorSpace: 'oklch'   // REQUIRED when palette values are bare "L C H" components
```

The preset wraps values into complete colors when it emits CSS vars (see Layer 3).

---

## Layer 2 — Skin and skins

**What:** A skin maps semantic role names to palette names. The core roles that back the
named-token vocabulary are: `surface`, `ink`, `primary`, `accent`, `success`, `warning`,
`danger`, `error`, `info`. (`secondary`/`tertiary` are accepted but no named token reads
them — they only matter if you opt into `tokens: 'extended'` for those roles.)

**Why:** Decoupling role from palette lets you swap the whole scheme in config, not code.
`bg-paper` doesn't know whether `surface` is `kami`, `slate`, or `zinc`.

### Single skin (`skin:`) — one fixed colormap
```js
skin: {
  surface: 'slate',  ink: 'slate',   // ink backs the ink-* text tokens
  primary: 'orange', accent: 'sky',
  success: 'green', warning: 'yellow', danger: 'red', error: 'red', info: 'cyan',
}
```
`colors:` is accepted as a back-compat alias but **prefer `skin:`**. Always include an
`ink` role — without it the `ink-*` text tokens silently fall back to the surface palette.

### Multi-skin (`skins:`) — named colormaps for runtime switching
```js
skins: {
  default: { surface: { light: 'kami', dark: 'sumi' }, ink: { light: 'kami', dark: 'sumi' }, primary: 'shu' },
  ocean:   { surface: 'slate', primary: 'sky', accent: 'teal' },
}
```
`skins.default` is active on first load. **Use `skin:` OR `skins:`, not both** — providing
`skins:` makes `skin:` ignored.

### `tokens:` — which CSS the preset emits
```js
tokens: 'core'      // default — emit the 24 named tokens (palette values inlined)
tokens: 'extended'  // also emit the full 11-shade ladder (--color-{role}-{shade}) per role
```
`'core'` is the default and what apps should use. Reach for `'extended'` only when you need
the full ladder (charts / data-viz). Per-role is allowed: `tokens: { surface: 'extended' }`.

---

## Layer 2b — Dual-palette dark mode (how the flip actually works)

**Named tokens flip in dark mode ONLY when the skin uses a dual-palette `{ light, dark }`
mapping for a role (or an override carries a `dark` value).** The preset emits a
`[data-mode="dark"]` block redefining the tokens **only then** — there is no automatic
z-flip in the themes CSS anymore.

```js
skin: {
  surface: { light: 'kami', dark: 'sumi' },   // ← emits the dark block
  ink:     { light: 'kami', dark: 'sumi' },
  primary: 'shu',                              // single palette — constant across modes (correct for an accent)
}
```

The trick is that the **dark palette is authored inverted** relative to the light one, so
the same shade index reads correctly per mode:

| token (shade) | light (`kami`)        | dark (`sumi`)         |
|---------------|-----------------------|-----------------------|
| `--paper` (50)  | `0.985…` (light bg)  | `0.170…` (dark bg)    |
| `--ink` (900)   | `0.220…` (dark text) | `0.940…` (light text) |

> **Gotcha:** a **single-palette** surface (e.g. `surface: 'slate'`) emits **no dark
> block → no flip** → effectively light-only. For dark mode, make `surface` and `ink`
> dual-palette (the canonical `kami`/`sumi` OKLCH pair, where `sumi` is authored inverted).
> The `rokkit init` "Zen-Sumi" starter ships this; the plain Tailwind starter does not.

Dark mode flips when `data-mode="dark"` is on `<html>`/`<body>` — see the wiring section
below for how to apply and persist that correctly.

---

## Applying & persisting the theme (don't hand-roll this)

**Never** hand-roll `data-mode` writes, `localStorage` save/load, or your own theme store.
The pattern is: the **`vibe` store** (`@rokkit/states`) holds reactive state; the
**`themable` action** (`@rokkit/actions`) syncs it to the DOM + storage; **`ThemeSwitcherToggle`**
(`@rokkit/app`) is the ready-made control.

**1. Wire the root once** (e.g. `+layout.svelte`). `themable` loads from storage on mount,
writes `data-style`/`data-mode`/`data-density` (mirrored to `<html>` to match the
flash-prevention init script), **saves on every change**, and syncs across tabs via the
`storage` event:

```svelte
<script>
  import { vibe } from '@rokkit/states'
  import { themable } from '@rokkit/actions'
</script>
<svelte:body use:themable={{ theme: vibe, storageKey: 'app-theme' }} />
```

**2. Add the mode control** anywhere — it drives `vibe.mode`, which `themable` then writes:

```svelte
<script>import { ThemeSwitcherToggle } from '@rokkit/app'</script>
<ThemeSwitcherToggle variant="single" />                 <!-- one button, cycles light ↔ dark -->
<ThemeSwitcherToggle variant="triad" />                  <!-- group: system | light | dark (default) -->
<ThemeSwitcherToggle variant="triad" includeSystem={false} />  <!-- group: light | dark -->
```

**3. Switch the visual style** by setting state — no DOM writes:
```svelte
<button onclick={() => (vibe.style = 'minimal')}>Minimal</button>
```

**4. Prevent the flash on first paint.** Inject the pre-paint script so the persisted
theme applies before first render. SvelteKit apps use the SSR `themeHook`; static apps use
the script `rokkit init` writes into `app.html`:

```js
// src/hooks.server.ts
import { themeHook } from '@rokkit/unocss/hooks'
export const handle = themeHook({ storageKey: 'app-theme', defaultMode: 'system' })
```

`defaultMode: 'system'` (also the default when omitted) resolves `prefers-color-scheme`
to a concrete `light`/`dark` pre-paint — never an invalid `data-mode="system"`. `'auto'`
is accepted as a legacy alias. (Requires `@rokkit/unocss` ≥ 1.1.12.)

`vibe` (singleton) exposes reactive `mode` (`light`|`dark`), `style`
(`rokkit`|`minimal`|`material`), `density` (`compact`|`comfortable`|`cozy`), `direction`,
plus `load(key)` / `save(key)` / `update(partial)`. `ThemeSwitcherToggle` lives in
`@rokkit/app` (the store-wired shell package), built on `@rokkit/ui`'s `Toggle`; it adds
`system` on top of `vibe.mode` via `ColorModeManager` (resolving `system` through
`prefers-color-scheme`). The `storageKey` must be the same everywhere — `themable`,
`ThemeSwitcherToggle`'s store, and the flash-prevention script (step 4).

---

## Layer 3 — Named tokens (what components use)

The 24-token core vocabulary, all flipping automatically under `[data-mode="dark"]`:

| Group   | Tokens                                                  | Use                                              |
|---------|---------------------------------------------------------|--------------------------------------------------|
| Surface | `paper` · `paper-soft` · `paper-mute` · `paper-edge`    | canvas · card · subdued panel · hairline border  |
| Text    | `ink` · `ink-mute` · `ink-soft` · `ink-faint`           | body · secondary · placeholder · disabled        |
| Primary | `primary` · `on-primary`                                | CTA fill · text/icon on a primary fill           |
| Accent  | `accent` · `accent-soft`                                | accent fill · tinted accent background           |
| Status  | `success`/`-soft`, `warning`/`-soft`, `danger`/`-soft`, `error`/`-soft`, `info`/`-soft` | solid status · tinted callout bg |
| Misc    | `focus-ring` · `shadow-tint`                            | focus ring color · shadow color                  |

**Prefixes:** `bg-`, `text-`, `border-` (+ `border-t/-b/-l/-r`), `fill-`, `stroke-`,
`ring-`, `outline-`, `divide-`. Two constraints: `on-primary` emits **text only**
(`text-on-primary`); `focus-ring` emits ring/outline/border/divide only; `shadow-tint`
emits no utility (used inside `box-shadow` expressions).

```html
<!-- card -->
<div class="bg-paper-soft border border-paper-edge rounded-md p-4">
  <h3 class="text-ink text-sm font-medium">Title</h3>
  <p class="text-ink-mute text-xs mt-1">Description</p>
</div>

<!-- primary button + status badge -->
<button class="bg-primary text-on-primary rounded-md px-3 py-2">Save</button>
<span class="bg-success-soft text-success text-xs px-2 py-0.5 rounded-full">Active</span>

<!-- input -->
<input class="bg-paper border border-paper-edge text-ink rounded-md px-3 py-2
              focus:border-primary focus:outline-none text-[13px]" />
```

### CSS custom properties

Named tokens emit `--{token}` vars holding **complete color values** —
`--paper: oklch(0.985 0.005 85)` (oklch) or `--primary: rgb(232, 85, 43)` (rgb). Use them
directly in CSS-only contexts; for alpha, use `color-mix` (the form the preset itself uses):
```css
.thing      { background: var(--paper); border-color: var(--paper-edge); }
.thing-50pc { background: color-mix(in oklch, var(--primary) 50%, transparent); }
```
Prefer utility classes over raw vars where you can.

---

## Layer 3b — Extending the vocabulary (`overrides` + `tokens: extended`)

**The named-token set is the _default_ vocabulary, not a hard limit.** When a design needs
a token the core set lacks — a second accent tone, a dedicated `on-accent` text color, a
divider-line color — add it. Don't conclude "core only has `accent`/`accent-soft`, so this
can't be expressed." Two mechanisms:

### `overrides:` — add (or retune) named tokens

`overrides` is a `{ name: value }` map in `rokkit.config.js`. Each entry emits a `--<name>`
CSS var **and** auto-generates color utilities for it. Value forms:

- **Palette reference** — `'<palette>.<shade>'`, **dot notation** (`'sky.600'`, NOT
  `'sky-600'`). The palette must be one you declared in `palettes:` (see the gotcha below).
- **Raw color** — any CSS color string: `'#0ea5e9'`, `'oklch(0.55 0.13 245)'`.
- **Per-mode** — `{ light, dark }`, each side a palette ref or raw color. Including a `dark`
  side emits/extends the `[data-mode="dark"]` block so the token flips automatically.

```js
// rokkit.config.js
overrides: {
  'accent-2':    'sky.600',                              // a second, deeper accent tone
  'on-accent':   'kami.50',                              // readable text on an accent fill
  'accent-line': { light: 'sky.200', dark: 'sky.800' }, // divider that flips per mode
  'brand-ring':  'sky.500',                              // a custom focus ring (see -ring rule)
  'paper-edge':  'oklch(0.62 0.02 245)',                 // RETUNE a reserved token (see below)
}
```

This makes `bg-accent-2` · `text-accent-2` · `border-accent-2` · `text-on-accent` ·
`border-accent-line` · `ring-brand-ring` … all real utilities, plus `var(--accent-2)` etc.
in CSS.

**Generated prefixes** (per color-valued override): `bg-`, `text-`, `border-`
(+ `border-t/-b/-l/-r`), `outline-`, `fill-`, `stroke-`. **`ring-<name>` is emitted only
when the name ends in `-ring`** (e.g. `brand-ring` → `ring-brand-ring`).

**Reserved-name overrides win.** Naming an override after a built-in token (`paper-edge`,
`accent`, `focus-ring`, …) replaces that token's skin-derived value — the way to retune one
token without touching the palette. Reserved names already own their utilities, so no extra
shortcut is generated for them; the override only changes the value.

> **Gotcha — palette refs resolve against your `palettes:` block, not Tailwind's built-in
> names.** `'sky.600'` works only if `sky` is declared in `palettes:`. If a role uses a
> Tailwind palette purely by name (`skin: { accent: 'sky' }` with no `palettes.sky`), either
> declare that palette in `palettes:` or give the override a raw color / `{ light, dark }`
> value. An unknown palette or shade throws at build time.

### `tokens: 'extended'` — expose the full palette ladder

When you want *arbitrary shades* of a role rather than a few named tokens, switch that role
(or the whole config) to `extended`. It emits the full 11-shade ladder as
`--color-{role}-{shade}` vars + `bg-/text-/border-…-{role}-{shade}` utilities:

```js
tokens: { accent: 'extended' }   // → bg-accent-600, text-accent-300, var(--color-accent-700), …
// or globally: tokens: 'extended'
```

**Which to reach for:** `overrides` for a *small set of semantic* tokens (`on-accent`,
`accent-line`) — they read as intent and survive a palette swap. `extended` for
*programmatic* shade access (charts, data-viz, a component that walks the whole ramp).
Default stays `'core'`.

---

## Rokkit CLI — `init` and `doctor`

**`rokkit init`** scaffolds `rokkit.config.js` in the named-token shape (a header comment
documents the vocabulary). Two starters via the palette prompt:
- **Tailwind (rgb)** — `skin` of Tailwind palette names, `colorSpace: 'rgb'`, `tokens: 'core'`. Single-palette → light-leaning (see Layer 2b).
- **Zen-Sumi (OKLCH)** — ships `palettes` (kami/sumi/shu/…), `colorSpace: 'oklch'`, dual-palette `surface`/`ink` → full dark mode out of the box.

**`rokkit doctor`** validates an existing setup. Beyond file checks (config exists,
`uno.config.js` uses `presetRokkit(config)`, `app.css` imports a theme, `app.html` has the
mode init script), it runs **advisory** config-shape warnings and migration hints — none
fail the command or block `--fix`:

| Check | Warns when |
|-------|-----------|
| `skin-ink-role` | the active colormap has no `ink` role (text tokens fall back) |
| `oklch-needs-palettes` | `colorSpace: 'oklch'` but no `palettes` block |
| `colors-alias` | config uses the legacy `colors:` instead of `skin:` |

The "active colormap" is resolved the same way the preset does: `skins.default ?? skin ??
colors`. Run `rokkit doctor --fix` to auto-write a real starter config when one is missing.

---

## Typography configuration

Set faces in config; the preset emits CSS vars and Tailwind `fontFamily` keys.
```js
typography: {
  display: "'Fraunces', 'Iowan Old Style', Georgia, serif",  // heading/display face
  sans:    "'Inter', system-ui, sans-serif",                 // UI/body face (alias: `ui`)
  mono:    "'JetBrains Mono', 'SF Mono', Menlo, monospace",
}
```
Canonical config keys are `display` / `ui` / `mono`; `heading` / `sans` are accepted
aliases. Usage classes: `font-heading` (display face), `font-body` (UI face), `font-mono`.
```html
<h1 class="font-heading text-2xl text-ink">Page Title</h1>
<p  class="font-body text-[13px] text-ink-mute">Description</p>
<code class="font-mono text-xs text-ink-soft">path/to/file.ts</code>
```

---

## Shape / radius configuration

`shape: { radius: 'soft' }` selects a preset emitting `--radius-{sm,md,lg,xl,full}`.

| Preset | sm | md | lg | xl | full | Personality |
|--------|----|----|----|----|------|-------------|
| `sharp` | 0 | 0 | 0 | 0 | 9999px | Minimal, editorial |
| `soft` | 2px | 6px | 10px | 12px | 9999px | Professional, calm |
| `rounded` | 4px | 8px | 12px | 16px | 9999px | Friendly, modern |
| `pill` | 9999px | 9999px | 9999px | 9999px | 9999px | Playful, pill-native |

Custom: `shape: { radius: { sm: '2px', md: '6px', lg: '10px', xl: '14px', full: '9999px' } }`.
Use the Tailwind radius utilities that map to the vars (`rounded-md`, `rounded-lg`, …) —
never `rounded-[6px]`, which bypasses the config.

---

## Spacing

Rokkit inherits Tailwind's 4px-grid spacing. **Stay on the 4px grid, use Tailwind names.**

| Tailwind | px | When |
|----------|----|------|
| `1` / `2` / `3` | 4 / 8 / 12 | tight gap · component gap · compact padding |
| `4` / `6` | 16 / 24 | default padding · panel padding |
| `8` / `12` / `16` | 32 / 48 / 64 | section separation · page padding · hero whitespace |

Density: **compact** (tables/sidebars) `gap-1`/`gap-2`, `p-2`/`p-3`; **comfortable**
(cards/forms) `gap-3`/`gap-4`, `p-4`/`p-6`; **relaxed** (marketing) `16–24px+`.

---

## Full config example

```js
// rokkit.config.js
export default {
  palettes: {
    kami: { 50: '0.985 0.005 85', /* … */ 950: '0.170 0.010 50' },  // light surface (warm paper)
    sumi: { 50: '0.170 0.010 50', /* … */ 950: '0.975 0.008 85' },  // dark surface (inverted ink)
    shu:  { 50: '0.970 0.020 35', 500: '0.580 0.150 35', 950: '0.220 0.060 35' },  // accent
  },
  colorSpace: 'oklch',          // required for bare "L C H" palette values
  tokens: 'core',               // emit the named-token vocabulary (default)
  skin: {
    surface: { light: 'kami', dark: 'sumi' },   // dual-palette → dark mode
    ink:     { light: 'kami', dark: 'sumi' },
    primary: 'shu', accent: 'shu',
    success: 'hisui', warning: 'kohaku', danger: 'shu', error: 'shu', info: 'kohaku',
  },
  typography: { display: "'Fraunces', Georgia, serif", sans: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
  shape: { radius: 'soft' },
  switcher: 'full',             // 'system' | 'manual' | 'full'
  storageKey: 'app-theme',
}
```

---

## Common mistakes

| Mistake | Why it fails | Fix |
|---|---|---|
| "core only emits `accent`/`accent-soft`, so I can't have `accent-2`/`on-accent`" | the vocabulary is extensible, not fixed | add them under `overrides:` (or use `tokens: 'extended'`) — see Layer 3b |
| Override palette ref `'sky-600'` (hyphen) | refs use **dot** notation | `'sky.600'` (and `sky` must be in `palettes:`) |
| `color: #3D3730` in a component | breaks on theme change | `text-ink` (or the right named token) |
| Single-palette `surface` but expecting dark mode | no `[data-mode]` block is emitted | make `surface`/`ink` dual-palette `{ light, dark }` |
| Skin with no `ink` role | `ink-*` text tokens fall back to surface | add `ink: '<palette>'` (reuse surface is fine) |
| Using `skin:` and `skins:` together | `skins:` silently wins | pick one |
| `oklch(0.58 0.15 35)` literal in a component | loses theming + composability | `bg-primary` / `var(--primary)` |
| Double-wrapping in core mode: `oklch(var(--paper))` | `--paper` is already a complete color | use `var(--paper)` directly |
| `colorSpace: 'oklch'` with hex palettes (or vice-versa) | wrap form won't match values | match `colorSpace` to the palette format |
| `border-radius: 6px` / `font-family: 'Inter'` hardcoded | bypasses shape/typography config | `rounded-md` / `font-body` |
| `@apply bg-paper` on `body {}` | descendant-combinator shortcut can't match `body` when `data-mode` is on it | `body { background: var(--paper); }` |
