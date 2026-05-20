# Trimmed Token Vocabulary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Release 1 of the trimmed token vocabulary — preset emits 18 named CSS vars (`--paper`, `--ink-mute`, etc.) by default with `--color-*-z*` aliases for back-compat, plus opt-in `extended` mode and a `custom` config block for app-level tokens.

**Architecture:** Two layers. `@rokkit/core` gets a `named-tokens.ts` module (vocabulary + palette-shade map + z-collapse table) and three new Theme methods (`getNamedTokens`, `getZAliasesForCore`, `getZAliasesForExtended`). `@rokkit/unocss` config gains `tokens: 'core' | 'extended' | per-role` and `custom: {…}`. The preset's `buildPreflights` and `buildShortcuts` branch on token mode. A separate `custom-tokens.js` handles palette-ref / mode-aware resolution for user tokens.

**Tech Stack:** TypeScript/JavaScript, UnoCSS preset API, Vitest, Bun runner. Existing patterns: `ColorSpace` adapter for value wrapping, `Theme` class for palette/mapping ops, palette values stored as space-separated component strings.

**Scope (Release 1):** Preset, config, theme infrastructure, tests, demo config update.
**Out of scope (deferred):** Migrating `packages/themes/src/base/*.css` (release 1.x), migrating `zen-sumi/*.css` (release 1.x), dropping the z-alias emit (release 2).

---

## File Structure

**Create:**
- `packages/core/src/named-tokens.ts` — 18-name vocabulary, named→shade map, z-collapse table, role lookup. Pure constants + tiny helpers; no Theme dependency.
- `packages/core/spec/named-tokens.spec.js` — tests for the constants and helpers.
- `packages/unocss/src/custom-tokens.js` — resolver for the `custom` config block (palette refs, raw strings, `{ light, dark }`, collision detection, color-vs-non-color heuristic).
- `packages/unocss/spec/custom-tokens.spec.js` — resolver tests.

**Modify:**
- `packages/core/src/theme.ts` — add `getNamedTokens(mode)`, `getZAliasesForCore(role)`, `getZAliasesForExtended(role)` methods. Keep existing `getPalette` / `getZScaleCSS` working (no breaking change).
- `packages/core/src/index.ts` — re-export new constants from `named-tokens.ts`.
- `packages/core/spec/theme.spec.js` — tests for new methods.
- `packages/unocss/src/config.js` — add `tokens` and `custom` fields; add `resolveTokenMode(config, role)` helper.
- `packages/unocss/spec/config.spec.js` — tests for new fields.
- `packages/unocss/src/preset.ts` — branch `buildPreflights` and `buildShortcuts` on token mode; wire in custom-tokens resolver; route z-shortcuts directly through the named layer in core mode.
- `packages/unocss/spec/preset.spec.js` — extend with token-mode and custom-token tests.
- `demo/rokkit.config.js` — set `tokens: 'core'` and add a small `custom: {…}` block as a real-world smoke test.
- `packages/unocss/README.md` — document the new config keys with examples.

---

## Task 1: Named-token vocabulary constants

**Files:**
- Create: `packages/core/src/named-tokens.ts`
- Create: `packages/core/spec/named-tokens.spec.js`

- [ ] **Step 1: Write the failing test**

Create `packages/core/spec/named-tokens.spec.js`:

```javascript
import { describe, it, expect } from 'vitest'
import {
  NAMED_TOKENS,
  NAMED_TOKEN_SHADE_MAP,
  NAMED_TOKEN_ROLE_MAP,
  Z_COLLAPSE_MAP_SURFACE,
  Z_COLLAPSE_MAP_INK,
  shadeForNamedToken,
  roleForNamedToken
} from '../src/named-tokens.ts'

describe('NAMED_TOKENS', () => {
  it('exports exactly 18 canonical names', () => {
    expect(NAMED_TOKENS).toHaveLength(18)
  })

  it('includes all surface tokens', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'paper', 'paper-soft', 'paper-mute', 'paper-edge'
    ]))
  })

  it('includes all ink tokens', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'ink', 'ink-mute', 'ink-soft', 'ink-faint'
    ]))
  })

  it('includes primary, on-primary, accent, accent-soft', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'primary', 'on-primary', 'accent', 'accent-soft'
    ]))
  })

  it('includes status tokens with soft companions', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining([
      'success', 'success-soft', 'warning', 'warning-soft', 'danger', 'danger-soft'
    ]))
  })

  it('includes focus-ring and shadow-tint', () => {
    expect(NAMED_TOKENS).toEqual(expect.arrayContaining(['focus-ring', 'shadow-tint']))
  })
})

describe('NAMED_TOKEN_SHADE_MAP', () => {
  it('maps paper ladder to shades 50/100/200/400', () => {
    expect(NAMED_TOKEN_SHADE_MAP['paper']).toBe(50)
    expect(NAMED_TOKEN_SHADE_MAP['paper-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['paper-mute']).toBe(200)
    expect(NAMED_TOKEN_SHADE_MAP['paper-edge']).toBe(400)
  })

  it('maps ink ladder to shades 900/700/500/300', () => {
    expect(NAMED_TOKEN_SHADE_MAP['ink']).toBe(900)
    expect(NAMED_TOKEN_SHADE_MAP['ink-mute']).toBe(700)
    expect(NAMED_TOKEN_SHADE_MAP['ink-soft']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['ink-faint']).toBe(300)
  })

  it('maps primary/accent/status to shade 500', () => {
    expect(NAMED_TOKEN_SHADE_MAP['primary']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['accent']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['success']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['warning']).toBe(500)
    expect(NAMED_TOKEN_SHADE_MAP['danger']).toBe(500)
  })

  it('maps soft companions to shade 100', () => {
    expect(NAMED_TOKEN_SHADE_MAP['accent-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['success-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['warning-soft']).toBe(100)
    expect(NAMED_TOKEN_SHADE_MAP['danger-soft']).toBe(100)
  })
})

describe('NAMED_TOKEN_ROLE_MAP', () => {
  it('routes paper-* through surface role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['paper']).toBe('surface')
    expect(NAMED_TOKEN_ROLE_MAP['paper-edge']).toBe('surface')
  })

  it('routes ink-* through ink role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['ink']).toBe('ink')
    expect(NAMED_TOKEN_ROLE_MAP['ink-faint']).toBe('ink')
  })

  it('routes primary and on-primary through primary role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['primary']).toBe('primary')
    expect(NAMED_TOKEN_ROLE_MAP['on-primary']).toBe('primary')
  })

  it('routes accent and accent-soft through accent role', () => {
    expect(NAMED_TOKEN_ROLE_MAP['accent']).toBe('accent')
    expect(NAMED_TOKEN_ROLE_MAP['accent-soft']).toBe('accent')
  })

  it('routes status tokens through their roles', () => {
    expect(NAMED_TOKEN_ROLE_MAP['success']).toBe('success')
    expect(NAMED_TOKEN_ROLE_MAP['success-soft']).toBe('success')
    expect(NAMED_TOKEN_ROLE_MAP['warning']).toBe('warning')
    expect(NAMED_TOKEN_ROLE_MAP['danger']).toBe('danger')
  })

  it('routes focus-ring through accent and shadow-tint through ink', () => {
    expect(NAMED_TOKEN_ROLE_MAP['focus-ring']).toBe('accent')
    expect(NAMED_TOKEN_ROLE_MAP['shadow-tint']).toBe('ink')
  })
})

describe('Z_COLLAPSE_MAP_SURFACE (z-slot → named slot)', () => {
  it('collapses z2/z3 to paper-mute', () => {
    expect(Z_COLLAPSE_MAP_SURFACE['z2']).toBe('paper-mute')
    expect(Z_COLLAPSE_MAP_SURFACE['z3']).toBe('paper-mute')
  })

  it('collapses z9/z10 to ink', () => {
    expect(Z_COLLAPSE_MAP_SURFACE['z9']).toBe('ink')
    expect(Z_COLLAPSE_MAP_SURFACE['z10']).toBe('ink')
  })

  it('maps z0..z4 to paper ladder', () => {
    expect(Z_COLLAPSE_MAP_SURFACE['z0']).toBe('paper')
    expect(Z_COLLAPSE_MAP_SURFACE['z1']).toBe('paper-soft')
    expect(Z_COLLAPSE_MAP_SURFACE['z4']).toBe('paper-edge')
  })
})

describe('Z_COLLAPSE_MAP_INK (inverted)', () => {
  it('maps z0 to ink (inverted)', () => {
    expect(Z_COLLAPSE_MAP_INK['z0']).toBe('ink')
  })

  it('maps z10 to paper (inverted)', () => {
    expect(Z_COLLAPSE_MAP_INK['z10']).toBe('paper')
  })
})

describe('helpers', () => {
  it('shadeForNamedToken returns the shade index', () => {
    expect(shadeForNamedToken('paper-mute')).toBe(200)
  })

  it('shadeForNamedToken returns undefined for unknown names', () => {
    expect(shadeForNamedToken('not-a-token')).toBeUndefined()
  })

  it('roleForNamedToken returns the role', () => {
    expect(roleForNamedToken('ink-mute')).toBe('ink')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test named-tokens`
