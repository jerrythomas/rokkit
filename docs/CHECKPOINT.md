# CHECKPOINT

**Last slice: unocss preset decomposition. DONE.** Plan: `docs/plans/2026-09-30-unocss-preset-decomposition.md`.

- `e0741fed`: `typography.js`.
- `29aada96`: `colors.js` and `contrast.js`.
- `e97744b1`: `shortcuts.js`. `preset.ts` is a 64-line root, and its `@ts-nocheck` is gone.
  Also fixed: icon settings keys were being registered as icon collections.

`preset.ts` went from complexity 74 to 1. The differential over 640 configs was identical, and
13 planted bugs were caught.

Before that today: the Navigator (7), the open items (8) and Plot.svelte (9). Journal entries
2026-09-30 (7)–(10).

**Remaining:** push `develop` and confirm CI is green.

**Next command:** `git push origin develop`, then watch Check (check + browser) and Coverage.

**Open questions:**

- The next hotspots are `core/utils.js` (47/52), `ui/Select.svelte` (100/19),
  `graph/GraphState.svelte.ts` (88/17), `chart/geoms/Bar.svelte` (62/24) and `core/theme.ts` (50/29).
- `@ts-nocheck` remains in `unocss/backgrounds.ts`, `core/theme.ts` and `core/colors/index.ts`.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
