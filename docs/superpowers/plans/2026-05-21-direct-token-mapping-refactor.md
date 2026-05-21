# Direct Token Mapping — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-token override layer to skin config so authors can map any named token directly to a `palette.shade` reference (with optional `{ light, dark }` mode-awareness). Keeps existing role-level shorthand working as defaults. No removal of `INVERTED_ROLES`, no `1000 - shade` math, no `invert: true` flag — those become unnecessary because authors specify shades directly.

**Design spec:** `docs/superpowers/specs/2026-05-21-direct-token-mapping-design.md`

**Architecture:**
- `@rokkit/unocss` — accept `skin.tokens` config block; thread to Theme.
- `@rokkit/core` — Theme constructor accepts `tokenOverrides` map; getNamedTokens consults it first.
- Demo — optionally adopt `tokens: {…}` for cases where defaults don't fit.

**Test impact:** Minimal. Existing tests stay valid (default resolution unchanged). New tests cover override precedence + mode handling.

**Realistic cost:** ~4 hours.

---

## Task 1: Token override types and parser

**Files:**
- Modify: `packages/core/src/named-tokens.ts` — add `TokenOverride` type
- Modify: `packages/unocss/src/custom-tokens.js` — reuse `isPaletteRef` / `resolvePaletteRef` helpers; expose them

- [ ] **Step 1: Add the type**

  ```typescript
  // packages/core/src/named-tokens.ts
  export type TokenOverride = string | { light?: string; dark?: string }
  export type TokenOverrideMap = Partial<Record<NamedToken, TokenOverride>>
  ```

- [ ] **Step 2: Promote palette-ref helpers to exported utilities**

  In `packages/unocss/src/custom-tokens.js`, `isPaletteRef`, `resolvePaletteRef`, and `resolveSingleValue` are currently file-local. Export them so the Theme class (in `@rokkit/core`) can reuse the same parsing logic — OR move them to `@rokkit/core` to avoid a cross-package import.

  Recommended: move parser to `packages/core/src/palette-ref.ts` (new). Both `@rokkit/core` and `@rokkit/unocss` import from there.

- [ ] **Step 3: Test the parser**

  Add `packages/core/spec/palette-ref.spec.js`:
  - `parsePaletteRef('kami.50')` → `{ palette: 'kami', shade: '50' }`
  - `parsePaletteRef('shu.100/12')` → `{ palette: 'shu', shade: '100', alpha: '12' }` (if alpha syntax is part of the design)
  - Invalid refs throw with a clear message.

- [ ] **Step 4: Commit**

---

## Task 2: Theme accepts `tokenOverrides`

**Files:**
- Modify: `packages/core/src/theme.ts`
- Modify: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Add `tokenOverrides` constructor option**

  Theme stores `#tokenOverrides: TokenOverrideMap` and a `#mode: 'light' | 'dark'` field. Default `{}` for overrides.

- [ ] **Step 2: Resolve overrides first in `getNamedTokens`**

  ```typescript
  getNamedTokens(mode = 'light', perRoleModes) {
    const colors = { ...defaultColors, ...this.#colors }
    const result: Record<string, string> = {}
    for (const name of NAMED_TOKENS) {
      // Override path first
      const override = this.#tokenOverrides[name]
      if (override !== undefined) {
        const ref = pickModeValue(override, mode)
        if (ref) {
          const resolved = this.#resolvePaletteRef(ref, colors)
          if (resolved !== undefined) {
            result[`--${name}`] = resolved
            continue
          }
        }
      }
      // Fallback to existing role-level resolution
      const value = this.#resolveNamedToken(name, colors, perRoleModes)
      if (value !== undefined) result[`--${name}`] = value
    }
    return result
  }
  ```

  `pickModeValue` returns the string for `{ light, dark }` shape, or the bare string otherwise.

- [ ] **Step 3: Mode arg matters now**

  Previously `_mode` was unused. With overrides, `mode` is read to pick from `{ light, dark }`. Update existing call sites in preset to pass the right mode.

- [ ] **Step 4: Tests**

  ```javascript
  describe('Theme — tokenOverrides', () => {
    it('overrides --ink with a direct palette.shade ref', () => {
      const theme = new Theme({
        mapping: { surface: 'slate', ink: 'slate' },
        colorSpace: 'rgb',
        tokenOverrides: { ink: 'orange.500' }
      })
      const tokens = theme.getNamedTokens('light')
      // Expect --ink to be the orange.500 value, not slate.900
      expect(tokens['--ink']).toContain('rgb')  // verify it's a real color
    })

    it('mode-aware override picks the right side', () => {
      const theme = new Theme({
        mapping: { surface: 'slate' },
        colorSpace: 'rgb',
        tokenOverrides: { paper: { light: 'slate.50', dark: 'zinc.900' } }
      })
      const light = theme.getNamedTokens('light')
      const dark = theme.getNamedTokens('dark')
      expect(light['--paper']).not.toBe(dark['--paper'])
    })

    it('falls back to shade-map default when no override for a token', () => {
      const theme = new Theme({
        mapping: { surface: 'slate', ink: 'slate' },
        colorSpace: 'rgb',
        tokenOverrides: { ink: 'orange.500' }  // only ink overridden
      })
      const tokens = theme.getNamedTokens('light')
      // --paper should still be slate.50 via default
      expect(tokens['--paper']).toBe(/* slate.50 wrapped */)
    })
  })
  ```

- [ ] **Step 5: Commit**

---

## Task 3: Config accepts `skin.tokens`