Expected: FAIL — module not found at `../src/named-tokens.ts`.

- [ ] **Step 3: Create the constants module**

Create `packages/core/src/named-tokens.ts`:

```typescript
/**
 * The 18 canonical named tokens that constitute the "core" emit vocabulary.
 * Order is significant for tests and for predictable CSS-var output ordering.
 */
export const NAMED_TOKENS = [
  'paper', 'paper-soft', 'paper-mute', 'paper-edge',
  'ink', 'ink-mute', 'ink-soft', 'ink-faint',
  'primary', 'on-primary',
  'accent', 'accent-soft',
  'success', 'success-soft',
  'warning', 'warning-soft',
  'danger', 'danger-soft',
  'focus-ring', 'shadow-tint'
] as const

export type NamedToken = (typeof NAMED_TOKENS)[number]

/**
 * Maps each named token to the palette shade index (50, 100, 200, 300, 400, 500, 700, 900)
 * that backs it. The role itself comes from NAMED_TOKEN_ROLE_MAP.
 *
 * paper:        shade 50  (lightest surface tone, canvas)
 * paper-soft:   shade 100 (card background)
 * paper-mute:   shade 200 (subdued panel)
 * paper-edge:   shade 400 (hairline border tone)
 * ink:          shade 900 (primary text)
 * ink-mute:     shade 700 (secondary text)
 * ink-soft:     shade 500 (placeholder)
 * ink-faint:    shade 300 (disabled)
 * primary:      shade 500 (CTA fill)
 * on-primary:   derived — paper-equivalent of inverted ink palette (white-on-primary by default)
 * accent / status: shade 500 (solid tones)
 * *-soft:       shade 100 (tinted-bg companion)
 * focus-ring:   shade 500 of accent
 * shadow-tint:  shade 900 of ink @ 0.06 alpha
 */
export const NAMED_TOKEN_SHADE_MAP: Record<NamedToken, number | 'derived'> = {
  paper: 50,
  'paper-soft': 100,
  'paper-mute': 200,
  'paper-edge': 400,
  ink: 900,
  'ink-mute': 700,
  'ink-soft': 500,
  'ink-faint': 300,
  primary: 500,
  'on-primary': 'derived',
  accent: 500,
  'accent-soft': 100,
  success: 500,
  'success-soft': 100,
  warning: 500,
  'warning-soft': 100,
  danger: 500,
  'danger-soft': 100,
  'focus-ring': 500,
  'shadow-tint': 900
}

/**
 * Maps each named token to the skin role whose palette it draws from.
 */
export const NAMED_TOKEN_ROLE_MAP: Record<NamedToken, string> = {
  paper: 'surface',
  'paper-soft': 'surface',
  'paper-mute': 'surface',
  'paper-edge': 'surface',
  ink: 'ink',
  'ink-mute': 'ink',
  'ink-soft': 'ink',
  'ink-faint': 'ink',
  primary: 'primary',
  'on-primary': 'primary',
  accent: 'accent',
  'accent-soft': 'accent',
  success: 'success',
  'success-soft': 'success',
  warning: 'warning',
  'warning-soft': 'warning',
  danger: 'danger',
  'danger-soft': 'danger',
  'focus-ring': 'accent',
  'shadow-tint': 'ink'
}

/**
 * Surface z-slot → named slot. Used to emit back-compat aliases like
 * `--color-surface-z1: var(--paper-soft);` in core mode.
 *
 * z2/z3 collapse to paper-mute, z5/z6 collapse to ink-soft, z7/z8 to ink-mute,
 * z9/z10 to ink. This collapse is the contract: 4 surface tones in core mode.
 */
export const Z_COLLAPSE_MAP_SURFACE: Record<string, NamedToken> = {
  z0: 'paper',
  z1: 'paper-soft',
  z2: 'paper-mute',
  z3: 'paper-mute',
  z4: 'paper-edge',
  z5: 'ink-soft',
  z6: 'ink-soft',
  z7: 'ink-mute',
  z8: 'ink-mute',
  z9: 'ink',
  z10: 'ink'
}

/**
 * Ink role uses the inverted z-scale (z0 = darkest = primary text).
 * In core mode, the same 4+4 named ladder is reused; this table just inverts.
 */
export const Z_COLLAPSE_MAP_INK: Record<string, NamedToken> = {
  z0: 'ink',
  z1: 'ink-mute',
  z2: 'ink-mute',
  z3: 'ink-soft',
  z4: 'ink-soft',
  z5: 'paper-edge',
  z6: 'paper-edge',
  z7: 'paper-mute',
  z8: 'paper-mute',
  z9: 'paper-soft',
  z10: 'paper'
}

export function shadeForNamedToken(name: string): number | 'derived' | undefined {
  return NAMED_TOKEN_SHADE_MAP[name as NamedToken]
}

export function roleForNamedToken(name: string): string | undefined {
  return NAMED_TOKEN_ROLE_MAP[name as NamedToken]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test named-tokens`
Expected: PASS, all assertions green.

- [ ] **Step 5: Export from package index**

Modify `packages/core/src/index.ts` — add at the end:

```typescript
export * from './named-tokens'
```

(If the file uses `index.js` with explicit re-exports, add the matching pattern there instead. Verify with `head -20 packages/core/src/index.*` first.)

- [ ] **Step 6: Run lint to confirm no errors**

Run: `cd /Users/Jerry/Developer/rokkit && bun run lint`
Expected: 0 errors (warnings acceptable per CLAUDE.md).

- [ ] **Step 7: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/core/src/named-tokens.ts packages/core/src/index.* packages/core/spec/named-tokens.spec.js
git commit -m "$(cat <<'EOF'
feat(core): add named-token vocabulary constants

18-name canonical vocabulary (paper/ink/primary/accent/status), palette-shade
map, role map, and z-collapse tables for surface and ink. Foundation for the
trimmed-token preset emit (release 1 of the design doc).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Theme.getNamedTokens() — palette-resolved named layer

**Files:**
- Modify: `packages/core/src/theme.ts` (add method, ~30 lines)
- Modify: `packages/core/spec/theme.spec.js` (add describe block)

- [ ] **Step 1: Write the failing test**

Append to `packages/core/spec/theme.spec.js`:

```javascript
import { Theme } from '../src/theme.ts'

describe('Theme.getNamedTokens', () => {
  it('returns a CSS-var map keyed by --{named}', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', ink: 'slate', primary: 'orange', accent: 'sky' },
      colorSpace: 'rgb'
    })
    const tokens = theme.getNamedTokens('light')
    expect(tokens).toHaveProperty('--paper')
    expect(tokens).toHaveProperty('--paper-soft')
    expect(tokens).toHaveProperty('--ink-mute')
    expect(tokens).toHaveProperty('--primary')
    expect(tokens).toHaveProperty('--accent-soft')
  })

  it('resolves paper to surface palette shade 50 in rgb', () => {
    const theme = new Theme({
      mapping: { surface: 'slate' },
      colorSpace: 'rgb'
    })
    // slate-50 = #f8fafc → rgb(248, 250, 252)
    const tokens = theme.getNamedTokens('light')
    expect(tokens['--paper']).toBe('rgb(248, 250, 252)')
  })

  it('resolves ink to ink palette shade 900', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', ink: 'slate' },
      colorSpace: 'rgb'
    })
    // slate-900 = #0f172a → rgb(15, 23, 42)
    const tokens = theme.getNamedTokens('light')
    expect(tokens['--ink']).toBe('rgb(15, 23, 42)')
  })

  it('emits a value for every NAMED_TOKEN', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', ink: 'slate', primary: 'orange' },
      colorSpace: 'rgb'
    })
    const tokens = theme.getNamedTokens('light')
    const NAMED_TOKENS = [
      'paper', 'paper-soft', 'paper-mute', 'paper-edge',
      'ink', 'ink-mute', 'ink-soft', 'ink-faint',
      'primary', 'on-primary',
      'accent', 'accent-soft',
      'success', 'success-soft', 'warning', 'warning-soft', 'danger', 'danger-soft',
      'focus-ring', 'shadow-tint'
    ]
    for (const name of NAMED_TOKENS) {
      expect(tokens).toHaveProperty(`--${name}`)
      expect(tokens[`--${name}`]).toBeTruthy()
    }
  })

  it('emits *-soft with alpha overlay using color-mix', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', primary: 'orange', accent: 'sky' },
      colorSpace: 'rgb'
    })
    const tokens = theme.getNamedTokens('light')
    // accent-soft uses shade 100; verify it's a real resolved color, not a literal "100"
    expect(tokens['--accent-soft']).toMatch(/rgb\(\d+, \d+, \d+\)/)
  })

  it('on-primary defaults to paper shade of surface (high-contrast white-ish)', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', primary: 'orange' },
      colorSpace: 'rgb'
    })
    const tokens = theme.getNamedTokens('light')
    // on-primary = surface shade 50 (paper) for white-on-primary contrast
    expect(tokens['--on-primary']).toBe('rgb(248, 250, 252)')
  })

  it('falls back gracefully when a role palette is missing', () => {
    // No `accent` mapping provided — should fall back through COLOR_FALLBACKS chain (accent → primary)
    const theme = new Theme({
      mapping: { surface: 'slate', primary: 'orange' },
      colorSpace: 'rgb'
    })
    const tokens = theme.getNamedTokens('light')
    expect(tokens['--accent']).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test theme`
