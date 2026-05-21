# Invert Flag + Unified Shade Map — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `@rokkit/core` named-token resolution to use a per-role `invert` flag (replacing the hardcoded `INVERTED_ROLES = new Set(['ink'])` constant). Change `NAMED_TOKEN_SHADE_MAP` so paper- and ink-family tokens all use low-end shades; the invert flag flips reads via `1000 - shade`. Eliminates role-name coupling and the 500-on-500 collision.

**Design spec:** `docs/superpowers/specs/2026-05-21-invert-flag-and-shade-map-design.md`

**Architecture:**
- `@rokkit/core` — `NAMED_TOKEN_SHADE_MAP` shifts ink shades to low end; `Theme` accepts per-role invert info; `INVERTED_ROLES` becomes a compat fallback.
- `@rokkit/unocss` — preset reads `invert: true` from skin role mappings, threads into Theme.
- `@rokkit/themes` — rebuilt with new shade map values.
- Demo — declares `invert: true` on ink explicitly; revert ad-hoc sumi inversion.

**Test impact:** ~50–80 test assertions across `@rokkit/core/spec/named-tokens.spec.js` and `theme.spec.js`. Plus possible visual regressions in `demo/e2e/*.e2e.ts` snapshots (~30 PNGs).

---

## File Structure

**Modify:**
- `packages/core/src/named-tokens.ts` — shift ink shades to low-end; document the model.
- `packages/core/src/theme.ts` — accept per-role invert; apply `1000 - shade` in `#resolveShadeToken` and `#resolveDerivedToken`; same in `getZAliasesForExtended`.
- `packages/core/src/constants.js` — keep `INVERTED_ROLES` as a deprecated default fallback (no removal yet).
- `packages/core/spec/named-tokens.spec.js` — update shade assertions for ink family.
- `packages/core/spec/theme.spec.js` — update shade assertions; add new tests for `invertedRoles` constructor arg.
- `packages/unocss/src/config.js` — accept `invert: true` in skin role mappings; preserve through `loadConfig`.
- `packages/unocss/src/preset.ts` — extract invert flags from skin into a Set; pass to `new Theme({ invertedRoles })`.
- `packages/themes/build.mjs` — verify build picks up new shade values; commit regenerated `dist/*.css`.
- `demo/rokkit.config.js` — add `invert: true` to ink role in both `skin` (top-level) and `skins.default`; revert sumi to normal convention (50 lightest, 950 darkest) since the invert flag now handles the flip.
- `demo/src/lib/data/skins.ts` — handle invert flag in `skinColormaps` and `rewriteSkinStyle`; emit inverted shade indices for inverted roles.

**Create:**
- (none) — all changes touch existing files.

---

## Task 1: Add `invertedRoles` to Theme without changing shade map

**Goal:** Land the configurable inversion API first as additive behavior. Existing tests still pass because the default `invertedRoles` matches `INVERTED_ROLES`.

**Files:**
- Modify: `packages/core/src/theme.ts`
- Modify: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Add `invertedRoles` to Theme constructor**

  In `packages/core/src/theme.ts`, the `Theme` class accepts an optional `invertedRoles?: Set<string>` option. When unset, default to `INVERTED_ROLES` (the existing constant). Store on `#invertedRoles`.

- [ ] **Step 2: Wire #invertedRoles through #resolveShadeToken (no behavior change yet)**

  Update `#resolveShadeToken` to call a new private `#isInverted(role)` that reads `#invertedRoles` instead of `INVERTED_ROLES.has(role)`. Behavior unchanged because defaults match.

- [ ] **Step 3: Same for getZAliasesForExtended, getPalette, getColorRules**

  Replace every `INVERTED_ROLES.has(name)` / `.has(role)` call in `theme.ts` with `this.#isInverted(name)` / `(role)`. Confirm `grep "INVERTED_ROLES" packages/core/src/theme.ts` returns no results after.

- [ ] **Step 4: Test — default behavior unchanged**

  Run `bun --cwd packages/core test theme` — all existing tests must pass without modification.

- [ ] **Step 5: Test — explicit invertedRoles override**

  Add a new describe block in `theme.spec.js`:

  ```javascript
  describe('Theme — explicit invertedRoles override', () => {
    it('treats a custom role as inverted when passed in constructor', () => {
      const theme = new Theme({
        mapping: { surface: 'slate', pen: 'slate' },
        colorSpace: 'rgb',
        invertedRoles: new Set(['pen'])
      })
      // Use the same assertions you'd use for 'ink' against the role 'pen'.
      // Specifically: getPalette returns inverted z-scale for 'pen'.
    })

    it('does NOT treat ink as inverted when invertedRoles excludes it', () => {
      const theme = new Theme({
        mapping: { surface: 'slate', ink: 'slate' },
        colorSpace: 'rgb',
        invertedRoles: new Set()
      })
      // ink should now behave like a normal role — z-scale not inverted.
    })
  })
  ```

  Run, confirm they pass.

