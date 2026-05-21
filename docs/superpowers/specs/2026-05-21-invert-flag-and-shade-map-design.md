# Role-Level `invert` Flag + Unified Shade Map — Design

**Status:** Draft for review
**Date:** 2026-05-21
**Owner:** Jerry

## Goal

Make the trimmed-token vocabulary work correctly across light + dark modes for surface- and ink-style roles, **without coupling behavior to specific role names**. Replace the hardcoded `INVERTED_ROLES = new Set(['ink'])` with a configurable per-role `invert: true` flag. As part of the change, unify `NAMED_TOKEN_SHADE_MAP` so all paper- and ink-family tokens read shades from the low end of the palette; the `invert` flag flips reads to the high end via `1000 - shade`.

## Motivation

Today's named-token system has three coupled problems:

1. **Role-name-coupled inversion.** The `INVERTED_ROLES` constant in `@rokkit/core/constants` hardcodes the role name `'ink'`. A user who aliases their role `'pen'` (or names it `'graphite'`) loses the inversion entirely.

2. **Asymmetric shade map for ink vs paper.** `paper` uses shades `[50, 100, 200, 400]` (low end). `ink` uses `[900, 700, 500, 300]` (high end, irregular spread). The asymmetry forces ink-side palettes to be defined inverted-convention (50 = darkest) before the named tokens resolve correctly in dark mode — currently worked-around by manually inverting `sumi` in the demo config.

3. **Mid-shade collision risk.** `ink-soft` reads shade `500`. If a surface or layer is also at shade 500 (e.g., via `--color-surface-z5`), the text becomes invisible.

## Design

### Per-role `invert: true`

The skin config's role mapping accepts an optional `invert` field:

```js
skin: {
  surface: { light: 'kami', dark: 'sumi' },              // no invert
  ink:     { light: 'kami', dark: 'sumi', invert: true }, // inverted
  primary: 'shu',                                          // no invert
  accent:  'shu',
  ...
}
```

Semantics: **a role with `invert: true` reads palette shades from the opposite (high) end of the palette.** Concretely, if `NAMED_TOKEN_SHADE_MAP[token] = shade`, the resolved palette index for inverted roles is `1000 - shade`.

The flag applies symmetrically across modes — the math is `1000 - shade` regardless of light/dark.

### Unified low-end shade map

`NAMED_TOKEN_SHADE_MAP` changes so paper- and ink-family tokens all use low-end shades:

| Token | Current shade | New shade | Inverted (via flag, `1000 - shade`) |
| --- | --- | --- | --- |
| `paper`      | 50  | 50  | — |
| `paper-soft` | 100 | 100 | — |
| `paper-mute` | 200 | 200 | — |
| `paper-edge` | 400 | 400 | — |
| `ink`        | 900 | **50**  | **950** |
| `ink-mute`   | 700 | **100** | **900** |
| `ink-soft`   | 500 | **200** | **800** |
| `ink-faint`  | 300 | **400** | **600** |

Visual impact of changing ink's resolved shades:

- `ink`: 900 → 950 (one step darker, marginal)
- `ink-mute`: 700 → 900 (significantly darker — was secondary text, now closer to primary)
- `ink-soft`: 500 → 800 (significantly darker — was placeholder, now closer to mute)
- `ink-faint`: 300 → 600 (moderately darker — was barely-visible, now more readable)

This compresses the ink ladder visibly. Mitigation discussed under "Ink palette flatness" below.

**Shade 500 is no longer touched by any named token.** `paper-edge` (400) and `ink-faint` (600 after invert) sit on opposite sides of 500. Eliminates the 500-on-500 collision.

### Palette conventions

Two conventions stay valid:

- **Light-to-dark palette** (Tailwind convention): 50 = lightest, 950 = darkest. Used for light-mode primary surfaces.
- **Dark-to-light palette** (inverted): 50 = darkest, 950 = lightest. Used for dark-mode primary surfaces.

A dual-palette role like `surface: { light: 'kami', dark: 'sumi' }` requires:
- The `light` palette follows light-to-dark convention.
- The `dark` palette follows dark-to-light convention.

This is the implicit contract today (after the 2026-05-20 fix that inverted sumi); it becomes documented and explicit.

### Worked examples

**Light mode, `surface: kami, ink: { palette: kami, invert: true }` (single-palette demo):**

| Token | Shade map | Invert | Palette index | Resolved (kami) |
| --- | --- | --- | --- | --- |
| `paper`      | 50  | no  | 50  | lightest |
| `paper-mute` | 200 | no  | 200 | light-mid |
| `ink`        | 50  | yes | 950 | darkest |
| `ink-soft`   | 200 | yes | 800 | dark-mid |