Expected: FAIL — `theme.getNamedTokens is not a function`.

- [ ] **Step 3: Implement getNamedTokens on Theme class**

Modify `packages/core/src/theme.ts`. First add the import at the top (line 3 area):

```typescript
import {
  NAMED_TOKENS,
  NAMED_TOKEN_SHADE_MAP,
  NAMED_TOKEN_ROLE_MAP
} from './named-tokens'
```

Then add this method to the `Theme` class (insert before `getShortcuts`, ~line 245):

```typescript
/**
 * Returns the named-token layer as a map of `--{name}: <resolved value>` entries.
 * Palette values are inlined — there is no intermediate `--color-{role}-{shade}` indirection.
 *
 * `on-primary` is derived: it picks the paper shade (50) of the surface palette so the
 * default contrast pair is "primary fill + white-ish text". Skins that need a different
 * pair should declare it via custom tokens.
 *
 * `*-soft` variants resolve to shade 100 of their role palette.
 * `shadow-tint` resolves to shade 900 of the ink palette.
 *
 * @param {'light'|'dark'} _mode — accepted for symmetry with future dark-mode-aware derivations;
 *   today the Theme is already constructed with a mode-resolved mapping so this is informational.
 */
getNamedTokens(_mode = 'light') {
  const colors = { ...defaultColors, ...this.#colors }
  const result: Record<string, string> = {}

  for (const name of NAMED_TOKENS) {
    const role = NAMED_TOKEN_ROLE_MAP[name]
    const shadeOrDerived = NAMED_TOKEN_SHADE_MAP[name]
    const paletteName = this.#mapping[role]
    if (!paletteName || !colors[paletteName]) continue

    let shadeKey: number
    if (shadeOrDerived === 'derived') {
      // on-primary: paper-equivalent of surface (shade 50) for white-on-primary default
      const surfacePalette = colors[this.#mapping['surface']]
      if (surfacePalette) {
        result[`--${name}`] = this.#adapter.wrap(surfacePalette['50'])
      }
      continue
    } else {
      shadeKey = shadeOrDerived as number
    }

    const raw = colors[paletteName][String(shadeKey)]
    if (raw !== undefined) {
      result[`--${name}`] = this.#adapter.wrap(raw)
    }
  }
  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test theme`
Expected: PASS for the new `Theme.getNamedTokens` describe block; existing tests still pass.

- [ ] **Step 5: Run full core suite**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test`
Expected: All green.

- [ ] **Step 6: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/core/src/theme.ts packages/core/spec/theme.spec.js
git commit -m "$(cat <<'EOF'
feat(core): Theme.getNamedTokens — palette-inlined named layer

Resolves the 18-name vocabulary to concrete CSS-var assignments using the
existing skin role mapping. on-primary derives from surface.50 by default.
Soft variants and shadow-tint resolve via shade lookup.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Theme.getZAliasesForCore() — back-compat alias layer

**Files:**
- Modify: `packages/core/src/theme.ts` (add method, ~25 lines)
- Modify: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/core/spec/theme.spec.js`:

```javascript
describe('Theme.getZAliasesForCore', () => {
  it('emits surface z-aliases pointing at the named layer', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', ink: 'slate' },
      colorSpace: 'rgb'
    })
    const aliases = theme.getZAliasesForCore('surface')
    expect(aliases['--color-surface-z0']).toBe('var(--paper)')
    expect(aliases['--color-surface-z1']).toBe('var(--paper-soft)')
    expect(aliases['--color-surface-z2']).toBe('var(--paper-mute)')
    expect(aliases['--color-surface-z3']).toBe('var(--paper-mute)')
    expect(aliases['--color-surface-z4']).toBe('var(--paper-edge)')
    expect(aliases['--color-surface-z9']).toBe('var(--ink)')
    expect(aliases['--color-surface-z10']).toBe('var(--ink)')
  })

  it('emits ink z-aliases pointing at the inverted named layer', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', ink: 'slate' },
      colorSpace: 'rgb'
    })
    const aliases = theme.getZAliasesForCore('ink')
    // ink is inverted: z0 = ink (darkest), z10 = paper (lightest)
    expect(aliases['--color-ink-z0']).toBe('var(--ink)')
    expect(aliases['--color-ink-z9']).toBe('var(--paper-soft)')
    expect(aliases['--color-ink-z10']).toBe('var(--paper)')
  })

  it('emits primary z-aliases that all point at --primary (single-tone in core mode)', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', primary: 'orange' },
      colorSpace: 'rgb'
    })
    const aliases = theme.getZAliasesForCore('primary')
    // Primary in core mode collapses all z-slots to --primary (no ladder)
    expect(aliases['--color-primary-z5']).toBe('var(--primary)')
    expect(aliases['--color-primary-z1']).toBe('var(--accent-soft)')  // soft tint reuse for z1
  })
})
```

Note: the `--color-primary-z1: var(--accent-soft)` expectation is intentional — z1 is the "tinted background" slot for any role, and the named vocabulary uses `-soft` companions for that purpose. For roles without their own `-soft` companion (only accent and status have them in V2), this falls back to `var(--accent-soft)` as the closest semantic tint.

Actually that's clumsy. Revise: for non-surface/non-ink roles, z1 reuses the role's `-soft` if one exists, else falls back to the role's main token. Update the test:

```javascript
it('emits primary z-aliases collapsed to --primary (primary has no soft companion)', () => {
  const theme = new Theme({
    mapping: { surface: 'slate', primary: 'orange' },
    colorSpace: 'rgb'
  })
  const aliases = theme.getZAliasesForCore('primary')
  expect(aliases['--color-primary-z5']).toBe('var(--primary)')
  expect(aliases['--color-primary-z1']).toBe('var(--primary)') // no soft, collapses to main
})

it('emits accent z-aliases with accent-soft at z1', () => {
  const theme = new Theme({
    mapping: { surface: 'slate', accent: 'sky' },
    colorSpace: 'rgb'
  })
  const aliases = theme.getZAliasesForCore('accent')
  expect(aliases['--color-accent-z5']).toBe('var(--accent)')
  expect(aliases['--color-accent-z1']).toBe('var(--accent-soft)')
})

it('emits success z-aliases with success-soft at z1 and success at z5-z7', () => {
  const theme = new Theme({
    mapping: { surface: 'slate', success: 'green' },
    colorSpace: 'rgb'
  })
  const aliases = theme.getZAliasesForCore('success')
  expect(aliases['--color-success-z1']).toBe('var(--success-soft)')
  expect(aliases['--color-success-z5']).toBe('var(--success)')
  expect(aliases['--color-success-z7']).toBe('var(--success)')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test theme`
Expected: FAIL — `theme.getZAliasesForCore is not a function`.

- [ ] **Step 3: Implement getZAliasesForCore**

Modify `packages/core/src/theme.ts`. Add imports at top:

