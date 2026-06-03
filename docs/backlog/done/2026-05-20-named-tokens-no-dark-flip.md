# Named Tokens — Dark Mode + Per-Token Control

**Date:** 2026-05-20 (updated 2026-05-21 after design pivot)
**Status:** Closed 2026-06-03 — **superseded by the trimmed token vocabulary** (24 named tokens at `packages/core/src/named-tokens.ts`). The dark-mode emit (`[data-mode="dark"]` blocks), `tokenOverrides`, and `ROLE_TO_VAR` mapping all shipped as part of the trimmed-vocab release (journal: "Trimmed Token Vocabulary (release 1) — complete 2026-05-15"). The 2026-05-21 direct-token-mapping plan is moot.

## Status

- **2026-05-20 (landed)**: Preset now emits `[data-mode="dark"]` for named tokens. Demo's `applySkin` writes a managed `<style>` element supporting dual-palette mappings. `compat.css` workaround removed.
- **2026-05-20 (landed)**: Sumi palette inverted (50 = darkest, 950 = lightest) so dark mode visually flips. Stopgap that conflates "palette convention" with "role inversion."
- **2026-05-21 (planned)**: Add a `tokens: { name: 'palette.shade' }` override layer to skin config. Per-token semantic mapping (like UnoCSS shortcuts). Replaces the previously-planned `invert: true` flag — direct mapping is simpler, more flexible, and removes the need for both `INVERTED_ROLES` name-coupling and `1000 - shade` math. The original "invert-flag" plan is superseded.

**Design spec:** `docs/superpowers/specs/2026-05-21-direct-token-mapping-design.md`
**Implementation plan:** `docs/superpowers/plans/2026-05-21-direct-token-mapping-refactor.md`

The plan is 8 sequenced tasks (1–6 implementation, 7–8 docs + verification), each its own commit. Realistic cost: **~4 hours** (much smaller than the previous invert-flag scope because defaults stay unchanged — the change is purely additive).

## Why the pivot

The original 2026-05-21 plan ("invert flag + unified shade map") added complexity:
- New `invert: true` role flag
- New `1000 - shade` math everywhere
- Refactor of `NAMED_TOKEN_SHADE_MAP`
- Required rebuilding `@rokkit/themes` dist
- ~50–80 test assertions to update

The direct-mapping pattern (UnoCSS shortcuts-shaped: `tokens: { ink: 'sumi.900', paper: 'kami.50' }`) achieves the same goals more simply:
- Authors specify shades directly — no shade-map math
- No role-name coupling — custom role names work without special-casing
- 500-on-500 collision avoidable by overriding the affected token
- Defaults unchanged — existing skins keep working

## What's pending (handled by the new plan)

- `Theme` accepts `tokenOverrides: Record<NamedToken, string | {light, dark}>`.
- Preset config accepts `skin.tokens: {…}`; threads to Theme.
- Palette-ref parser exported from `@rokkit/core` (reused by `custom-tokens.js` too).
- Resolution precedence: override → role-level fallback → skip.
- Demo runtime store (`applySkin`) emits per-token overrides via managed `<style>`.
- Documentation: add "Direct token mapping" section to `docs/design/06-themes.md`.

## Out of scope

- Auto-detect palette direction by lightness comparison.
- Per-token invert "math" — superseded by direct mapping.
- Replacing the 24-name vocabulary.
- Per-component theme overrides (different feature; `data-style` already covers it).
