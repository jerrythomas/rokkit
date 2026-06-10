# 20 — Skin System

**Status:** Designed 2026-06-10 (approved). Implementation plan: `docs/superpowers/plans/<date>-skin-system.md`.

## Overview

Make **skin** — which palette/colorset backs each named token (`paper`/`ink`/`primary`/`accent`/…) —
a first-class, switchable dimension with exact parity to `style` and `mode`. Today `style` and
`mode` each have a clean trio (`vibe` field → `themable` writes a `data-*` attribute →
`ThemeSwitcherToggle`), but **skin has none of it** in the published packages: `vibe` has no
`skin` field, `themable` never writes `data-skin`, no published CSS responds to `[data-skin]`, and
there is no shipped skin switcher. `data-skin` is half-built — `themeHook` writes it pre-paint and
the docs call it one of the "three orthogonal dimensions," but the preset emits skins as
`skin-{name}` *CSS classes* and only the learn app (`data/skins.ts` + `stores/theme.svelte.ts` +
`ThemeControls`) makes runtime skin-switching work, app-locally. This spec promotes that
proof-of-concept onto the core and finishes `data-skin`.

## Decisions (locked during brainstorming)

1. **`data-skin='name'` is THE mechanism.** The preset emits the **default** skin's tokens on
   `:root` and each **non-default** skin as `[data-skin='name']` blocks (+ a
   `[data-mode='dark'][data-skin='name']` block for dual-palette skins). This **replaces** the
   `skin-{name}` utility-class approach — exact parity with how `[data-mode='dark']` works.
2. **Drop the `skin-{name}` class** (breaking change to `presetRokkit` output) — **provided the
   library ships a few built-in default skins** as `[data-skin]` blocks so consumers have working
   skins out of the box. In-repo only `packages/themes/src/palette.css` and the learn app use the
   class, so the blast radius is small; called out in release notes.
3. **v1 scope = named-skin switching only** for skins known at config/build time. Per-role
   overrides + `PaletteManager` are **not** folded into the skin system in v1 (they remain a thin
   layer on the same applicator). `vibe.skin` holds a **name only** (like `vibe.style`).
4. **`skinnable` is rehabilitated, not removed** — it becomes the documented runtime var-applicator
   primitive (`use:skinnable={varMap}` writes named-token CSS vars inline). Heavily used in Phase 3.

## Architecture — the three orthogonal dimensions (after this)

| Dimension | `vibe` state | `themable` writes | Switcher | CSS |
|---|---|---|---|---|
| style | `vibe.style` | `data-style` | `ThemeSwitcherToggle` | `[data-style='x']` |
| mode | `vibe.mode` | `data-mode` | `ThemeSwitcherToggle` | `[data-mode='dark']` |
| **skin** | **`vibe.skin`** (new) | **`data-skin`** (new) | **`SkinSwitcherToggle`** (new) | `:root` default + **`[data-skin='name']`** (new) |

### Unit 1 — `vibe.skin` (`@rokkit/states`, `vibe.svelte.js`)

- Add `#skin = $state('default')` with a getter and a validating setter (mirrors `#style` +
  `#allowedStyles`). Add `#allowedSkins = $state([...])` with a getter/setter, consumer-set — the
  states package can't read `rokkit.config.js`, so the app declares its skin names (exactly as
  `vibe.allowedStyles` is set today, e.g. in dbd).
- Include `skin` in `save()` / `load()` / `update()` so it persists with style/mode/density under
  the same storage key.
- `vibe.skin` is a **name** (string). No colorset/overrides in v1.

### Unit 2 — `themable` skin sync (`@rokkit/actions`, `themable.svelte.js`)

- In the existing `$effect`, add `root.dataset.skin = theme.skin` next to the
  `data-style`/`data-mode`/`data-density` writes, plus the `document.documentElement` mirror.
- `themeHook` (`@rokkit/unocss/hooks`) already writes `data-skin` from persisted state pre-paint, so
  switching is flash-free and SSR-correct. No `themeHook` change needed.

### Unit 3 — preset + themes emit `[data-skin]` CSS (`@rokkit/unocss` + `@rokkit/themes`)

- `buildSkinShortcuts` (`packages/unocss/src/preset.ts`) changes from emitting `skin-{name}`
  classes to emitting:
  - the **default** skin's named-token vars on `:root` (bare), and
  - each **non-default** skin as `[data-skin='name'] { --paper: …; --ink: …; … }`, plus
    `[data-mode='dark'][data-skin='name'] { … }` when the skin is dual-palette.
