# Trimmed Token Vocabulary — Design

**Status:** Draft for review
**Date:** 2026-05-15
**Owner:** Jerry

## Goal

Shrink Rokkit's emitted CSS token surface from ~120 vars (`--color-{role}-{shade}` × 11 roles × 11 shades) to ~18 named semantic vars by default, while keeping the full 11-shade scale available as an opt-in. Replace numeric `-z` slots with readable named tokens (`--ink-mute` instead of `--ink-z7`), and make `@apply`-heavy theme CSS unnecessary by emitting raw `var(--…)` references that work across nested scopes and shadow DOM.

## Motivation

- The current preset emits ~120 color CSS vars per skin. Empirically, base themes use only ~10 distinct slots: `surface-z0..z4`, `primary-z5`, status `z1/z5/z7`.
- `z2` vs `z3` carries no readable meaning. `ink-mute`, `ink-soft`, `ink-faint` do.
- The zen-sumi mockup tokens (`/sensei-hq/sensei/docs/mockups/lib/tokens.css`) already prove an 18-var vocabulary suffices for a full design system.
- `@apply bg-surface-z1` is fragile across nested style scopes; `background: var(--paper-soft)` is universally robust.
- App-level concerns (canvas grids, mockup tooling) need a way to declare custom CSS vars without polluting the component vocabulary.

## Named Vocabulary (canonical emit set)

18 named CSS vars, grouped by role:

| Group   | Tokens                                               |
| ------- | ---------------------------------------------------- |
| Surface | `--paper`, `--paper-soft`, `--paper-mute`, `--paper-edge` |
| Ink     | `--ink`, `--ink-mute`, `--ink-soft`, `--ink-faint`   |
| Primary | `--primary`, `--on-primary`                          |
| Accent  | `--accent`, `--accent-soft`                          |
| Status  | `--success`, `--success-soft`, `--warning`, `--warning-soft`, `--danger`, `--danger-soft` |
| Misc    | `--focus-ring`, `--shadow-tint`                      |

Ink ladder semantics: `ink` = primary text, `ink-mute` = secondary text, `ink-soft` = placeholder, `ink-faint` = disabled.
Surface ladder: `paper` = canvas, `paper-soft` = card bg, `paper-mute` = subdued panel, `paper-edge` = hairline border tone.
`*-soft` variants are the tinted-bg companion (status callouts, accent chips).

## Named → Palette Shade Mapping

Default resolution from the role's palette (the `skin` decides which palette backs each role):

| Named slot       | Palette shade |
| ---------------- | ------------- |
| `--paper`        | 50            |
| `--paper-soft`   | 100           |
| `--paper-mute`   | 200           |
| `--paper-edge`   | 400           |
| `--ink`          | 900           |
| `--ink-mute`     | 700           |
| `--ink-soft`     | 500           |
| `--ink-faint`    | 300           |
| `--primary`      | 500           |
| `--accent`       | 500           |
| `--success`      | 500           |
| `--warning`      | 500           |
| `--danger`       | 500           |
| `--*-soft`       | 100 / @ 0.12 alpha (mode-dependent — see below) |
| `--on-primary`   | derived: paper of inverted ink (high-contrast pair) |
| `--focus-ring`   | accent.500                                    |
| `--shadow-tint`  | ink.900 @ 0.06 alpha                          |

`*-soft` resolution: use shade 100 in light mode, shade 900 @ 0.2 alpha in dark mode (matches sumi mockup `--accent-soft: oklch(... / 0.12)`).

## Wiring Strategy: Trim-with-Aliases

### Core mode (default)

The preset emits two layers; **the underlying `--color-{role}-{shade}` palette vars (50..950) are not emitted as CSS variables**. Palette values are resolved at preset-load and **inlined** into the named layer.

1. **Named layer** (canonical, 18 vars) — palette values inlined directly.
2. **Z-alias layer** (back-compat) — `--color-{role}-z{n}` aliases pointing into the named layer. Multiple z-slots collapse to the same named slot.

