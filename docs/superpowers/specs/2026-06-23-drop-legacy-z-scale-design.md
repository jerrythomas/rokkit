# Drop the legacy z-scale layer

**Date:** 2026-06-23
**Status:** Design approved, pending spec review
**Area:** `@rokkit/core`, `@rokkit/unocss`, `@rokkit/cli`, `@rokkit/themes`, `@rokkit/chart`, `apps/learn`, skills/docs

---

## Problem

Rokkit moved to a named-token vocabulary (`paper / ink / primary / on-primary / *-soft`,
24 tokens). The older **z-tone** dialect (`bg-surface-z1`, `text-primary-z5`, and the
`--color-{role}-z{n}` CSS vars) was kept only as a **back-compat layer** that collapses
onto the named tokens. It is now pure legacy: it teaches the wrong vocabulary, doubles the
emitted CSS surface, and keeps generator complexity (inverted-scale logic, a `TONE_MAP`)
alive for no functional gain. There are **no external consumers** — the author owns every
consumer — so it can simply be removed and the internal callers migrated to semantic
tokens in the same effort.

### Scope boundary (important)

Two var families look alike but are different:

- **z-tone aliases** — `--color-{role}-z{n}` (`z0…z10`) + `bg-surface-z1`-style utilities.
  Generated from `TONE_MAP` (`core/constants.js:186`). **← REMOVE.**
- **numeric ladder** — `--color-{role}-{shade}` (e.g. `--color-surface-700`), the
  `tokens: 'extended'` feature. **← KEEP.**

`@rokkit/chart` uses *both*: its z-tone refs (`--color-surface-z3`) migrate; its numeric
refs (`--color-surface-700`) stay.

### Migration is lossy, not a pure refactor

The mapping collapses 11 z-steps onto ~6 named tokens (e.g. `surface-z2` *and* `z3` both →
`paper-mute`; `z5` *and* `z6` → `ink-soft`). Applying it mechanically shifts some elements
by one shade — a real, if subtle, visual change. Hence visual verification is part of the
work, not optional.

## Goals

- Remove every `-z{n}` CSS variable and every z-tone utility class; replace usages with
  named (semantic) tokens where needed.
- Delete the z-tone generators and the `doctor` z-scale scanner entirely.
- Keep the `tokens: 'extended'` numeric ladder intact.
- Zero lint errors, all tests green, themes rebuilt, contrast e2e gate passing.

## Non-goals

- Touching the `extended` numeric ladder.
- A deprecation window or external migration tooling (no external consumers).
- Productizing the codemod into `doctor --fix`.
- The pending `18-state-patterns` token migration (separate effort).

---

## Versioning

Minor bump. Removing the emission is technically breaking, but the author owns and migrates
every consumer in the same effort, so nothing depends on it at release time.

## Migration mechanism — hybrid

- **`apps/learn` (~28 files, utility classes):** **codemod** via the documented mapping
  table (the same table `doctor` uses). Markup utility classes are mechanical and
  deterministic forward. Throwaway script under `scripts/`; run, verify, delete.
- **`packages/themes` (~12 files, `var(--color-*-z{n})`):** **hand-migrate.** Theme
  authors chose these shades deliberately; the lossy collapse may be wrong, so each ref is
  reviewed and the right named token chosen. Rebuild via the themes build and visually
  check.
- **`packages/chart` (2 files):** migrate z-tone refs to named tokens; **leave** the
  numeric `--color-surface-700`-style refs.
- **Stragglers** in `packages/core` / `unocss` / `cli` non-generator files and any
  remaining app files the grep surfaces.

### Mapping table (forward, lossy)

Surface role (`{prefix}-surface-z{n}` → `{prefix}-{token}`):

| z | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|----|
| token | `paper` | `paper-soft` | `paper-mute` | `paper-mute` | `paper-edge` | `ink-soft` | `ink-soft` | `ink-mute` | `ink-mute` | `ink` | `ink` |

Ink role (inverted):

| z | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|----|
| token | `ink` | `ink-mute` | `ink-mute` | `ink-soft` | `ink-soft` | `paper-edge` | `paper-edge` | `paper-mute` | `paper-mute` | `paper-soft` | `paper` |

Accent / status roles (`primary`, `accent`, `success`, `warning`, `danger`, `error`,
`info`): `z0–z2 → {role}-soft`, `z3+ → {role}`. Exception: `primary` has no `-soft`
companion — `primary-z*` → `primary` (use `accent-soft` or a custom token for a tinted
primary background).

CSS-var form follows the same table: `var(--color-surface-z1)` → `var(--paper-soft)`,
`var(--color-primary-z5)` → `var(--primary)`, etc.

---

## Work breakdown

### Part 1 — Migrate consumers (FIRST, so the build never breaks)

`apps/learn` (codemod), `packages/themes` (hand), `packages/chart` (z-tone only),
stragglers. Verify after each package.

### Part 2 — Delete the generators

- `core/constants.js` — `TONE_MAP`
- `core/theme.ts` — `getZScaleCSS()` and its `:root` / `[data-mode="dark"]` z-alias
  emission
- `core/named-tokens.ts` — `ZSlot`, `Z_SLOTS`, the `--color-{role}-z{n}` alias map
- `unocss/preset.ts` (~356-367) — z-tone utility shortcut generation (inverted-scale logic)
- `cli/doctor.js` (~368-516) — the z-scale mapping, the advisory scanner, and its console
  output block
- Remove/replace z-scale assertions in specs (`core/spec/theme.spec.js`,
  `unocss/spec/preset.spec.js`, and any others surfaced by the suite)

### Part 3 — Docs / skills cleanup

- `semantic-styles-rokkit` skill — delete the "Migrating from z-scale" section, the
  back-compat mentions, and the `doctor` z-utility row
- `skin-system-rokkit` skill, `cli/src/init.js` header comment, `agents/references.md`,
  and any `docs/design/*.md` / `docs/llms/*` that reference z-scale — strip references

---

## Verification

- `bun run lint` → 0 errors.
- `bun run test:ci` → green (after spec updates).
- Rebuild themes (`bun run` build-themes) and confirm no `--color-*-z{n}` remain in
  `dist`.
- **Contrast e2e gate** on `/embed/gallery` — the regression net for the lossy shade
  shifts — plus a manual before/after visual review of the gallery.
- Grep gate: no `-z{n}` utilities or `--color-*-z{n}` vars remain in `packages/**/src` or
  `apps/**` (excluding `dist`/`.svelte-kit`).

## Sequencing

Consumers → generators → docs, so the build stays green throughout.