```typescript
import {
  NAMED_TOKENS,
  NAMED_TOKEN_SHADE_MAP,
  NAMED_TOKEN_ROLE_MAP,
  Z_COLLAPSE_MAP_SURFACE,
  Z_COLLAPSE_MAP_INK
} from './named-tokens'
```

Add the method to the `Theme` class (after `getNamedTokens`):

```typescript
/**
 * Returns z-alias CSS-var assignments for back-compat in core mode.
 * `--color-{role}-z{n}` → `var(--{namedSlot})`.
 *
 * For surface: uses Z_COLLAPSE_MAP_SURFACE (z2/z3 → paper-mute, etc).
 * For ink: uses Z_COLLAPSE_MAP_INK (inverted scale).
 * For primary/accent/status: z1 → role-soft (if exists), z5–z10 → role main.
 *   This collapses the full 11-shade ladder to "tint vs solid", which is the
 *   core-mode contract.
 */
getZAliasesForCore(role: string): Record<string, string> {
  const result: Record<string, string> = {}
  const Z_SLOTS = ['z0','z1','z2','z3','z4','z5','z6','z7','z8','z9','z10']

  if (role === 'surface') {
    for (const z of Z_SLOTS) {
      result[`--color-surface-${z}`] = `var(--${Z_COLLAPSE_MAP_SURFACE[z]})`
    }
    return result
  }
  if (role === 'ink') {
    for (const z of Z_SLOTS) {
      result[`--color-ink-${z}`] = `var(--${Z_COLLAPSE_MAP_INK[z]})`
    }
    return result
  }

  // Other roles (primary, accent, status): tint vs solid collapse
  const hasSoft = NAMED_TOKENS.includes(`${role}-soft` as any)
  const softTarget = hasSoft ? `${role}-soft` : role
  const solidTarget = role
  for (const z of Z_SLOTS) {
    const zNum = parseInt(z.slice(1), 10)
    const target = zNum <= 2 ? softTarget : solidTarget
    result[`--color-${role}-${z}`] = `var(--${target})`
  }
  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test theme`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/core/src/theme.ts packages/core/spec/theme.spec.js
git commit -m "$(cat <<'EOF'
feat(core): Theme.getZAliasesForCore — back-compat z-alias layer

Generates --color-{role}-z{n} aliases that point at the named layer for
core-mode emit. Surface/ink use the documented collapse tables; other roles
collapse to a "tint vs solid" 2-state ladder reusing -soft companions when
available.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Theme.getZAliasesForExtended() — full-palette aliases

**Files:**
- Modify: `packages/core/src/theme.ts` (add method, ~15 lines)
- Modify: `packages/core/spec/theme.spec.js`

In extended mode, named tokens become aliases pointing at the palette (`--paper: var(--color-surface-50)`), and the full z-scale is emitted today's way. This method produces the named-as-alias layer.

- [ ] **Step 1: Write the failing test**

Append to `packages/core/spec/theme.spec.js`:

```javascript
describe('Theme.getZAliasesForExtended (named-as-aliases-of-palette)', () => {
  it('emits named tokens as aliases pointing at palette CSS vars', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', ink: 'slate', primary: 'orange' },
      colorSpace: 'rgb'
    })
    const aliases = theme.getZAliasesForExtended()
    expect(aliases['--paper']).toBe('var(--color-surface-50)')
    expect(aliases['--paper-soft']).toBe('var(--color-surface-100)')
    expect(aliases['--paper-mute']).toBe('var(--color-surface-200)')
    expect(aliases['--paper-edge']).toBe('var(--color-surface-400)')
    expect(aliases['--ink']).toBe('var(--color-ink-900)')
    expect(aliases['--ink-mute']).toBe('var(--color-ink-700)')
    expect(aliases['--primary']).toBe('var(--color-primary-500)')
  })

  it('on-primary aliases to --color-surface-50 (derived rule)', () => {
    const theme = new Theme({
      mapping: { surface: 'slate', primary: 'orange' },
      colorSpace: 'rgb'
    })
    const aliases = theme.getZAliasesForExtended()
    expect(aliases['--on-primary']).toBe('var(--color-surface-50)')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test theme`
Expected: FAIL — method not defined.

- [ ] **Step 3: Implement getZAliasesForExtended**

Add to `packages/core/src/theme.ts` after `getZAliasesForCore`:

```typescript
/**
 * Returns named tokens as CSS-var aliases pointing at the palette layer.
 * Used in extended mode where the full --color-{role}-{shade} palette is
 * emitted; named tokens become thin syntactic aliases over the palette.
 */
getZAliasesForExtended(): Record<string, string> {
  const result: Record<string, string> = {}
  for (const name of NAMED_TOKENS) {
    const role = NAMED_TOKEN_ROLE_MAP[name]
    const shadeOrDerived = NAMED_TOKEN_SHADE_MAP[name]
    if (shadeOrDerived === 'derived') {
      // on-primary → surface.50
      result[`--${name}`] = `var(--color-surface-50)`
      continue
    }
    result[`--${name}`] = `var(--color-${role}-${shadeOrDerived})`
  }
  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/core test theme`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/core/src/theme.ts packages/core/spec/theme.spec.js
git commit -m "$(cat <<'EOF'
feat(core): Theme.getZAliasesForExtended — named-as-palette-aliases

For extended mode, named tokens become CSS-var aliases pointing at the
full --color-{role}-{shade} palette layer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Config — `tokens` mode field

**Files:**
- Modify: `packages/unocss/src/config.js`
- Modify: `packages/unocss/spec/config.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/unocss/spec/config.spec.js`:

```javascript
describe('loadConfig — tokens mode', () => {
  it('defaults tokens to "core"', () => {
    const config = loadConfig()
    expect(config.tokens).toBe('core')
  })

  it('accepts tokens: "extended"', () => {
    const config = loadConfig({ tokens: 'extended' })
    expect(config.tokens).toBe('extended')
  })

  it('accepts per-role object: { surface: "core", primary: "extended" }', () => {
    const config = loadConfig({ tokens: { surface: 'core', primary: 'extended' } })
    expect(config.tokens).toEqual({ surface: 'core', primary: 'extended' })
  })

  it('throws on invalid tokens value', () => {
    expect(() => loadConfig({ tokens: 'bogus' })).toThrow(/tokens/)
  })
})

import { resolveTokenMode } from '../src/config.js'

describe('resolveTokenMode', () => {
  it('returns the global mode for any role when tokens is a string', () => {
    const config = { tokens: 'extended' }
    expect(resolveTokenMode(config, 'surface')).toBe('extended')
    expect(resolveTokenMode(config, 'primary')).toBe('extended')
  })

  it('returns per-role mode when tokens is an object', () => {
    const config = { tokens: { surface: 'extended', primary: 'core' } }
    expect(resolveTokenMode(config, 'surface')).toBe('extended')
    expect(resolveTokenMode(config, 'primary')).toBe('core')
  })

  it('defaults to "core" when a role is missing from per-role object', () => {
    const config = { tokens: { surface: 'extended' } }
    expect(resolveTokenMode(config, 'primary')).toBe('core')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test config`
Expected: FAIL — `config.tokens` undefined; `resolveTokenMode` not exported.

- [ ] **Step 3: Implement in config.js**

Modify `packages/unocss/src/config.js`. Add to `DEFAULT_CONFIG`:

```javascript
export const DEFAULT_CONFIG = {
  palettes: {},
  colorSpace: 'rgb',
  skin: DEFAULT_SKIN,
  skins: {},
  themes: ['rokkit'],
  tokens: 'core',          // ← new
  custom: {},              // ← new (Task 6 fleshes this out)
  icons: { /* … */ },
  typography: { /* … */ },
  shape: { radius: null },
  switcher: 'manual',
  storageKey: 'rokkit-theme'
}
```

Add validation + resolver:

```javascript
const VALID_TOKEN_MODES = new Set(['core', 'extended'])

function validateTokens(value) {
  if (typeof value === 'string') {
    if (!VALID_TOKEN_MODES.has(value)) {
      throw new Error(`Invalid tokens mode "${value}". Expected "core" or "extended".`)
    }
    return value
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [role, mode] of Object.entries(value)) {
      if (!VALID_TOKEN_MODES.has(mode)) {
        throw new Error(
          `Invalid tokens mode for role "${role}": "${mode}". Expected "core" or "extended".`
        )
      }
    }
    return value
  }
  throw new Error(`tokens must be "core", "extended", or an object — got ${typeof value}.`)
}

/**
 * Resolves the token mode for a specific role.
 * - If config.tokens is a string, that's the mode for every role.
 * - If it's a per-role object, look up the role; fall back to 'core' when absent.
 */
export function resolveTokenMode(config, role) {
  const t = config.tokens
  if (typeof t === 'string') return t
  if (t && typeof t === 'object') return t[role] ?? 'core'
  return 'core'
}
```

