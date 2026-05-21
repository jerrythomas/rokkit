# Direct Token Mapping (Semantic Overrides) — Design

**Status:** Draft for review
**Date:** 2026-05-21 (pivoted from invert-flag design)
**Owner:** Jerry

## Goal

Add a **per-token semantic mapping layer** to skin config so authors can map any named token directly to a `palette.shade` reference. The mapping mirrors the UnoCSS shortcuts pattern (short name → expansion). Eliminates the need for an `invert: true` role flag, the hardcoded `INVERTED_ROLES = new Set(['ink'])` constant, the `1000 - shade` math, and the implicit "palette convention" requirement. Authors get fine-grained control where they want it and keep convenience defaults elsewhere.

## Motivation

Today's named-token system has three layered concerns:

1. **Role mapping** (`surface: 'kami'`) — selects which palette feeds a role.
2. **Shade map** (`NAMED_TOKEN_SHADE_MAP`) — decides which shade of that palette each named token reads (`paper → 50`, `ink → 900`).
3. **Mode handling** — light vs dark resolution; requires the dark-side palette to follow an implicit "inverted convention" (50 = darkest) for the shade map to land on the right end of the palette.

The friction:

- **Role-name coupling.** Inversion behavior is hardcoded to the literal name `'ink'` via `INVERTED_ROLES`. A custom role name (e.g., `'pen'`) silently loses inversion.
- **Implicit palette convention.** Dark palettes must be defined as inverted (50 = darkest) for the shade map to work in dark mode. Tailwind palettes don't follow this. Authors of dual-palette skins have to remember the rule.
- **Mid-shade collision.** `ink-soft → shade 500` collides with any mid-surface tone at shade 500.
- **All-or-nothing.** Adjusting a single token requires understanding the shade map, modes, and the inversion convention. There's no escape hatch.

A **direct mapping layer** sidesteps all four. The token is named; the value is `palette.shade`. Done.

## Design

### Skin config gains a `tokens` block

```js
// rokkit.config.js
skin: {
  // Existing role-level shorthand (still valid; resolves via NAMED_TOKEN_SHADE_MAP defaults)
  surface: 'kami',
  ink:     { light: 'kami', dark: 'sumi' },
  primary: 'shu',
  accent:  'shu',
  success: 'hisui',
  warning: 'kohaku',
  danger:  'shu',

  // NEW: per-token semantic overrides — direct palette.shade refs
  tokens: {
    'ink-faint':  'kami.500',                                            // single-mode override
    'paper-edge': { light: 'kami.300', dark: 'sumi.300' },               // mode-aware override
    'accent-soft': 'shu.100/12'                                          // alpha shorthand (TBD)
  }
}
```

Or, for authors who want **complete control** with no role-level shorthand at all:

```js
skin: {
  tokens: {
    paper:        { light: 'kami.50',  dark: 'sumi.950' },
    'paper-soft': { light: 'kami.100', dark: 'sumi.900' },
    'paper-mute': { light: 'kami.200', dark: 'sumi.800' },
    'paper-edge': { light: 'kami.400', dark: 'sumi.600' },
    ink:          { light: 'kami.900', dark: 'sumi.100' },
    'ink-mute':   { light: 'kami.700', dark: 'sumi.300' },
    'ink-soft':   { light: 'kami.500', dark: 'sumi.500' },
    'ink-faint':  { light: 'kami.300', dark: 'sumi.700' },
    primary:      'shu.500',
    'on-primary': { light: 'kami.50', dark: 'sumi.50' },
    accent:       'shu.500',
    // …
  }
}
```

No role mapping required — the tokens block alone fully describes the skin.

### Resolution precedence

When emitting `--{token}` in the preset preflight, Theme uses this order:

1. **`skin.tokens[token]`** if present → resolved as `palette.shade` lookup (with optional `{ light, dark }` mode-awareness).
2. **Role-level fallback** — `NAMED_TOKEN_ROLE_MAP[token]` gives the role; `skin.{role}` gives the palette; `NAMED_TOKEN_SHADE_MAP[token]` gives the shade. (Existing behavior, unchanged.)
3. **Skip** the token if neither route resolves (palette missing, etc.).

This makes `tokens` a **strict override** — present means it wins; absent means fall back to defaults.

### Mode handling