**Files:**
- Modify: `packages/unocss/src/config.js`
- Modify: `packages/unocss/spec/config.spec.js`

- [ ] **Step 1: Accept `tokens` in skin block**

  In `loadConfig`, when normalizing `cfg.skin`, preserve a `tokens` field if present. Validate that all keys are in `NAMED_TOKENS`.

- [ ] **Step 2: Validation tests**

  - Empty `tokens: {}` accepted.
  - `tokens: { ink: 'orange.500' }` accepted.
  - `tokens: { 'ink-fant': '...' }` (typo) warns; doesn't throw.
  - `tokens: { paper: 'not-a-ref' }` throws (malformed ref).

- [ ] **Step 3: Commit**

---

## Task 4: Preset wires `tokenOverrides` to Theme

**Files:**
- Modify: `packages/unocss/src/preset.ts`
- Modify: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Extract and pass overrides**

  Where `new Theme({…})` is constructed, add `tokenOverrides: config.skin?.tokens ?? {}`.

- [ ] **Step 2: Mode-aware dark-block emit**

  The preset's dark-mode block builder already iterates named tokens. Ensure it passes `mode: 'dark'` to `getNamedTokens` so overrides resolve the dark side.

- [ ] **Step 3: Tests**

  Preflight CSS should contain the override value in `:root` for light-side and in `[data-mode='dark']` for dark-side.

- [ ] **Step 4: Commit**

---

## Task 5: Migrate demo to use `tokens` overrides (where useful)

**Files:**
- Modify: `demo/rokkit.config.js`

- [ ] **Step 1: Decide which tokens to override explicitly**

  Most defaults work. Likely candidates for explicit overrides:
  - `ink-soft`: avoid the 500-collision risk if it surfaces.
  - Maybe `ink-faint`: bump contrast for disabled text under the new compressed palette.

  For the immediate dark-mode issue (already resolved via inverted sumi + dual-palette), no override is strictly needed. The migration is more about demonstrating the pattern.

- [ ] **Step 2: Add a small `tokens` block for showcase purposes**

  ```js
  skin: {
    surface: { light: 'kami', dark: 'sumi' },
    ink:     { light: 'kami', dark: 'sumi' },
    primary: 'shu',
    // …
    tokens: {
      // Showcase: override --ink-faint to a slightly more visible shade
      'ink-faint': { light: 'kami.450', dark: 'sumi.450' }
    }
  }
  ```

  This is a demo-only addition; remove if it doesn't read well visually.

- [ ] **Step 3: Verify build + visual**

- [ ] **Step 4: Commit**

---

## Task 6: Update `demo/src/lib/data/skins.ts` (runtime store)

**Files:**
- Modify: `demo/src/lib/data/skins.ts`

- [ ] **Step 1: Skin colormaps can declare per-token overrides**

  Extend the `skinColormaps` shape to allow a `tokens` field alongside role mappings.

- [ ] **Step 2: Emit overrides in `rewriteSkinStyle`**

  When building the `:root` and `[data-mode='dark']` rules, include `--{token}: <resolved-ref>;` entries for each tokens override.

- [ ] **Step 3: Verify**

  Switch between skins in the app; confirm that overrides applied for one skin are cleared when switching to a skin without them.

- [ ] **Step 4: Commit**

---

## Task 7: Documentation

**Files:**
- Modify: `docs/design/06-themes.md` — document the `tokens` block, precedence rules, palette-ref syntax.
- Modify: `docs/backlog/2026-05-20-named-tokens-no-dark-flip.md` — mark resolved; link to this plan.
- Modify: `agents/journal.md` — add an entry.

- [ ] **Step 1: Add section to `06-themes.md`**

  Title: "Direct token mapping (per-token semantic overrides)." Cover when to use overrides vs role-level shorthand, the palette-ref syntax, mode-aware shape, and how this replaces the older "inverted role" concept.

- [ ] **Step 2: Update backlog file**

  Resolved-status section pointing at this plan.

- [ ] **Step 3: Journal entry + commit**

---

## Task 8: Full-suite verification

- [ ] **Step 1: Lint**

  `bun run lint` — 0 errors.

- [ ] **Step 2: Test suite**

  `bun run test:ci` — all green.

- [ ] **Step 3: Demo + site build**

  `cd demo && bun run build` and `cd site && bun run build`.

- [ ] **Step 4: Playwright suite**

  `cd demo && bunx playwright test` — snapshots should match (no visual change unless overrides explicitly added).

- [ ] **Step 5: Final commit**

---

## Self-Review Notes

**Spec coverage:** Tasks 1–4 implement the override mechanism end-to-end. Task 5 demonstrates use in the demo. Task 6 handles the runtime skin store. Tasks 7–8 document and verify.

**Risk:** Low. Pure addition — defaults unchanged, existing tests stay valid. Failure modes are limited to: typos in token names (caught by validation), malformed palette refs (caught by parser), missing palettes (caught at resolve time with a clear error).

**Rollback path:** Each task is its own commit; reverting the `tokens` block emit is harmless because it's an opt-in feature.

**What this plan does NOT do (intentionally):**
- Doesn't drop `INVERTED_ROLES` — stays as default for the role-level shorthand path.
- Doesn't change `NAMED_TOKEN_SHADE_MAP` — defaults unchanged for backward compat.
- Doesn't add an `invert: true` role flag — superseded by the override mechanism.
- Doesn't change the demo's sumi palette inversion — separate concern; the override mechanism could replace it but doesn't have to.