Update `loadConfig` to include `tokens`:

```javascript
export function loadConfig(userConfig) {
  const cfg = userConfig ?? {}
  return {
    palettes:   pick(cfg.palettes, DEFAULT_CONFIG.palettes),
    colorSpace: pick(cfg.colorSpace, DEFAULT_CONFIG.colorSpace),
    skin:       { ...DEFAULT_SKIN, ...(cfg.skin ?? cfg.colors ?? {}) },
    skins:      pick(cfg.skins, DEFAULT_CONFIG.skins),
    themes:     pick(cfg.themes, DEFAULT_CONFIG.themes),
    tokens:     validateTokens(cfg.tokens ?? DEFAULT_CONFIG.tokens),  // ← new
    custom:     pick(cfg.custom, DEFAULT_CONFIG.custom),               // ← new
    icons:      { ...DEFAULT_CONFIG.icons, ...cfg.icons },
    typography: { ...DEFAULT_CONFIG.typography, ...cfg.typography },
    shape:      { ...DEFAULT_CONFIG.shape, ...cfg.shape },
    switcher:   pick(cfg.switcher, DEFAULT_CONFIG.switcher),
    storageKey: pick(cfg.storageKey, DEFAULT_CONFIG.storageKey)
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test config`
Expected: PASS for new describes; existing tests still pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/unocss/src/config.js packages/unocss/spec/config.spec.js
git commit -m "$(cat <<'EOF'
feat(unocss): config supports tokens mode ('core' | 'extended' | per-role)

Adds tokens field with validation and resolveTokenMode(config, role) helper.
Default is 'core'.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Custom-token resolver

**Files:**
- Create: `packages/unocss/src/custom-tokens.js`
- Create: `packages/unocss/spec/custom-tokens.spec.js`

- [ ] **Step 1: Write the failing test**

Create `packages/unocss/spec/custom-tokens.spec.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { resolveCustomTokens, validateCustomTokenNames, isColorValue } from '../src/custom-tokens.js'
import { NAMED_TOKENS } from '@rokkit/core'

describe('resolveCustomTokens', () => {
  const palettes = {
    kami: { 50: '#f8f8f3', 100: '#f0f0e8', 900: '#1a1a1a' },
    sumi: { 50: '#fafafa', 900: '#0d0d0d' }
  }

  it('resolves "palette.shade" refs via the colorSpace adapter', () => {
    const result = resolveCustomTokens(
      { canvas: 'kami.50' },
      palettes,
      'rgb',
      'light'
    )
    // kami.50 = #f8f8f3 → rgb(248, 248, 243)
    expect(result['--canvas']).toBe('rgb(248, 248, 243)')
  })

  it('passes raw string values through verbatim', () => {
    const result = resolveCustomTokens(
      { 'canvas-grid': '#d4d4d4', tau: 'oklch(0.5 0.1 30)' },
      palettes,
      'rgb',
      'light'
    )
    expect(result['--canvas-grid']).toBe('#d4d4d4')
    expect(result['--tau']).toBe('oklch(0.5 0.1 30)')
  })

  it('selects light value from { light, dark } in light mode', () => {
    const result = resolveCustomTokens(
      { bleed: { light: 'kami.50', dark: 'sumi.900' } },
      palettes,
      'rgb',
      'light'
    )
    expect(result['--bleed']).toBe('rgb(248, 248, 243)') // kami.50
  })

  it('selects dark value from { light, dark } in dark mode', () => {
    const result = resolveCustomTokens(
      { bleed: { light: 'kami.50', dark: 'sumi.900' } },
      palettes,
      'rgb',
      'dark'
    )
    expect(result['--bleed']).toBe('rgb(13, 13, 13)') // sumi.900
  })

  it('falls back to the other side when only one side is provided', () => {
    const result = resolveCustomTokens(
      { bleed: { light: 'kami.50' } },
      palettes,
      'rgb',
      'dark'
    )
    expect(result['--bleed']).toBe('rgb(248, 248, 243)')
  })

  it('returns empty object when custom is empty', () => {
    expect(resolveCustomTokens({}, palettes, 'rgb', 'light')).toEqual({})
  })
})

describe('validateCustomTokenNames', () => {
  it('throws when a custom token name collides with a NAMED_TOKEN', () => {
    expect(() => validateCustomTokenNames({ paper: 'kami.50' })).toThrow(/reserved/i)
    expect(() => validateCustomTokenNames({ 'ink-mute': 'kami.700' })).toThrow(/reserved/i)
    expect(() => validateCustomTokenNames({ 'on-primary': '#fff' })).toThrow(/reserved/i)
  })

  it('allows non-reserved names', () => {
    expect(() => validateCustomTokenNames({
      canvas: 'kami.50',
      'canvas-grid': '#d4d4d4',
      'tauri-traffic': 'oklch(0.72 0.14 28)'
    })).not.toThrow()
  })

  it('passes silently for empty custom object', () => {
    expect(() => validateCustomTokenNames({})).not.toThrow()
  })
})

describe('isColorValue', () => {
  it('returns true for rgb/hsl/oklch/hex values', () => {
    expect(isColorValue('rgb(0, 0, 0)')).toBe(true)
    expect(isColorValue('hsl(0 0% 0%)')).toBe(true)
    expect(isColorValue('oklch(0.5 0.1 30)')).toBe(true)
    expect(isColorValue('#aabbcc')).toBe(true)
    expect(isColorValue('#fff')).toBe(true)
  })

  it('returns false for non-color strings', () => {
    expect(isColorValue('8px')).toBe(false)
    expect(isColorValue('1.2s ease')).toBe(false)
    expect(isColorValue('var(--foo)')).toBe(false) // we don't auto-shortcut indirections
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test custom-tokens`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement custom-tokens.js**

Create `packages/unocss/src/custom-tokens.js`:

```javascript
import { ColorSpace } from '@rokkit/core'
import { NAMED_TOKENS } from '@rokkit/core'

const RESERVED_NAMES = new Set(NAMED_TOKENS)

/**
 * Throws when any custom token name collides with a reserved NAMED_TOKEN.
 * Reserved names are overridden via the `skin` palette mapping, not via `custom`.
 *
 * @param {Record<string, unknown>} custom
 */
export function validateCustomTokenNames(custom) {
  for (const name of Object.keys(custom)) {
    if (RESERVED_NAMES.has(name)) {
      throw new Error(
        `Custom token name "${name}" is reserved. ` +
        `Override it via the skin palette mapping instead.`
      )
    }
  }
}

function isPaletteRef(value) {
  if (typeof value !== 'string') return false
  // Match "name.shade" where shade is a numeric key (50, 100, 250, etc.)
  return /^[a-z][a-z0-9_-]*\.\d+$/i.test(value)
}

function resolvePaletteRef(ref, palettes, adapter) {
  const [paletteName, shade] = ref.split('.')
  const palette = palettes[paletteName]
  if (!palette || palette[shade] === undefined) {
    throw new Error(`Custom token references unknown palette shade "${ref}".`)
  }
  return adapter.wrap(palette[shade])
}

function resolveSingleValue(value, palettes, adapter) {
  if (isPaletteRef(value)) return resolvePaletteRef(value, palettes, adapter)
  return value // pass through raw
}

/**
 * Resolves a `custom` config block into a `{ '--name': 'value' }` map for a
 * given mode. Palette refs (`'kami.50'`) go through the colorSpace adapter;
 * raw strings pass through verbatim; `{ light, dark }` selects the side for
 * the active mode and falls back to the other side if missing.
 *
 * @param {Record<string, string | { light?: string, dark?: string }>} custom
 * @param {Record<string, Record<string, string>>} palettes
 * @param {string} colorSpace
 * @param {'light' | 'dark'} mode
 */
export function resolveCustomTokens(custom, palettes, colorSpace, mode) {
  const adapter = ColorSpace.create(colorSpace)
  const result = {}
  for (const [name, value] of Object.entries(custom)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const picked = mode === 'dark'
        ? (value.dark ?? value.light)
        : (value.light ?? value.dark)
      if (picked == null) continue
      result[`--${name}`] = resolveSingleValue(picked, palettes, adapter)
    } else {
      result[`--${name}`] = resolveSingleValue(value, palettes, adapter)
    }
  }
  return result
}

/**
 * Heuristic — does the resolved value look like a CSS color?
 * Used to decide whether to auto-emit bg-/text-/border- shortcuts.
 */
export function isColorValue(value) {
  if (typeof value !== 'string') return false
  return /^(rgb|rgba|hsl|hsla|oklch|oklab|hwb|color)\(/.test(value)
      || /^#[0-9a-fA-F]{3,8}$/.test(value)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test custom-tokens`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/unocss/src/custom-tokens.js packages/unocss/spec/custom-tokens.spec.js
