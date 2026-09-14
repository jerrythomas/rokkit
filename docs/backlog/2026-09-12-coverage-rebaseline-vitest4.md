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

## CLOSED — 2026-09-14

**The debt is paid.** Every package is back at or above its pre-vitest-4 bar:

- **js/ts — 13/13 packages at 100%**, 0 uncovered statements.
- **`.svelte` — 0 files below the 90% bar**, down from 29 files and 493
  statements. forms 66 → 90, chart 35 → 91, ui 50 → 90.

Aggregate: `97.85 % Stmts · 90.38 % Branch · 96.91 % Funcs · 98.59 % Lines`.

Current floors live in `vitest.config.ts`. They remain a **ratchet**: recompute
against `coverage/coverage-final.json` after any change rather than editing the
one that failed, or an improvement elsewhere silently goes unbanked.

## What the work actually found

Very little of this was "missing tests" in the ordinary sense.

**Three production bugs, each surfaced as a coverage gap that was really dead
code:**

1. `themable` used `$effect.root` and discarded the disposer, so its `storage`
   listener was never removed and accumulated on every re-application.
2. `FormBuilder` never hoisted `override` off the layout element, so the
   documented `override: true` → `child` snippet route silently did nothing and
   leaked `override` downstream as a stray prop.
3. `elements/DefinePatterns`' spec passed `name` where the component reads `id`,
   so every case — including the two named "should render the patterns" — took the
   error branch, and three snapshots had recorded that `<error>` as expected.

**Vacuous tests that could not fail**, found and replaced: a colour-mode SSR case
asserting `typeof cleanup === 'function'` (true on both paths) whose comment
claimed `window` could not be removed under JSDOM; `contrastShortcuts` checked for
shape but never invoked; a ChartProvider consumer that checked the context existed
but never read it; Legend cases that build `items` inline and assert on their own
local construction without rendering the component.

**Snippet slots are the biggest single blind spot.** A component's primary
interface is often a snippet, and `render(Component, { props })` cannot supply one
— so the slot AND the default it replaces are both dead. That one shape accounts
for most of the `.svelte` debt: Card's regions, Table/TreeTable's header/row/cell/
empty, Toolbar's start/center/end, Carousel's slide, BreadCrumbs' crumb,
SearchFilter's tag, Swatch's item.

**Interaction is the second.** Geoms rendered marks that were never hovered,
clicked, keyed, labelled or pattern-filled.

### `v8 ignore next` silently stopped working in some positions

The repo has 24 `v8 ignore next` directives; **5 had stopped firing** under vitest
4's AST-aware remapping, quietly becoming debt. The `start`/`stop` region form
still works:

```js
/* v8 ignore start -- reason */
if (!typography) return []
/* v8 ignore stop */
```

Confirmed on `core/theme.ts`, `unocss/preset.ts`, `actions/navigator.js` and
`actions/utils.js`. The failing cases include a single-line `if (...) return`,
which is two statements on one line. The other 19 `next` directives still fire, so
this is **not** a blanket migration — check before converting.

Reach for an ignore only after establishing the path is genuinely unreachable.
`navigator`'s `if (!el) return false` sits behind `event.target`, which a
dispatched DOM event always populates; `utils`' `isAccordionTrigger` null-guard
cannot be hit because its only caller dereferences `target.parentElement` first.

Worst individual files, which is where to start:

| File | statements |
| --- | --- |
| `packages/chart/src/elements/DefinePatterns.svelte` | 35.7 |
| `packages/ui/src/components/ItemContent.svelte` | 50.0 |
| ~~`packages/blocks/src/MermaidPlugin.svelte`~~ | ~~53.8~~ → **100** (fixed, see below) |
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

## A floor that differed between laptop and CI meant a racy test

The first CI run after this re-baseline **failed**, on one file:
`packages/blocks/src/MermaidPlugin.svelte`, measured at **38.46%** statements on
CI where the laptop had measured **53.84%**.

That gap was the finding. The component does its work in an `async onMount` that
awaits `import('mermaid')` and `import('dompurify')`, and its single test called
`render()` then asserted synchronously — never awaiting. So how much of the body
executed before teardown depended on how fast the dynamic imports resolved, i.e.
on the machine. The coverage number was sampling a race.

Lowering the floor to CI's number would have enshrined that race. The test was
rewritten instead: 1 test → 8, every output assertion behind `waitFor`, covering
the success path, the sanitize call, both error branches and the non-`Error`
rejection fallback. The file went to **100% / 100%**, and the whole
`packages/blocks/**/*.svelte` floor rose **53/66 → 93/95**.