Light bg, dark text. ✓

**Dark mode, `surface: { light: kami, dark: sumi }, ink: { light: kami, dark: sumi, invert: true }` (dual-palette):**

| Token | Shade map | Invert | Palette index | Resolved (sumi, inverted convention) |
| --- | --- | --- | --- | --- |
| `paper`      | 50  | no  | 50  | darkest sumi (canvas) |
| `paper-mute` | 200 | no  | 200 | dark-mid |
| `ink`        | 50  | yes | 950 | lightest sumi (warm paper) |
| `ink-soft`   | 200 | yes | 800 | light-mid |

Dark bg, light text. ✓

**Mixing it up — `ink: { light: 'sumi', dark: 'kami' }` (palette-swap, no invert flag):**

This is the alternative pattern the user noted. Works without `invert: true` because the palette swap *already* puts the right shades on each side:

| Token | Shade map | Light (sumi) | Dark (kami) |
| --- | --- | --- | --- |
| `ink` | 50 | sumi.50 = darkest sumi (dark text on light bg) | kami.50 = lightest kami (light text on dark bg) |

Both palette-swap and `invert: true` are valid encodings of the same intent. `invert: true` is more flexible (works with single-palette skins too).

### Ink palette flatness (recommendation)

The new shade map reads ink-side tokens at `[950, 900, 800, 600]`. These are bunched at the dark end of a Tailwind-style palette, which reduces visual differentiation between `ink-mute`, `ink-soft`, and `ink-faint`.

Recommendation: when designing palettes intended for ink-style use (i.e., to be read at the high-end shades via invert), define them with **compressed lightness** at the bunched end. For kami, that means making shades 600, 800, 900, 950 visually distinct enough to read as four hierarchy levels.

This is a *design guideline*, not a system change. Documented in `docs/design/06-themes.md` (to be updated).

### Z-aliases stay compatible

`Z_COLLAPSE_MAP_SURFACE` and `Z_COLLAPSE_MAP_INK` continue to map z-slots to named tokens by *semantic intent*:

```ts
Z_COLLAPSE_MAP_INK: {
  z0: 'ink',       // primary text
  z1: 'ink-mute',
  ...
  z10: 'paper'
}
```

These remain unchanged. The named tokens they point at resolve through the new shade map + invert flag, so z-aliases continue working without modification.

## Out of scope

- Auto-detect palette direction (rejected — relies on lightness parsing that's fragile across color spaces).
- Replacing the named-token vocabulary itself (the 24 names are locked).
- Per-token invert override (e.g., "ink uses invert but ink-faint doesn't"). Inversion is per-role only.

## Migration impact

### Inside the repo

- Every test that asserts `NAMED_TOKEN_SHADE_MAP['ink']` equals a specific value → update.
- Every test that asserts resolved `--ink` is a specific palette value → re-verify with new math.
- `INVERTED_ROLES.has(role)` call sites → switch to per-skin info passed through Theme.
- Pre-built `@rokkit/themes/dist/*.css` → rebuild via `build.mjs`.
- Demo `rokkit.config.js` → revert inverted-sumi-via-naming and add explicit `invert: true` to ink.

### Downstream consumers

- Any app authoring CSS against `--ink-mute` / `--ink-soft` / `--ink-faint` will see different colors after the refactor.
- Any palette defined as the "dark side" of a dual-palette role must follow inverted-convention (50 = darkest). Tailwind palettes don't — they need an inversion helper to be used as dark sides.

### Backward-compat shim

The `INVERTED_ROLES` constant can stay as a deprecated re-export: when no `invertedRoles` is passed to `Theme`, fall back to it. The skin config can opt-in to the new flag explicitly. Eventually drop the constant.

## Success criteria

- A new app declaring `ink: { palette: 'kami', invert: true }` (or `pen: ...`) gets correct light + dark text contrast with no name-based magic.
- Dark mode flips for both surface and ink without manual palette inversion in the config (only invert flag needed; palette is defined under its own convention).
- No test in `@rokkit/core`, `@rokkit/unocss`, or the demo references the role name `'ink'` for inversion-detection purposes.
- 500 shade is no longer touched by any named token; collision risk eliminated.

## Open questions

1. **Should `invert: true` live in the skin role mapping (per skin) or in a global roles registry (shared by all skins)?** Per-skin is more flexible; global is DRYer. Likely both, with per-skin override.
2. **What does `invert: true` mean when the role's palette is a single string vs `{ light, dark }`?** Same math (`1000 - shade`); palette resolution is independent.
3. **What about non-ink inverted roles in the future?** e.g., a "stroke" role for borders that mirrors ink. The flag supports this without adding new names.