git commit -m "$(cat <<'EOF'
feat(unocss): custom-token resolver

Resolves config.custom into CSS-var assignments. Supports palette refs
('kami.50'), raw values, and mode-aware { light, dark } objects. Validates
against reserved NAMED_TOKEN collisions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Preset preflights — core mode emit

**Files:**
- Modify: `packages/unocss/src/preset.ts`
- Modify: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/unocss/spec/preset.spec.js` (inside the outer `describe('presetRokkit', () => {…})`):

```javascript
describe('preflights — core mode (default)', () => {
  it('emits the 18 named tokens in :root', () => {
    const preset = presetRokkit()  // default tokens: 'core'
    const css = preset.preflights[0].getCSS()
    const rootBlock = css.split('[data-mode')[0]
    expect(rootBlock).toContain('--paper:')
    expect(rootBlock).toContain('--paper-soft:')
    expect(rootBlock).toContain('--ink:')
    expect(rootBlock).toContain('--ink-mute:')
    expect(rootBlock).toContain('--primary:')
    expect(rootBlock).toContain('--on-primary:')
    expect(rootBlock).toContain('--accent:')
    expect(rootBlock).toContain('--accent-soft:')
    expect(rootBlock).toContain('--focus-ring:')
  })

  it('emits z-aliases pointing at named layer (no palette indirection)', () => {
    const preset = presetRokkit()
    const css = preset.preflights[0].getCSS()
    expect(css).toContain('--color-surface-z0:var(--paper)')
    expect(css).toContain('--color-surface-z1:var(--paper-soft)')
    expect(css).toContain('--color-surface-z2:var(--paper-mute)')
    expect(css).toContain('--color-surface-z3:var(--paper-mute)')
    expect(css).toContain('--color-surface-z4:var(--paper-edge)')
  })

  it('does NOT emit raw palette vars in core mode', () => {
    const preset = presetRokkit()
    const css = preset.preflights[0].getCSS()
    // The core mode emit should not include --color-surface-50 / -100 / -900 etc.
    // These are the OUTPUT vars that would appear in extended mode.
    expect(css).not.toMatch(/--color-surface-50:rgb/)
    expect(css).not.toMatch(/--color-surface-900:rgb/)
  })

  it('still emits a [data-mode="dark"] block when skin uses dual-palette', () => {
    const preset = presetRokkit({
      skin: { surface: { light: 'slate', dark: 'zinc' } }
    })
    const css = preset.preflights[0].getCSS()
    expect(css).toContain('[data-mode="dark"]{')
    const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
    expect(darkBlock).toContain('--paper:')
  })
})

