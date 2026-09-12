# Coverage re-baseline after vitest 4

**Raised:** 2026-09-12, from the rokkit#156 security sweep (vitest 3.2.4 → 4.1.11).
**Status:** open — mechanical, no design decision needed. Ratchet each floor back up.

## What happened

vitest 4 made AST-aware V8 remapping **unconditional**. In vitest 3 this was the
opt-in `experimentalAstAwareRemapping` flag; in `@vitest/coverage-v8@4.1.11` the
flag is gone and there is no way back to the old remapper.

The new remapper emits statements the old one never did, so measured coverage
fell across the whole repo **with no test change and no code change**. Aggregate
went from passing a flat `js/ts: 100% · .svelte: 90%` per-file gate to:

```
All files | 94.47 % Stmts | 87.15 % Branch | 93.28 % Funcs | 96.56 % Lines
```

91 threshold assertions failed across ~70 files. The tests did not get worse —
the ruler changed.

## What was done instead of weakening one global number

The tail is narrow: **129 of 177** js/ts files are still at 100%, and **142 of
174** `.svelte` files still clear 90%. A single global floor would have thrown
away that signal, so `vitest.config.ts` now carries a **per-package floor** set
to each package's current measured minimum.

Two mechanics constrained the shape, both verified against vitest's source
(`resolveThresholds` in `vitest/dist/chunks/coverage.*.js`):

- Every matching glob group is checked **independently**. A specific glob does
  **not** exempt a file from a broader one, so per-file exceptions layered under
  the old `**/*.{js,ts}: 100` would still have failed. The per-package globs
  therefore *replace* the strict generic ones.
- The two remaining catch-alls sit at the global minimum purely as a backstop for
  a package added without its own entry. They are not the gate.

Break-it check: raising `packages/helpers/**/*.{js,ts}` from 84 to 99 fails with
the error naming that glob, confirming the per-package entries actually bind
rather than silently never matching.

## The debt

Distance from each package's floor to the pre-vitest-4 bar (`js/ts` 100,
`.svelte` 90). Ordered worst-first.

| Glob | statements | lines | gap |
| --- | --- | --- | --- |
| `packages/chart/**/*.svelte` | 35 | 40 | **-55** |
| `packages/ui/**/*.svelte` | 50 | 70 | **-40** |
| `packages/blocks/**/*.svelte` | 53 | 66 | **-37** |
| `packages/forms/**/*.svelte` | 66 | 76 | **-24** |
| `packages/helpers/**/*.{js,ts}` | 84 | 87 | -16 |
| `packages/actions/**/*.{js,ts}` | 86 | 92 | -14 |
| `packages/chart/**/*.{js,ts}` | 87 | 95 | -13 |
| `packages/ui/**/*.{js,ts}` | 92 | 91 | -8 |
| `packages/states/**/*.{js,ts}` | 92 | 100 | -8 |
| `packages/cli/**/*.{js,ts}` | 93 | 92 | -7 |
| `packages/app/**/*.{js,ts}` | 96 | 100 | -4 |
| `packages/app/**/*.svelte` | 96 | 96 | +6 |
| `packages/forms/**/*.{js,ts}` | 96 | 99 | -4 |
| `packages/core/**/*.{js,ts}` | 97 | 96 | -3 |
| `packages/data/**/*.{js,ts}` | 98 | 100 | -2 |
| `packages/unocss/**/*.{js,ts}` | 99 | 100 | -1 |
| `packages/blocks/**/*.{js,ts}` | 100 | 100 | 0 |
| `packages/helpers/**/*.svelte` | 100 | 100 | +10 |
| `packages/themes/**/*.{js,ts}` | 100 | 100 | 0 |

Worst individual files, which is where to start:

| File | statements |
| --- | --- |
| `packages/chart/src/elements/DefinePatterns.svelte` | 35.7 |
| `packages/ui/src/components/ItemContent.svelte` | 50.0 |
| `packages/blocks/src/MermaidPlugin.svelte` | 53.8 |
| `packages/chart/src/FacetPlot/Panel.svelte` | 57.1 |
| `packages/chart/src/patterns/PatternDef.svelte` | 63.3 |
| `packages/forms/src/FormRenderer.svelte` | 66.5 |
| `packages/helpers/src/mocks/match-media.js` | 84.6 |
| `packages/actions/src/shortcuts.svelte.js` | 86.4 |

## How to pay it down

Per package, not all at once. Write tests for the newly-visible statements, then
raise that package's entry in `vitest.config.ts` to the new measured minimum and
re-run `bun run coverage`. The floors only ever move **up** — that is the ratchet,
same contract as the contrast baselines.

Some of the newly-counted statements will be genuinely unreachable in jsdom (SSR
branches, defensive guards). Those want a `v8 ignore` comment rather than a test,
which is also what lets the floor rise.