- [ ] **Step 6: Commit**

  ```bash
  cd /Users/Jerry/Developer/rokkit
  git add packages/core/src/theme.ts packages/core/spec/theme.spec.js
  git commit -m "$(cat <<'EOF'
  feat(core): Theme accepts invertedRoles override

  Adds optional `invertedRoles: Set<string>` to Theme constructor; replaces
  all `INVERTED_ROLES.has(role)` call sites in theme.ts with a private
  #isInverted(role) that reads the instance set. Default falls back to
  INVERTED_ROLES constant — no behavior change for existing call sites.

  Foundation for per-skin invert config (next: preset wiring + shade-map
  refactor). Removes the role-name coupling for the inversion behavior.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 2: Thread `invert` through preset config

**Files:**
- Modify: `packages/unocss/src/config.js`
- Modify: `packages/unocss/src/preset.ts`
- Modify: `packages/unocss/spec/config.spec.js`
- Modify: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Update `loadConfig` to preserve `invert` in skin role mappings**

  In `packages/unocss/src/config.js`, when normalizing `cfg.skin`, accept role values shaped like `{ light, dark, invert: true }` and pass `invert` through unchanged.

- [ ] **Step 2: Add a helper to extract inverted role set**

  ```javascript
  // packages/unocss/src/config.js
  export function getInvertedRoles(skin) {
    const result = new Set()
    for (const [role, mapping] of Object.entries(skin || {})) {
      if (typeof mapping === 'object' && mapping !== null && mapping.invert === true) {
        result.add(role)
      }
    }
    return result
  }
  ```

- [ ] **Step 3: Preset passes `invertedRoles` to Theme**

  In `packages/unocss/src/preset.ts`, where `new Theme({...})` is called, add `invertedRoles: getInvertedRoles(config.skin)` to the options.

- [ ] **Step 4: Tests**

  In `config.spec.js`:
  - `loadConfig({ skin: { ink: { light: 'slate', dark: 'zinc', invert: true } } })` preserves the invert flag.
  - `getInvertedRoles({...})` returns the correct Set.

  In `preset.spec.js`:
  - Preset built with `skin.ink.invert = true` emits `--ink` resolving to the high-end shade. (For now, this just confirms behavior matches when INVERTED_ROLES default also picks ink — i.e., parity. Real verification comes in Task 3.)

- [ ] **Step 5: Commit**

---

## Task 3: Refactor `NAMED_TOKEN_SHADE_MAP` to unified low-end + invert math

**Goal:** This is the breaking change. Ink-family tokens move to shade values `[50, 100, 200, 400]`; Theme applies `1000 - shade` when the role is inverted.

**Files:**
- Modify: `packages/core/src/named-tokens.ts`
- Modify: `packages/core/src/theme.ts` — apply invert in `#resolveShadeToken` and `getZAliasesForExtended`.
- Modify: `packages/core/spec/named-tokens.spec.js`
- Modify: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Update `NAMED_TOKEN_SHADE_MAP`**

  ```typescript
  // packages/core/src/named-tokens.ts
  export const NAMED_TOKEN_SHADE_MAP: Record<NamedToken, number | 'derived'> = {
    paper: 50,
    'paper-soft': 100,
    'paper-mute': 200,
    'paper-edge': 400,
    ink: 50,            // inverted via skin config → reads palette[950]
    'ink-mute': 100,    // → palette[900]
    'ink-soft': 200,    // → palette[800]
    'ink-faint': 400,   // → palette[600]
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
    error: 500,
    'error-soft': 100,
    info: 500,
    'info-soft': 100,
    'focus-ring': 500,
    'shadow-tint': 50   // was 900 — same flip
  }
  ```

  Note `shadow-tint` is on the ink role; under invert it reads palette[950]. Confirm this matches the "dark drop shadow" intent (ink at the deepest shade).