```css
:root {
  /* Named (canonical) — palette values INLINED, no intermediate var */
  --paper:      oklch(0.985 0.005 85);   /* from kami.50 */
  --paper-soft: oklch(0.975 0.008 85);   /* from kami.100 */
  --paper-mute: oklch(0.955 0.010 85);   /* from kami.200 */
  --paper-edge: oklch(0.850 0.010 70);   /* from kami.400 */
  --ink:        oklch(0.220 0.012 50);   /* from kami.900 */
  --ink-mute:   oklch(0.380 0.012 50);   /* from kami.700 */
  --ink-soft:   oklch(0.580 0.010 50);   /* from kami.500 */
  --ink-faint:  oklch(0.920 0.012 85);   /* from kami.300 */
  /* …primary, accent, status, focus-ring, shadow-tint */

  /* Z-aliases (back-compat) — point at named layer, NOT at palette vars */
  --color-surface-z0:  var(--paper);
  --color-surface-z1:  var(--paper-soft);
  --color-surface-z2:  var(--paper-mute);
  --color-surface-z3:  var(--paper-mute);   /* collapsed */
  --color-surface-z4:  var(--paper-edge);
  --color-surface-z5:  var(--ink-soft);
  --color-surface-z6:  var(--ink-soft);     /* collapsed */
  --color-surface-z7:  var(--ink-mute);
  --color-surface-z8:  var(--ink-mute);     /* collapsed */
  --color-surface-z9:  var(--ink);
  --color-surface-z10: var(--ink);          /* collapsed */
  /* analogous for --color-ink-z*, with the inverted z-scale */
}
```

Custom token references like `custom: { canvas: 'kami.50' }` still work because the **palette definition** lives in `rokkit.config.js` (loaded by the preset) — the resolver looks up `kami.50` at preset-load and emits the resolved value directly: `--canvas: oklch(0.985 0.005 85);`. No `--color-surface-50` palette var is needed in CSS for this.

### Extended mode (opt-in)