Per-token entries support the same `{ light, dark }` shape used for role mappings and for the `custom` config block. The preset already has a resolver for this (`packages/unocss/src/custom-tokens.js`'s mode-aware logic).

Authors no longer need a "palette convention" — they just specify which shade of which palette to read in each mode.

### Why this is UnoCSS shortcuts-shaped

The mapping is declarative; the value is the expansion:

```js
// UnoCSS shortcuts — name → CSS class expansion
shortcuts: {
  btn:  'px-4 py-2 rounded bg-primary',
  card: 'p-4 border border-paper-edge bg-paper-soft'
}

// Skin tokens — name → palette reference
tokens: {
  ink:    'sumi.900',
  paper:  'kami.50'
}
```

Both are short-name → spec mappings with sensible defaults available for the unspecified case.

### What goes away

- **`invert: true` flag** — not needed. If you want ink to read shade 100 in dark mode, write `ink: { dark: 'sumi.100' }` directly.
- **`INVERTED_ROLES = new Set(['ink'])`** — not needed for the override path. The role-name coupling disappears; inversion intent is expressed in the token mapping itself. The constant stays as a fallback for the role-level shorthand path (backward compat).
- **`1000 - shade` math** — not needed. The author picks shades explicitly.
- **Implicit palette convention** ("dark palettes must be inverted-convention") — not needed for the override path. Authors can use any palette in any direction; the token mapping picks specific shades.

### What stays

- **`NAMED_TOKEN_SHADE_MAP`** — keeps current values as defaults (paper at [50, 100, 200, 400], ink at [900, 700, 500, 300]). Role-level shorthand still resolves through it.
- **`NAMED_TOKEN_ROLE_MAP`** — same. Used by the role-level shorthand path.
- **Z-aliases** — `Z_COLLAPSE_MAP_SURFACE`/`Z_COLLAPSE_MAP_INK` unchanged. They map z-slots to named tokens; named tokens then resolve through the new precedence.
- **The 24-name vocabulary** — locked.

### 500-on-500 collision

Authors who explicitly use the `tokens` block can pick non-colliding shades. The default `ink-soft = 500` still has the collision risk for skins that rely on the shorthand only. Mitigations:

- **Recommendation (documented):** when using role-level shorthand, design palettes so shade 500 of the surface palette is visually distinct from shade 500 of the ink palette. For single-palette skins (where surface and ink share a palette), explicitly override `ink-soft` to a different shade via the `tokens` block.
- **Optional follow-up:** quietly bump `NAMED_TOKEN_SHADE_MAP['ink-soft']` from 500 to 600 in a future release. Small visual shift, eliminates the collision for everyone.

### Backward compat

All existing skins that use only role-level shorthand continue to work unchanged. Behavior is identical because:
- The shade map is unchanged.
- `INVERTED_ROLES` constant stays as the default fallback for the role-level resolver.

New code can opt into per-token overrides. Existing code doesn't have to migrate.

## Worked examples

**Skin with single role-level mapping, override one token:**

```js
skin: {
  surface: 'kami',
  ink: 'kami',
  primary: 'shu',
  tokens: {
    'ink-faint': 'kami.450'   // override the default (300) to bump contrast for disabled text
  }
}
```

Resolution:
- `--paper` → role-level: surface=kami, shade map → kami.50
- `--ink` → role-level: ink=kami (auto-inverted via INVERTED_ROLES default), shade map → kami.900
- `--ink-faint` → tokens override → kami.450

**Mode-aware, full direct mapping (no role shorthand):**

```js
skin: {
  tokens: {
    paper: { light: 'kami.50',  dark: 'sumi.950' },
    ink:   { light: 'kami.900', dark: 'sumi.50' }
    // …rest
  }
}
```

Resolution: every token reads its `tokens` entry; no role-level resolution needed; no palette convention required.

**Custom role name, no special casing:**

```js
skin: {
  tokens: {
    pen:        'kami.900',
    'pen-mute': 'kami.700'
    // …
  }
}
```

If `pen-*` are added to the named-token vocabulary, this just works. No `INVERTED_ROLES.add('pen')` needed.

## Implementation surface

### `packages/unocss/src/config.js`

- Validate `skin.tokens` against the NAMED_TOKENS set (typo guard).
- Pass `tokens` through `loadConfig` to preset.

### `packages/core/src/theme.ts`

- `Theme` constructor accepts `tokenOverrides?: Record<string, string | { light?: string; dark?: string }>`.
- `getNamedTokens(mode)` checks override map first; falls back to existing shade-map resolution if no override.
- New helper: `parsePaletteRef(ref: string) → { palette, shade, alpha? }`. Reuses regex/logic from `custom-tokens.js`.

### `packages/unocss/src/preset.ts`

- Extract `config.skin.tokens` and pass to `new Theme({ tokenOverrides })`.
- Apply the same override during dark-mode block emit (using the `{ light, dark }` resolution).

### Demo

- `demo/rokkit.config.js` — adopt `tokens` block as needed. The simplest move: keep role-level shorthand, add `tokens: {…}` only where defaults need adjusting.
- `demo/src/lib/data/skins.ts` — handle `tokens` in `skinColormaps` and the managed-style writer.

### Tests

- `theme.spec.js` — add tests for the override precedence. Existing tests stay valid because defaults unchanged.
- `config.spec.js` — add validation tests for the `tokens` block.
- `preset.spec.js` — preflight emit tests for overrides + mode handling.

## Out of scope

- Auto-detect palette direction.
- Replacing the 24-name vocabulary.
- Per-component theme overrides (different feature; `data-style` already covers that).

## Migration impact

**Inside the repo:**
- `demo/rokkit.config.js` — optional. Existing role-level config works; adding `tokens: {…}` overrides is incremental.
- No required changes elsewhere. `INVERTED_ROLES` stays as default fallback.

**Downstream consumers:**
- Apps using only role-level shorthand: no change.
- Apps wanting per-token control: opt-in via `tokens: {…}`.

## Success criteria

- An author can configure a custom-named role (`pen` → text role) by writing `tokens: { pen: 'kami.900', 'pen-mute': 'kami.700' }` with no system-level changes.
- An author can override exactly one token's shade without touching the rest of the skin.
- An author can avoid the 500-on-500 collision by explicitly setting `ink-soft` to a non-colliding shade.
- An author who imports a normal-convention dark palette (e.g., Tailwind `slate`) can use it as the dark side of a role by writing `{ dark: 'slate.900' }` for paper and `{ dark: 'slate.100' }` for ink — no palette inversion needed.
- Existing skins keep working without changes.

## Open questions

1. **Alpha suffix in palette refs (`'shu.100/12'`)** — useful for `*-soft` companions. Worth adding now or defer?
2. **Same shape for `custom: {…}`** — the existing `custom` block already supports palette refs and `{ light, dark }`. Should we unify so `custom` and `tokens` use the same resolver? (Likely yes — same code path.)
3. **Validation** — should typos in token names (e.g., `'ink-fant'`) throw or warn? Lean toward warn-with-default (preserves DX) but error in CI mode.