- [ ] **Step 2: Apply invert in `#resolveShadeToken`**

  ```typescript
  #resolveShadeToken(role, shade, palette, perRoleModes) {
    const effectiveShade = this.#isInverted(role) ? 1000 - shade : shade
    const roleMode = perRoleModes?.[role] ?? 'core'
    if (roleMode === 'extended') return `var(--color-${role}-${effectiveShade})`
    const raw = palette[String(effectiveShade)]
    return raw !== undefined ? this.#adapter.wrap(raw) : undefined
  }
  ```

- [ ] **Step 3: Apply invert in `getZAliasesForExtended`**

  Same math — when emitting `--{token}: var(--color-{role}-{shade})` for an inverted role, use `1000 - shade`.

- [ ] **Step 4: Update `named-tokens.spec.js`**

  - `it('maps ink ladder to shades 50/100/200/400')` (was `900/700/500/300`)
  - Reasonably, also add: `it('keeps paper and ink ladders at the same shade values')` — for documenting the unified-map intent.

- [ ] **Step 5: Update `theme.spec.js`**

  Every test that asserts a specific resolved ink value needs updating. With slate palette and ink invert:

  | Test name (approx.) | Old expected | New expected |
  | --- | --- | --- |
  | `resolves ink to ink palette shade 900` | rgb of slate.900 | rgb of slate.950 |
  | `--ink-mute resolves to shade 700` | rgb of slate.700 | rgb of slate.900 |
  | `--ink-soft resolves to shade 500` | rgb of slate.500 | rgb of slate.800 |
  | `--ink-faint resolves to shade 300` | rgb of slate.300 | rgb of slate.600 |

  Plus the `getZScaleCSS — inverted roles` tests — re-derive expected values under the new math.

- [ ] **Step 6: Run full core suite**

  ```bash
  bun --cwd packages/core test
  ```

  Expected: all green after the test updates. Failures here mean an assertion was missed.

- [ ] **Step 7: Commit**

---

## Task 4: Rebuild `@rokkit/themes` dist

**Files:**
- Modify: `packages/themes/dist/*.css` (regenerated)

- [ ] **Step 1: Run themes build**

  ```bash
  bun --cwd packages/themes run build
  ```

  Expected: `packages/themes/dist/base.css`, `rokkit.css`, `minimal.css`, `material.css`, `frosted.css`, `zen-sumi.css` all regenerated. Inspect diffs — only ink-family resolved values should change.

- [ ] **Step 2: Check generated ink values**

  ```bash
  grep -E "^\s*--ink:|^\s*--ink-mute:|^\s*--ink-soft:|^\s*--ink-faint:" packages/themes/dist/base.css | head -10
  ```

  Each ink-* token should now read a shade 100 higher (for ink/ink-mute) or 100 different (for ink-soft/ink-faint) — the inverted reads.

- [ ] **Step 3: Commit the regenerated dist**

---

## Task 5: Demo config — revert sumi inversion + add `invert: true` to ink

**Files:**
- Modify: `demo/rokkit.config.js`
- Modify: `demo/src/lib/data/skins.ts`

- [ ] **Step 1: Revert sumi to normal convention**

  In `demo/rokkit.config.js`, the inverted sumi values (added 2026-05-20) revert to the original definition (50 = lightest, 950 = darkest sumi-ink). The invert flag now handles the flip.

  Actually — re-derive: with `invert: true` on ink and sumi-normal-convention:

  Light mode + kami: ink reads kami[1000-50] = kami.950 = darkest ✓
  Dark mode + sumi-normal: ink reads sumi[1000-50] = sumi.950 = ??? — if sumi.950 is darkest sumi-ink, this gives DARK text on dark bg → wrong.

  So sumi still needs to be inverted-convention (50 = darkest) for the dark-mode flip to land at the right end. The invert flag is independent of the palette convention.

  **Decision:** sumi STAYS as inverted (current state). Document this in the design doc — palette convention controls "which end is the canvas," invert flag controls "which end the role reads."

- [ ] **Step 2: Add `invert: true` to ink role**

  In `rokkit.config.js`, both top-level `skin:` and `skins.default`:

  ```js
  skin: {
    surface: { light: 'kami', dark: 'sumi' },
    ink:     { light: 'kami', dark: 'sumi', invert: true },
    ...
  },
  skins: {
    default: {
      surface: { light: 'kami', dark: 'sumi' },
      ink:     { light: 'kami', dark: 'sumi', invert: true },
      ...
    },
    ...
  }
  ```

- [ ] **Step 3: Update `demo/src/lib/data/skins.ts`**

  Accept `invert` flag in `skinColormaps` entries; thread into `rewriteSkinStyle` so the emitted CSS for inverted roles uses the inverted shade indices.

