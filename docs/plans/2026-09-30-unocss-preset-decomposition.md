# UnoCSS preset decomposition

**Status:** DONE (2026-09-30): `e0741fed`, `29aada96`, `e97744b1`. See journal 2026-09-30 (10).
This follows Plot.svelte, per the user's "keep going".
**Package:** `@rokkit/unocss`

## Why

`src/preset.ts` is the top hotspot after Plot.svelte: 575 lines, complexity 74, 34 commits.
Unlike the last three, it isn't a monolith. It is about 30 small pure functions, and the 74 is
their sum. The problems are cohesion and repetition:

- **Four unrelated jobs share one file.** Typography and type-scale vars, radius vars, colour
  preflights (root light/dark and skins, plus an ink contrast check), and shortcuts, icons and
  the safelist. A change to any one churns the same file.
- **The same logic is written several times.** The "drop alias roles" filter appears four times.
  `new Theme({ colors, mapping: resolveMappingForMode(…), colorSpace })` appears three times.
  The root and skin dark-block rules are near copies.
- **A blanket `// @ts-nocheck`.** It covers a `.ts` file, against the repo's no-suppressions
  type-health rule.

## Shape

`presetRokkit(options)` is unchanged and stays in `preset.ts` as the composition root. The jobs
move to modules beside `config.js` / `custom-tokens.js`:

| Module | Owns |
|---|---|
| `typography.js` | font roles (with legacy aliases), the type scale, radius presets → `:root` vars |
| `colors.js` | `withoutAliases`, `themeFor(mapping, config, mode)`, the `:root` light block, the dark block, skin blocks, theme colour rules incl. aliases |
| `contrast.js` | the ink-on-surface lightness warning |
| `shortcuts.js` | semantic / named / override-token / icon shortcuts, icon collections, safelist |

## Slices (one commit each, test first)

1. `typography.js`
2. `colors.js` + `contrast.js`, with the duplicate theme construction and alias filtering merged
3. `shortcuts.js`
4. Finish:
   - `preset.ts` as the composition root; drop `@ts-nocheck` if the remaining root type-checks
     honestly (no new suppressions);
   - differential: `presetRokkit` output (preflight CSS, shortcuts, safelist, theme, presets'
     names) old vs new over a config grid (skins incl. dual palettes and aliases, overrides
     light/dark/dark-only, palette refs, colour spaces, token modes, typography keys incl.
     legacy, ratio/base/levels, radius presets and objects, icons collection/style/overrides),
     with planted bugs;
   - re-measure, docs, journal, push.

## Invariants at every slice

- The unocss suite passes unchanged (`preset.spec.js`: 236 tests).
- Every consumer suite passes: themes, app, learn check.
- Lint is 0/0, and `check:build` emits the declarations.