In **extended mode**, the preset emits the full 11-shade palette per role (today's behavior preserved), and named tokens become CSS-var aliases pointing at the corresponding shade. This is the path for chart/data-viz themes that genuinely need 11 tones.

```css
:root {
  /* Full palette (today's emit) */
  --color-surface-50:  oklch(0.985 0.005 85);
  --color-surface-100: oklch(0.975 0.008 85);
  /* …through 950 */
  --color-surface-z0:  var(--color-surface-50);
  --color-surface-z1:  var(--color-surface-100);
  /* …through z10 */

  /* Named layer as aliases into the palette */
  --paper:      var(--color-surface-50);
  --paper-soft: var(--color-surface-100);
  --paper-mute: var(--color-surface-200);
  --paper-edge: var(--color-surface-400);
  /* … */
}
```

### Emit-size comparison

| Mode      | Palette vars | Named vars | Z-aliases | Total / skin |
| --------- | ------------ | ---------- | --------- | ------------ |
| Today     | ~120         | 0          | 0         | ~120         |
| `core`    | **0**        | 18         | ~22       | **~40**      |
| `extended`| ~120         | 18 (alias) | 0         | ~140         |

```js
presetRokkit({
  tokens: 'core'         // default — 18 named + z-aliases (collapsed)
})

presetRokkit({
  tokens: 'extended'     // full 11-shade z-scale per role + named aliases
})

presetRokkit({
  tokens: { surface: 'extended', ink: 'core', primary: 'core' }  // per-role
})
```

### Z-collapse table (core mode)

| Z-slot | Surface role  | Ink role (inverted) |
| ------ | ------------- | ------------------- |
| z0     | `paper`       | `ink`               |
| z1     | `paper-soft`  | `ink-mute`          |
| z2     | `paper-mute`  | `ink-mute`          |
| z3     | `paper-mute`  | `ink-soft`          |
| z4     | `paper-edge`  | `ink-soft`          |
| z5     | `ink-soft`    | `paper-edge`        |
| z6     | `ink-soft`    | `paper-edge`        |
| z7     | `ink-mute`    | `paper-mute`        |
| z8     | `ink-mute`    | `paper-mute`        |
| z9     | `ink`         | `paper-soft`        |
| z10    | `ink`         | `paper`             |

Authors who used distinct z2/z3 styling in core mode will see them render identically — this is the contract. Migrate to named or opt into `extended` to recover the distinction.

## Custom Tokens

App-level CSS vars that components never read but apps need. Declared via a new `tokens` config block (separate from the `tokens: 'core' | 'extended'` mode switch — see Open Questions for naming).

```js
presetRokkit({
  palettes: { ... },
  skin:     { surface: 'kami', primary: 'shu', ... },
  custom: {                                  // ← custom user tokens
    canvas:        'kami.50',                // palette ref → resolved
    'canvas-grid': '#d4d4d4',                // raw value passes through
    'canvas-bleed': { light: 'kami.100', dark: 'sumi.900' },  // mode-aware
    'tauri-traffic-red': 'oklch(0.72 0.14 28)'
  }
})
```

**Resolution rules:**
- `'palette.shade'` string → resolved via the same `colorSpace` adapter as named tokens.
- Plain string → passes through verbatim (`oklch(...)`, `#hex`, `rgb()`, `var(...)`).
- `{ light, dark }` → mode-aware, emitted into `:root` and `[data-mode="dark"]` respectively.
- Token names that collide with reserved core names (any of the 18 named + `on-*` pairs) → **error at config load**. Override core slots via `skin` palette mapping, not `custom`.

**Uno shortcuts for custom tokens:** auto-emit `bg-{name}`, `text-{name}`, `border-{name}` when the resolved value is a color (heuristic: starts with `oklch(`, `rgb(`, `hsl(`, `#`, or resolves from a palette). Non-color values (`8px`, `1.2s`, `url(...)`) emit only the CSS var, no shortcut.

## Uno Shortcuts for Named Layer

Auto-emit for every named token:

```
bg-paper        → background: var(--paper)
bg-paper-soft   → background: var(--paper-soft)
bg-paper-mute   → background: var(--paper-mute)
text-ink        → color: var(--ink)
text-ink-mute   → color: var(--ink-mute)
border-paper-edge → border-color: var(--paper-edge)
bg-success-soft → background: var(--success-soft)
ring-focus      → outline: 1.5px solid var(--focus-ring); outline-offset: 2px
```

Alpha variants follow Uno convention: `bg-paper-mute/50` → `background: color-mix(in srgb, var(--paper-mute) 50%, transparent)`.

The existing `bg-{role}-z{n}` shortcuts continue to work — they resolve through the z-alias layer.

## Dark Mode

Same emission model. The skin defines `{ light, dark }` palettes per role (today's behavior). The preset emits:

```css
:root { /* named + z-aliases resolved from light palettes */ }
[data-mode="dark"] { /* same names, resolved from dark palettes */ }
```

Z-aliases are mode-stable (they always point at the named layer; the named layer flips with mode).

## Config Shape (final)

```js
// rokkit.config.js
export default {
  palettes: { kami: {…}, shu: {…}, hisui: {…}, kohaku: {…}, sumi: {…} },
  colorSpace: 'oklch',

  skin: {
    surface:   { light: 'kami', dark: 'sumi' },
    ink:       { light: 'kami', dark: 'sumi' },
    primary:   'shu',
    accent:    'shu',
    success:   'hisui',
    warning:   'kohaku',
    danger:    'shu'
  },

  tokens: 'core',         // 'core' | 'extended' | { surface: 'core', primary: 'extended', … }

  custom: {               // app-level tokens, never read by components
    canvas:        'kami.50',
    'canvas-grid': '#d4d4d4'
  },

  shape: { radius: 'soft' },
  typography: { … },
  // …
}
```

## Migration Path

Z-aliases exist as **back-compat insurance, not permanent overhead**. CSS minifiers do not collapse `--color-surface-z0: var(--paper)` indirection (custom properties are runtime, scope-sensitive constructs), so the chain stays in the emitted CSS. The strategy is to retire the alias emit once nothing references it.

1. **Release 1 — Preset change.** Add named emit + z-alias layer behind `tokens: 'core'` (default). Uno shortcuts (`bg-surface-z1`) expand directly to `background: var(--paper-soft)` (not through the alias) at preset-build time, so generated utility classes already use named vars. The z-alias CSS layer only matters for raw `var(--color-surface-z*)` references in hand-written CSS. Existing themes still compile against the aliases.
2. **Release 1.x — Base themes migrate.** `packages/themes/src/base/*.css` shifts from `@apply bg-surface-z1` to `bg-paper-soft` (Uno) or `background: var(--paper-soft)` (raw, shadow-DOM-safe). Gradual, file-by-file.
3. **Release 1.x — Style themes migrate.** `zen-sumi/*.css` etc. migrate similarly. Themes that need shade distinctions outside the core 4 surface tones opt into `tokens: { surface: 'extended' }` for their data-style scope.
4. **Release 1.x — Demo / site migrate.** Adopt named tokens in custom CSS, replace any hardcoded `--color-surface-z3` references.
5. **Release 2 — Drop z-alias emit.** Once no first-party code references raw `--color-surface-z*` vars, the preset stops emitting them in `core` mode. The 18-var floor is reached. Extended mode preserves z-aliases as today, since chart/data-viz themes legitimately need the full scale.

Per-release emit size:

| Release | Emit per skin (core mode) |
| ------- | ------------------------- |
| Today   | ~120                      |
| 1 (transition) | ~40 (18 named + ~22 z-aliases) |
| 2 (steady state) | ~18 (named only)    |

## Out of Scope

- Changing the `palettes` definition format (still `{ 50, 100, …, 950 }` raw OKLCH/RGB strings).
- Density/typography/radius tokens — unchanged.
- Chart-specific palette assignment — separate concern, may use `extended` mode.
- Component refactor — themes migrate at their own pace.

## Open Questions

1. **Config key name for the custom block.** This spec uses `custom`. Alternatives: `userTokens`, `vars`, `extras`. `custom` is shortest but vague. Confirm preference before implementation.
2. **`tokens: 'core' | 'extended'` vs. boolean `extended: true`.** Spec uses the former; a single boolean is shorter but loses the per-role granularity.
3. **`on-primary` resolution.** Spec uses "paper of inverted ink palette." For most skins (`primary: 'shu'`), this means `--on-primary = white-ish from the surface palette`. Alternative: explicit contrast-pair declaration per skin. Default-derive seems sufficient given that 90% of skins want white-on-primary.
4. **`shadow-tint` usage.** Listed in vocabulary but no theme currently consumes it. Keep for the sumi mockup parity (`--shadow: 0 1px 3px oklch(0.22 0.012 50 / 0.06)` derived from it) or drop until needed.

## Success Criteria

- Default preset emits ≤ 25 color CSS vars per skin (18 named + ~6 z-aliases per role that don't collapse to named).
- `packages/themes/src/base/*.css` can be rewritten to use named vars with zero loss of expressivity for the current component set.
- A new app can declare 3 custom tokens (`canvas`, `canvas-grid`, `canvas-bleed`) without writing any non-config CSS to get them globally available.
- Migrating one existing base theme file (e.g., `base/button.css`) requires only token renames, no logic changes.
- Existing site + demo + zen-sumi theme render identically before and after the migration (z-aliases preserve behavior).