- [ ] **Step 4: Build + verify**

  ```bash
  cd demo && bun run build
  ```

- [ ] **Step 5: Visual verification — light AND dark**

  Open `http://localhost:5173/app`, toggle mode. Expected:
  - Light: kami canvas (light) with darkest-kami ink text
  - Dark: inverted-sumi canvas (dark) with lightest-sumi-i.e.-warm-paper ink text

- [ ] **Step 6: Re-run Playwright suite**

  ```bash
  cd demo && bunx playwright test
  ```

  Some snapshots will mismatch due to the ink value shifts. Inspect each diff; for legitimate visual changes (ink slightly darker), update the snapshot:

  ```bash
  cd demo && bunx playwright test --update-snapshots
  ```

- [ ] **Step 7: Commit demo changes + updated snapshots**

---

## Task 6: Drop the `INVERTED_ROLES` constant entirely

**Goal:** Now that all consumers thread the flag through explicitly, the deprecated constant can go.

**Files:**
- Modify: `packages/core/src/constants.js` — remove `INVERTED_ROLES`
- Modify: `packages/core/src/theme.ts` — default `invertedRoles` becomes empty Set
- Modify: `packages/core/spec/index.spec.js` — drop INVERTED_ROLES from exports check

- [ ] **Step 1: Verify no remaining consumers**

  ```bash
  grep -rn "INVERTED_ROLES" packages/ apps/ demo/ docs/ 2>/dev/null | grep -v dist | grep -v node_modules
  ```

  Expected: no results other than the file we're about to remove from and possibly references in plan/spec docs.

- [ ] **Step 2: Remove**

  Delete the `export const INVERTED_ROLES = new Set(['ink'])` line from `packages/core/src/constants.js`. Remove the import from `theme.ts`. Default `#invertedRoles` to `new Set()`.

- [ ] **Step 3: Update `spec/index.spec.js`**

  Remove the `'INVERTED_ROLES'` entry from the exports assertion.

- [ ] **Step 4: Run full core suite**

  ```bash
  bun --cwd packages/core test
  ```

  Expected: all green. If any test still expects ink to auto-invert without an explicit flag, that test needs to either (a) pass `invertedRoles: new Set(['ink'])` to the Theme it constructs, or (b) accept the new "ink without invert is just a normal role" behavior and update its expectations.

- [ ] **Step 5: Commit**

---

## Task 7: Documentation

**Files:**
- Modify: `docs/design/06-themes.md` — document the invert flag, palette conventions, and ink-flatness recommendation.
- Modify: `docs/backlog/2026-05-20-named-tokens-no-dark-flip.md` — mark resolved; link to this plan.

- [ ] **Step 1: Add a section to `06-themes.md`**

  Title: "Inverted roles and palette conventions." Cover the design model, when to use invert, when to use palette swap, and the ink-flatness recommendation.

- [ ] **Step 2: Update the backlog file**

  Add a "Resolved" status block at the top pointing to this plan.

- [ ] **Step 3: Update `agents/journal.md`**

  Add an entry summarizing the refactor.

- [ ] **Step 4: Commit**

---

## Task 8: Full-suite verification

- [ ] **Step 1: Lint**

  ```bash
  bun run lint
  ```

  Expected: 0 errors.

- [ ] **Step 2: Full test suite**

  ```bash
  bun run test:ci
  ```

  Expected: all tests pass.

- [ ] **Step 3: Demo + site builds**

  ```bash
  cd demo && bun run build
  cd ../site && bun run build
  ```

  Expected: both succeed.

- [ ] **Step 4: Playwright suite**

  ```bash
  cd demo && bunx playwright test
  ```

  Expected: all visual regression snapshots pass (after the Task 5 update if needed).

- [ ] **Step 5: Final journal entry + commit**

---

## Self-Review Notes

**Spec coverage:** Tasks 1–3 implement the design's main mechanism (invert flag, unified shade map). Task 4 propagates to built theme CSS. Tasks 5–6 migrate the demo and remove the legacy constant. Tasks 7–8 document and verify.

**Risk:** ink-family colors will look different after the refactor. The Playwright snapshots will need re-baselining (Task 5). Manual inspection should confirm the new look is acceptable; if not, the ink palette may need redesign (`docs/design/06-themes.md` recommendation).

**Rollback path:** Each task is its own commit. Reverting any single commit should leave the system buildable. The full refactor can be reverted by reverting Tasks 3–6 (keeping Task 1's API addition is harmless).