Worth repeating the diagnostic: a coverage number that differs between two
machines is not noise to be averaged away — it means something in that file is
timing-dependent, and the test is not pinning it.

### Turning the accident into a sweep

MermaidPlugin was found by luck — CI happened to disagree with a laptop. Running
that comparison *deliberately* found a second one. Diffing CI's per-directory
coverage table against a local run showed exactly one divergent directory,
`ui/src/components` (CI 91.00 vs local 90.97), and matching CI's truncated file
rows against local per-file numbers isolated **`CodeBlock.svelte`**: CI 89.69 vs
local 88.66, where every other file differed only in the 0.01 of rounding.

Cause: the component calls the real `highlightCode`, which builds an expensive
singleton highlighter. The first test pays initialisation and later ones hit the
cache, so whether `highlighted` was set before a test ended depended on ordering
and machine speed. Its spec had adapted to that rather than fixing it —

```js
// Either shiki resolved or the pre fallback is shown — code must be present somewhere
const body = container.querySelector('[data-code-block-body]')
expect(body).toBeTruthy()
```

A test written to pass in *either* state is the signature. `Code.svelte` had the
same shape in a blunter form, `if (loading) { ...assert... }`, which asserted
nothing at all whenever shiki had already resolved.

Both now mock `highlightCode`, making pending / resolved / rejected three states
the test selects rather than a race it observes. `CodeBlock.svelte` 88.66 → **100%**,
`Code.svelte` 85.00 → **100%**, and the `{:catch}` arm — previously untested —
is covered. `shiki.ts` keeps its own direct coverage via `shiki.spec.svelte.ts`,
so nothing was lost by mocking it.

**A static sweep for the pattern is not enough on its own.** Searching for
`onMount(async`, `.then(`, `await`, `setTimeout` and `requestAnimationFrame` in
components returns 17 candidates, but most are fine. `PlotSurface.svelte` has the
textbook shape — `Promise.all([import('d3-zoom'), import('d3-selection')]).then(...)`
inside an `$effect`, plus a `requestAnimationFrame` gate — and is **not** racy,
because its spec deliberately awaits both. Pattern presence is a lead; the
divergence measurement is the evidence.

### 100% statements did not mean deterministic

After the statement-level fix, CI and local agreed exactly on statements,
functions and lines — but `ui/src/components` **branch** coverage still differed,
CI 86.06 vs local 86.02, isolating again to `CodeBlock.svelte` (CI 83.72, local
81.40) at a flat 100% statements.

The effect's `then`/`catch` both guard with `if (!cancelled)`, and `cancelled` is
set by the effect's own teardown. Which arm runs depends on whether the highlight
promise settles before or after unmount — the same race, one level down. Every
statement can execute while a conditional still lands differently, so statement
coverage cannot detect it.

Two tests now hold the promise open across `unmount()` and settle it afterwards,
once resolved and once rejected. Branches 81.40 → **86.05%**.

### Final state

CI and a local run now produce **identical** numbers on all four metrics across
all 23 directories:

```
All files | 94.66 % Stmts | 87.28 % Branch | 93.38 % Funcs | 96.68 % Lines
```

Also verified locally: two consecutive full runs differ on **0** files for
statements *and* branches, and a 1-worker run matches a 4-worker run on 0 files.

**Use this as the regression check.** If a future CI coverage number disagrees
with a local one, that is not rounding — diff the per-directory table, isolate the
file, and look for an un-awaited async boundary or a teardown-guarded branch.

Rewriting it also exposed a second leak the original had: the synchronous test
left its `onMount` in flight, and it resolved *during the next test*, past the
`beforeEach` reset — visible as `expected "vi.fn()" to be called 1 times, but got
2 times` once call counts were actually asserted.

## The floors also move with the Svelte compiler

Bumping svelte 5.53 → 5.57 in the same sweep shifted three of them with no test
change: `actions` js/ts lines 92 → **89**, `app` .svelte lines 96 → **97**,
`forms` .svelte lines 76 → **77**. `.svelte.js` rune modules are compiler output,
so their statement map moves with the compiler version.

Expect a svelte minor to nudge a floor. Recompute against
`coverage/coverage-final.json` rather than hand-editing the one that failed —
otherwise an improvement elsewhere silently goes unbanked, which is how a ratchet
rots.