- `packages/themes/src/palette.css`'s `:root { @apply skin-default }` is removed/replaced — the
  default skin's vars now come from the preset's `:root` emission.
- **Built-in skins:** ship a small curated set (the `default` + a few alternates, sourced from the
  existing palette definitions / the learn app's `skinColormaps`; exact list finalized in the plan)
  so `data-skin='…'` works out of the box without any consumer config.

### Unit 4 — `SkinSwitcherToggle` (`@rokkit/app`)

- New component parallel to `ThemeSwitcherToggle`: a `Toggle` (from `@rokkit/ui`) driven by
  `vibe.skin` over a `skins` option list (defaults to `vibe.allowedSkins`), with icons/labels and
  the same variant/size API. Separate component — skin is a distinct concern from mode — but the
  same store-wired idiom.

### Unit 5 — `skinnable` rehabilitated (`@rokkit/actions`, `skinnable.svelte.js`)

- Keep the action; document it as the **runtime var-applicator primitive**: `use:skinnable={varMap}`
  reactively writes named-token CSS custom properties inline on an element (e.g.
  `{ '--paper': 'oklch(…)', '--primary': 'oklch(…)' }`). Tighten its JSDoc/types.
- In v1 the config-skin happy path is pure `[data-skin]` CSS (no JS), so `skinnable` is the public
  escape hatch for applying a colorset that isn't pre-baked — the seam Phase 3 builds on. Its name
  may be revisited in Phase 3.

## Consumer + demo (`apps/learn`)

Promote learn's local skin system onto the core: drive `vibe.skin` + `themable`'s `data-skin` + the
published `[data-skin]` CSS instead of the app-local `<style>`-injection (`installSkinSheet`/
`applySkin`) for **config** skins; render `SkinSwitcherToggle` in `ThemeControls`. Keep the local
`<style>`-injection path only for genuinely dynamic skins (foreshadowing Phase 3). `stores/theme.svelte.ts`'s
`skin` field/`setSkin` delegate to `vibe.skin`.

## Skill + guide

- `skin-system-rokkit` skill in `packages/cli/skills/` (joins the `rokkit skills` catalog → **4
  skills**).
- A skins guide (`docs/llms/guides/skins.txt` + a learn guide page), a `SkinSwitcherToggle`
  component doc, and export updates to the `states`/`actions`/`unocss`/`themes` package docs.
- Reconcile the `data-skin`-vs-`skin-{name}`-class wording touched in the earlier docs audit so the
  docs now correctly describe `data-skin` as the live mechanism.

## Phasing

- **v1 (this spec):** named-skin switching for `rokkit.config`/built-in skins — Units 1–5 + consumer
  + skill + guide.
- **Phase 2:** per-role overrides as a natural extension of skins config (`vibe.skin` may grow to
  `{ name, overrides }` or a config-level override layer); `PaletteManager` wired in.
- **Phase 3:** dynamic skins not in `rokkit.config` — user-built / server-configured colorsets
  applied at runtime via `skinnable` + `data-skin`; `PaletteManager` produces them.

## Testing

- **states:** `vibe.skin` get/set/validation, `allowedSkins`, persistence in `save()`/`load()`/`update()`.
- **actions:** `themable` writes `data-skin` (+ html mirror); `skinnable` sets the given CSS vars on the node.
- **unocss:** preset emits the default skin on `:root`, each non-default as `[data-skin='name']` (+ dark
  variant), and **no `skin-{name}` class** remains.
- **themes:** coverage guard — built-in skins emit `[data-skin]` blocks.
- **app:** `SkinSwitcherToggle` renders skins + flips `vibe.skin`.
- **cli:** skills catalog now lists 4 skills incl. `skin-system-rokkit`.
- **learn:** light Playwright — switch skin → `data-skin` flips → token colors change.

## Breaking change

Dropping the `skin-{name}` utility class from `presetRokkit` output is a breaking change to
`@rokkit/unocss` (a consumer applying `class="skin-ocean"` must switch to `data-skin="ocean"`). Only
`palette.css` + the learn app use it in-repo (both migrated here). Call it out in release notes
alongside the (separate, already-staged) `navigable` removal.
