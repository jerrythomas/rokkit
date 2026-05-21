# Named Tokens — Dark Mode Inversion Gap

**Date:** 2026-05-20 (updated 2026-05-21)
**Status:** Partial fix landed; full refactor planned

## Status

- **2026-05-20 (landed)**: Preset now emits `[data-mode="dark"]` for named tokens. Demo's `applySkin` writes a managed `<style>` element supporting dual-palette mappings. `compat.css` workaround removed.
- **2026-05-20 (landed)**: Sumi palette inverted (50 = darkest, 950 = lightest) so dark mode visually flips. Stopgap that conflates "palette convention" with "role inversion."
- **2026-05-21 (planned)**: Separate the two concerns via a per-role `invert: true` flag. Replaces the hardcoded `INVERTED_ROLES = new Set(['ink'])` so behavior is role-name-agnostic. Unifies `NAMED_TOKEN_SHADE_MAP` so paper- and ink-family tokens read low-end shades; invert flips via `1000 - shade`. Skips shade 500 in the ink ladder.

**Design spec:** `docs/superpowers/specs/2026-05-21-invert-flag-and-shade-map-design.md`
**Implementation plan:** `docs/superpowers/plans/2026-05-21-invert-flag-refactor.md`

The plan is broken into 8 sequenced tasks (1–6 implementation, 7–8 docs + verification), each its own commit. Realistic cost: ~1–1.5 days of careful work with test re-baselining and Playwright snapshot updates.

## Why the stopgap isn't enough

- Hardcoded `INVERTED_ROLES = new Set(['ink'])` couples behavior to a literal role name. If a user names their role `'pen'` or `'graphite'`, inversion silently breaks.
- `NAMED_TOKEN_SHADE_MAP['ink-soft'] = 500` collides with surface mid-tones at the same shade (the "500-on-500" problem the user flagged).
- The ink-family shade spread `[900, 700, 500, 300]` is asymmetric with paper-family `[50, 100, 200, 400]`. A unified low-end map + invert math is cleaner and removes the asymmetry.

## What's still pending (handled by the plan)

- Theme accepts per-role `invertedRoles: Set<string>` override.
- Preset reads `invert: true` from skin role mappings; threads to Theme.
- `NAMED_TOKEN_SHADE_MAP` ink shades shift to low end; invert math (`1000 - shade`) applied.
- `@rokkit/themes` dist regenerated.
- Demo's `skin:` and `skins.default` add explicit `invert: true` to ink.
- Demo's `applySkin` handles invert in the managed-style emit.
- `INVERTED_ROLES` constant removed once all consumers thread the flag.
- Documentation: add "Inverted roles and palette conventions" section to `docs/design/06-themes.md`.

## Out of scope

- Auto-detect palette direction by lightness comparison (rejected — fragile across color spaces; design choice should be explicit, not inferred).
- Per-token invert overrides (e.g., "ink uses invert but ink-faint doesn't"). Inversion is per-role only.
- Replacing the 24-name vocabulary itself.