describe('preflights — extended mode', () => {
  it('emits the full palette + named-as-aliases', () => {
    const preset = presetRokkit({ tokens: 'extended' })
    const css = preset.preflights[0].getCSS()
    expect(css).toContain('--color-surface-50:rgb')
    expect(css).toContain('--color-surface-900:rgb')
    expect(css).toContain('--paper:var(--color-surface-50)')
    expect(css).toContain('--ink:var(--color-ink-900)')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test preset`
Expected: FAIL — new tests fail; existing tests probably also fail because the default emit shape changed.

- [ ] **Step 3: Refactor buildPreflights to branch on mode**

Modify `packages/unocss/src/preset.ts`. Add imports:

```typescript
import { resolveTokenMode } from './config.js'
import { resolveCustomTokens, validateCustomTokenNames } from './custom-tokens.js'
```

Replace `buildPreflights` with:

```typescript
function buildPreflights(theme, colormap, config) {
  const extraVars = [...buildTypographyVars(config.typography), ...buildRadiusVars(config.shape)]

  // Decide global mode (only support uniform mode for v1; per-role can be wired in later)
  const globalMode = typeof config.tokens === 'string' ? config.tokens : 'core'

  validateCustomTokenNames(config.custom ?? {})

  // Light block: named layer + z-aliases (or full palette in extended)
  const lightVars = buildVarsForMode(theme, colormap, config, 'light', globalMode)
  const lightCustom = resolveCustomTokens(config.custom ?? {}, config.palettes ?? {}, config.colorSpace, 'light')
  const lightBlock = `:root{${toCssBlock({ ...lightVars, ...lightCustom })}${
    extraVars.length ? `;${extraVars.join(';')}` : ''
  }}`

  // Dark block: only when skin has dual-palette OR custom has { light, dark }
  let darkBlock = ''
  const nonAliasColormap = Object.fromEntries(
    Object.entries(colormap).filter(([, v]) => !isAlias(v))
  )
  const hasDarkCustom = Object.values(config.custom ?? {}).some(
    (v) => v && typeof v === 'object' && !Array.isArray(v) && ('light' in v || 'dark' in v)
  )
  if (hasDualPaletteMapping(nonAliasColormap) || hasDarkCustom) {
    const darkTheme = new Theme({
      colors: { ...defaultColors, ...config.palettes },
      mapping: resolveMappingForMode(nonAliasColormap, 'dark'),
      colorSpace: config.colorSpace
    })
    const darkVars = buildVarsForMode(darkTheme, colormap, config, 'dark', globalMode)
    const darkCustom = resolveCustomTokens(config.custom ?? {}, config.palettes ?? {}, config.colorSpace, 'dark')
    darkBlock = `[data-mode="dark"]{${toCssBlock({ ...darkVars, ...darkCustom })}}`
  }

  return [{ getCSS: () => `${lightBlock}${darkBlock}` }]
}

/**
 * Builds the CSS-var assignments for one mode (light or dark).
 *  - core: named tokens (inlined palette values) + z-aliases pointing at named
 *  - extended: full palette (today's emit) + named tokens as palette aliases
 */
function buildVarsForMode(theme, colormap, config, _mode, globalMode) {
  if (globalMode === 'core') {
    const named = theme.getNamedTokens()
    const aliases = {}
    for (const role of Object.keys(colormap)) {
      if (isAlias(colormap[role])) continue
      Object.assign(aliases, theme.getZAliasesForCore(role))
    }
    return { ...named, ...aliases }
  }
  // extended: today's full palette + named-as-aliases
  const palette = theme.getPalette()
  const namedAliases = theme.getZAliasesForExtended()
  return { ...palette, ...namedAliases }
}
```

- [ ] **Step 4: Run preset tests**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test preset`

Expected: New `preflights — core mode (default)` and `preflights — extended mode` describes pass. **Existing tests that assert on `--color-surface-500:rgb…` in `:root` will need updating** to use `tokens: 'extended'` for those assertions, since the default is now core. Update them in step 5.

- [ ] **Step 5: Update existing tests that depended on full-palette emit**

In `packages/unocss/spec/preset.spec.js`, update each test in `describe('preflights — dark mode CSS block', …)` that asserts `--color-surface-500:rgb(…)` etc. to pass `tokens: 'extended'`:

```javascript
// Before:
const preset = presetRokkit({ skin: { surface: { light: 'slate', dark: 'zinc' } } })

// After:
const preset = presetRokkit({
  tokens: 'extended',
  skin: { surface: { light: 'slate', dark: 'zinc' } }
})
```

Apply this change to every test in that describe block that asserts on raw `--color-{role}-{shade}` patterns. The tests asserting on `--font-sans`, `--radius-*`, etc. don't need to change.

Also update the `color-mix alpha — opacity modifiers` describe — `theme.colors.primary[500]` and the `--color-primary-500` preflight assertions should explicitly pass `tokens: 'extended'`.

- [ ] **Step 6: Run preset tests again**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test preset`
Expected: All preset tests pass.

- [ ] **Step 7: Run full test suite**

Run: `cd /Users/Jerry/Developer/rokkit && bun run test:ci`
Expected: All ~2536 tests pass. Investigate and fix any new failures (likely in `@rokkit/themes` consumers that asserted on raw palette vars).

- [ ] **Step 8: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/unocss/src/preset.ts packages/unocss/spec/preset.spec.js
git commit -m "$(cat <<'EOF'
feat(unocss): preset preflights emit core named layer by default

buildPreflights now branches on config.tokens. Core mode emits the 18
named tokens with palette values inlined, plus --color-{role}-z* aliases
pointing at the named layer. Extended mode preserves today's full-palette
emit with named tokens as syntactic aliases.

Custom tokens from config.custom are resolved per mode and merged into the
preflight blocks.

Existing tests that asserted on raw palette vars now opt into extended mode.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Preset shortcuts — named tokens + z-routing

**Files:**
- Modify: `packages/unocss/src/preset.ts`
- Modify: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/unocss/spec/preset.spec.js`:

```javascript
describe('shortcuts — named layer', () => {
  it('emits bg-paper, bg-paper-soft, bg-paper-mute, bg-paper-edge', () => {
    const preset = presetRokkit()
    const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
    expect(keys).toContain('bg-paper')
    expect(keys).toContain('bg-paper-soft')
    expect(keys).toContain('bg-paper-mute')
    expect(keys).toContain('bg-paper-edge')
  })

  it('emits text-ink, text-ink-mute, text-ink-soft, text-ink-faint', () => {
    const preset = presetRokkit()
    const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
    expect(keys).toContain('text-ink')
    expect(keys).toContain('text-ink-mute')
    expect(keys).toContain('text-ink-soft')
    expect(keys).toContain('text-ink-faint')
  })

  it('bg-paper expands to background using --paper var', () => {
    const preset = presetRokkit()
    const entry = preset.shortcuts.find(s => s[0] === 'bg-paper')
    expect(entry).toBeDefined()
    // The expansion may be a string (className list) or an object (CSS). Accept either form.
    const expansion = entry[1]
    const str = typeof expansion === 'string' ? expansion : JSON.stringify(expansion)
    expect(str).toContain('--paper')
  })

  it('emits status soft shortcuts: bg-success-soft, bg-warning-soft, bg-danger-soft', () => {
    const preset = presetRokkit()
    const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
    expect(keys).toContain('bg-success-soft')
    expect(keys).toContain('bg-warning-soft')
    expect(keys).toContain('bg-danger-soft')
  })

  it('emits border-paper-edge for hairline borders', () => {
    const preset = presetRokkit()
    const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
    expect(keys).toContain('border-paper-edge')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test preset`
Expected: FAIL — no `bg-paper`, `text-ink-mute`, etc. shortcuts yet.

- [ ] **Step 3: Add named-layer shortcuts builder**

Modify `packages/unocss/src/preset.ts`. Add import:

```typescript
import { NAMED_TOKENS } from '@rokkit/core'
```

Add a builder function near `buildSemanticShortcuts`:

```typescript
const NAMED_SHORTCUT_PREFIXES = [
  { prefix: 'bg', prop: 'background' },
  { prefix: 'text', prop: 'color' },
  { prefix: 'border', prop: 'border-color' },
  { prefix: 'border-t', prop: 'border-top-color' },
  { prefix: 'border-b', prop: 'border-bottom-color' },
  { prefix: 'border-l', prop: 'border-left-color' },
  { prefix: 'border-r', prop: 'border-right-color' },
  { prefix: 'ring', prop: '--un-ring-color' },
  { prefix: 'fill', prop: 'fill' },
  { prefix: 'stroke', prop: 'stroke' }
]

function buildNamedShortcuts() {
  const shortcuts: Array<[string, object]> = []
  for (const name of NAMED_TOKENS) {
    for (const { prefix, prop } of NAMED_SHORTCUT_PREFIXES) {
      // Skip non-sensical pairings (e.g., bg-on-primary, fill-shadow-tint)
      if (name === 'on-primary' && prefix !== 'text') continue
      if (name === 'focus-ring' && prefix !== 'ring' && prefix !== 'border') continue
      if (name === 'shadow-tint') continue  // shadow-tint is used in box-shadow expressions only
      shortcuts.push([`${prefix}-${name}`, { [prop]: `var(--${name})` }])
    }
  }
  return shortcuts
}
```

Wire it into `buildShortcuts`:

```typescript
function buildShortcuts(theme, colormap, config) {
  return [
    ...buildSkinShortcuts(theme, config),
    ...buildSemanticShortcuts(theme, colormap),
    ...buildNamedShortcuts(),                  // ← new
    ...buildIconShortcuts(config)
  ]
}
```

- [ ] **Step 4: Run preset tests**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test preset`
Expected: New named-layer shortcut tests pass; existing tests still pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/unocss/src/preset.ts packages/unocss/spec/preset.spec.js
git commit -m "$(cat <<'EOF'
feat(unocss): named-layer Uno shortcuts (bg-paper, text-ink-mute, etc.)

Auto-emit bg-/text-/border-/ring-/fill-/stroke- shortcuts for every named
token, expanding directly to var(--name) — no z-alias indirection.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Custom-token shortcuts

**Files:**
- Modify: `packages/unocss/src/preset.ts`
- Modify: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `packages/unocss/spec/preset.spec.js`:

```javascript
describe('custom tokens', () => {
  it('emits custom CSS vars in :root', () => {
    const preset = presetRokkit({
      palettes: { kami: { 50: '#f8f8f3', 900: '#1a1a1a' } },
      skin: { surface: 'kami', ink: 'kami', primary: 'orange' },
      custom: { canvas: 'kami.50', 'canvas-grid': '#d4d4d4' }
    })
    const css = preset.preflights[0].getCSS()
    expect(css).toContain('--canvas:rgb(248, 248, 243)')
    expect(css).toContain('--canvas-grid:#d4d4d4')
  })

  it('emits bg-canvas shortcut for color-valued custom tokens', () => {
    const preset = presetRokkit({
      palettes: { kami: { 50: '#f8f8f3' } },
      custom: { canvas: 'kami.50' }
    })
    const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
    expect(keys).toContain('bg-canvas')
    expect(keys).toContain('text-canvas')
    expect(keys).toContain('border-canvas')
  })

  it('does NOT emit shortcuts for non-color custom tokens', () => {
    const preset = presetRokkit({
      custom: { 'canvas-grid-size': '8px', 'canvas-fade': '1.2s ease' }
    })
    const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
    expect(keys).not.toContain('bg-canvas-grid-size')
    expect(keys).not.toContain('text-canvas-fade')
  })

  it('throws when a custom token name collides with a reserved name', () => {
    expect(() => presetRokkit({ custom: { paper: 'kami.50' } })).toThrow(/reserved/i)
    expect(() => presetRokkit({ custom: { 'ink-mute': '#888' } })).toThrow(/reserved/i)
  })

  it('emits dark-mode custom token values when { light, dark } is used', () => {
    const preset = presetRokkit({
      palettes: { kami: { 50: '#f8f8f3' }, sumi: { 900: '#0d0d0d' } },
      custom: { bleed: { light: 'kami.50', dark: 'sumi.900' } }
    })
    const css = preset.preflights[0].getCSS()
    expect(css).toContain('[data-mode="dark"]')
    const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
    expect(darkBlock).toContain('--bleed:rgb(13, 13, 13)')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test preset`
Expected: New custom-tokens tests fail (shortcuts not emitted; reserved-name check not wired into preset).

- [ ] **Step 3: Add custom-token shortcut builder**

Modify `packages/unocss/src/preset.ts`. Add import:

```typescript
import { isColorValue } from './custom-tokens.js'
```

Add the builder:

```typescript
function buildCustomTokenShortcuts(config) {
  const custom = config.custom ?? {}
  const adapter = ColorSpace.create(config.colorSpace || 'rgb')
  const shortcuts: Array<[string, object]> = []

  for (const [name, value] of Object.entries(custom)) {
    // Determine if this token resolves to a color (light value or raw)
    let candidate
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      candidate = value.light ?? value.dark
    } else {
      candidate = value
    }
    // Palette refs are always colors
    const looksLikeColor = (typeof candidate === 'string')
      && (/^[a-z][a-z0-9_-]*\.\d+$/i.test(candidate) || isColorValue(candidate))
    if (!looksLikeColor) continue

    for (const { prefix, prop } of NAMED_SHORTCUT_PREFIXES) {
      // Skip prefixes that don't make sense for arbitrary tokens
      if (prefix === 'ring' && !name.endsWith('-ring')) continue
      shortcuts.push([`${prefix}-${name}`, { [prop]: `var(--${name})` }])
    }
  }
  return shortcuts
}
```

Wire it into `buildShortcuts`:

```typescript
function buildShortcuts(theme, colormap, config) {
  return [
    ...buildSkinShortcuts(theme, config),
    ...buildSemanticShortcuts(theme, colormap),
    ...buildNamedShortcuts(),
    ...buildCustomTokenShortcuts(config),     // ← new
    ...buildIconShortcuts(config)
  ]
}
```

Add `ColorSpace` import if not already present:

```typescript
import { ColorSpace } from '@rokkit/core'
```

- [ ] **Step 4: Run preset tests**

Run: `cd /Users/Jerry/Developer/rokkit && bun --cwd packages/unocss test preset`
Expected: All custom-token tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/unocss/src/preset.ts packages/unocss/spec/preset.spec.js
git commit -m "$(cat <<'EOF'
feat(unocss): custom-token Uno shortcuts for color-valued tokens

Color-valued custom tokens (palette refs, oklch/rgb/hex strings) auto-emit
bg-/text-/border- shortcuts. Non-color tokens (sizes, durations) emit only
the CSS var.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Demo config smoke test

**Files:**
- Modify: `demo/rokkit.config.js`

- [ ] **Step 1: Add tokens and custom blocks to the demo config**

Edit `demo/rokkit.config.js`. After the `colorSpace: 'oklch',` line, insert:

```javascript
  tokens: 'core',

  custom: {
    canvas:        'kami.50',
    'canvas-grid': '#d4d4d4',
    'canvas-bleed': { light: 'kami.100', dark: 'sumi.900' }
  },
```

- [ ] **Step 2: Build the demo / dev mode**

Run: `cd /Users/Jerry/Developer/rokkit/demo && bun run dev` (or `bun run build`)
Expected: Build succeeds; preset compiles without errors.

- [ ] **Step 3: Manually verify generated CSS includes the named layer**

Inspect generated CSS in the dev-server output or build artifact. Confirm presence of:
- `--paper:` `--paper-soft:` `--ink:` `--primary:` in `:root`
- `--canvas:` `--canvas-grid:` `--canvas-bleed:` in `:root`
- `--canvas-bleed:` (different value) in `[data-mode="dark"]`
- `--color-surface-z1:var(--paper-soft)` (alias layer)

If anything is missing, debug — likely a preflight wiring issue.

- [ ] **Step 4: Run E2E smoke**

Run: `cd /Users/Jerry/Developer/rokkit/demo && npx playwright test --reporter=line 2>&1 | tail -20` (if demo has e2e; if not, skip).

- [ ] **Step 5: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add demo/rokkit.config.js
git commit -m "$(cat <<'EOF'
demo: enable tokens:'core' and add custom canvas tokens as smoke test

Validates the trimmed-vocabulary preset wiring against a real consumer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: README and config docs

**Files:**
- Modify: `packages/unocss/README.md`

- [ ] **Step 1: Add a "Token modes" section**

Read `packages/unocss/README.md` first to match its existing style. Then append a section:

```markdown
## Token modes

By default, the preset emits a trimmed 18-name token vocabulary
(`--paper`, `--paper-soft`, `--paper-mute`, `--paper-edge`,
`--ink`, `--ink-mute`, `--ink-soft`, `--ink-faint`,
`--primary`, `--on-primary`, `--accent`, `--accent-soft`,
`--success`, `--success-soft`, `--warning`, `--warning-soft`,
`--danger`, `--danger-soft`, `--focus-ring`, `--shadow-tint`).

Palette values are inlined — no `--color-{role}-{shade}` indirection. The
`--color-{role}-z{0..10}` aliases are kept as a back-compat layer pointing
at the named tokens.

For chart/data-viz needs that genuinely require the full 11-shade ladder,
opt in to extended mode:

\`\`\`js
// rokkit.config.js
export default {
  tokens: 'extended'                       // full palette per role
  // or per-role:
  // tokens: { surface: 'core', primary: 'extended' }
}
\`\`\`

## Custom tokens

For app-level CSS vars that components never read but the app needs
(canvas backgrounds, mockup chrome, etc.), use the `custom` block:

\`\`\`js
export default {
  custom: {
    canvas:        'kami.50',                          // palette ref
    'canvas-grid': '#d4d4d4',                          // raw value
    'canvas-bleed': { light: 'kami.100', dark: 'sumi.900' }  // mode-aware
  }
}
\`\`\`

Color-valued custom tokens auto-emit `bg-{name}`, `text-{name}`,
`border-{name}` Uno shortcuts. Non-color values (sizes, durations) emit
only the CSS var.

Custom token names that collide with reserved named tokens (`paper`,
`ink-mute`, etc.) throw at config-load time — override those via the skin
palette mapping, not via `custom`.
```

- [ ] **Step 2: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/unocss/README.md
git commit -m "$(cat <<'EOF'
docs(unocss): document tokens mode and custom-tokens config

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Full-suite verification

**Files:** (no edits — verification only)

- [ ] **Step 1: Run lint**

Run: `cd /Users/Jerry/Developer/rokkit && bun run lint`
Expected: 0 errors. Warnings acceptable per CLAUDE.md.

- [ ] **Step 2: Run full test suite**

Run: `cd /Users/Jerry/Developer/rokkit && bun run test:ci`
Expected: All ~2536 tests pass + any new tests from this plan.

- [ ] **Step 3: Run UI tests**

Run: `cd /Users/Jerry/Developer/rokkit && bun run test:ui`
Expected: All UI tests pass. Components that already use `bg-surface-z*` via Uno utilities should render identically because the z-alias layer preserves their values.

- [ ] **Step 4: Build the site**

Run: `cd /Users/Jerry/Developer/rokkit/site && bun run build`
Expected: Build succeeds.

- [ ] **Step 5: Build the demo**

Run: `cd /Users/Jerry/Developer/rokkit/demo && bun run build`
Expected: Build succeeds.

- [ ] **Step 6: Update agents/journal.md**

Append a journal entry summarizing the work:

```markdown
## 2026-05-15 — Trimmed token vocabulary (release 1)

Shipped the named-token preset emit. `tokens: 'core'` (now default) emits
the 18-name vocabulary with palette values inlined; `--color-*-z*` aliases
preserved for back-compat. `custom: {…}` config block added for app-level
tokens with palette-ref + mode-aware resolution. Demo enabled as smoke test.

Out of scope (next release): migrate packages/themes/src/base/*.css to use
named vars instead of @apply bg-surface-z*; migrate zen-sumi style. Plan at
docs/superpowers/plans/2026-05-15-trimmed-token-vocabulary.md.

Spec: docs/superpowers/specs/2026-05-15-trimmed-token-vocabulary-design.md
Commits: <list commit hashes here after committing>
```

- [ ] **Step 7: Commit journal**

```bash
cd /Users/Jerry/Developer/rokkit
git add agents/journal.md
git commit -m "$(cat <<'EOF'
chore(journal): log trimmed token vocabulary release 1

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

**Spec coverage check:**
- Named vocabulary (18 tokens): Task 1 + Task 2 ✓
- Wiring strategy W3 (trim-with-aliases): Task 7 ✓
- Z-collapse mapping: Task 1 + Task 3 ✓
- Custom tokens config + resolver: Task 6 + Task 9 ✓
- Uno shortcuts (named + custom): Task 8 + Task 9 ✓
- Dark mode handling: Task 7 ✓
- Migration path (release 1 only): Task 10 (demo) ✓
- Out-of-scope items (base/* migration, z-alias retirement): explicitly deferred ✓

**Placeholders:** none — every step has concrete code or commands.

**Type consistency:** `NAMED_TOKENS`, `NAMED_TOKEN_SHADE_MAP`, `NAMED_TOKEN_ROLE_MAP`, `Z_COLLAPSE_MAP_SURFACE`, `Z_COLLAPSE_MAP_INK` used consistently across Tasks 1, 2, 3, 4, 8. Method names `getNamedTokens`, `getZAliasesForCore`, `getZAliasesForExtended` consistent across Tasks 2, 3, 4, 7. `resolveCustomTokens`, `validateCustomTokenNames`, `isColorValue` consistent across Tasks 6, 7, 9.

**Open questions from spec to surface during implementation:**
- The spec's open question on config key name uses `custom` — this plan commits to that.
- The spec's open question on `on-primary` derivation uses "surface.50" — this plan commits to that (matches "white-on-primary" default; skins can override via custom token).
- `shadow-tint` is included in the vocabulary but no Uno shortcut emits for it (its purpose is `box-shadow: 0 1px 3px var(--shadow-tint)` in hand-written CSS). Task 8 explicitly skips shortcuts for it.
