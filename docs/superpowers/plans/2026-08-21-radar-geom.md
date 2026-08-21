# Radar geom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A radar/spider geom that renders in both `Plot` and `Spark`, with declared per-axis scales, weighted axes, and a radius transform that keeps wedge area proportional to weight × value.

**Architecture:** Four layers mirroring the existing geom convention — a pure layout module (`lib/brewing/polar.js`), a geom adapter (`geoms/lib/marks/radar.js`), the geom component (`geoms/Radar.svelte`), and a `RadarChart` wrapper. Radar ignores `xScale`/`yScale`, computing polar geometry from `innerWidth`/`innerHeight` like `Arc` does.

**Tech Stack:** Svelte 5 runes, d3-shape (`lineRadial`), d3-format, Vitest (jsdom + browser mode via Playwright).

**Spec:** `docs/superpowers/specs/2026-08-20-radar-geom-design.md` — 24 acceptance criteria. Read it before starting; it was revised after three independent reviews and every ⚠ marks a correction to an earlier draft.

**Branch:** `develop` (project convention — no worktree).

---

## Non-negotiable rules for every task

These come from cycle 1, where **six tests passed while the code was broken**. Each asserted something *adjacent* to the behaviour rather than the behaviour itself.

1. Assert the value the feature computes, not a property that survives the feature being wrong.
2. Never loop or `it.each` a collection without first asserting it is non-empty.
3. Where a test's name promises a difference or precedence, construct inputs where a broken implementation gives a **different** answer.
4. `.not.toThrow()` is never sufficient for a no-op claim.
5. **Before committing, break the implementation and confirm the test fails.** Report the outcome. A test you have not watched fail is not a test.
6. Restore any deliberate breakage and verify with `git diff` before committing. An agent in cycle 1 crashed mid-sabotage and left broken code that nearly shipped as the feature.
7. No pre-existing test file may be edited. If you want to, report BLOCKED.

---

## File structure

| File | Responsibility |
| --- | --- |
| `packages/chart/src/lib/brewing/polar.js` | **Create** — pure layout: axis resolution, angles, domains, radius, vertices, rings |
| `packages/chart/src/lib/preset.js` | **Modify** — add `opacity.radar` |
| `packages/chart/src/geoms/lib/marks/radar.js` | **Create** — adapter: colours, alpha, paint order |
| `packages/chart/src/geoms/Radar.svelte` | **Create** — the geom, both forms |
| `packages/chart/src/charts/RadarChart.svelte` | **Create** — `Plot` wrapper, legend default |
| `packages/chart/src/Spark.svelte` | **Modify** — accessibility (cycle 1 debt) |
| `packages/chart/src/Plot.svelte` | **Modify** — register `radar` in `GEOM_COMPONENTS` |
| `packages/chart/src/index.js` | **Modify** — export `Radar`, `RadarChart` |
| `packages/chart/spec/brewing/polar.spec.js` | **Create** — layout unit tests |
| `packages/chart/spec/geoms/Radar.spec.svelte.js` | **Create** — geom render + interactivity |
| `packages/chart/spec/Spark.a11y.spec.svelte.js` | **Create** — Spark accessibility |
| `packages/chart/browser/Radar.browser.spec.ts` | **Create** — real geometry + area proportionality |
| `apps/learn/…` | **Modify** — explorer registry entry + guide coverage |

---

### Task 1: Axis resolution — `string[]`, `AxisSpec[]`, mixed

**Files:** Create `packages/chart/src/lib/brewing/polar.js`, `packages/chart/spec/brewing/polar.spec.js`

`axes` accepts bare names, full descriptors, or a mix. Normalise to one internal shape.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect, vi } from 'vitest'
import { resolveAxes } from '../../src/lib/brewing/polar.js'

const rows = [
	{ m: 'a', v: 1 }, { m: 'b', v: 2 }, { m: 'c', v: 3 }
]

describe('resolveAxes', () => {
	it('normalises bare strings to specs with default weight 1', () => {
		const axes = resolveAxes(['a', 'b'], rows, 'm')
		expect(axes).toHaveLength(2)
		expect(axes[0]).toMatchObject({ key: 'a', label: 'a', weight: 1 })
	})

	it('preserves a full AxisSpec verbatim', () => {
		const spec = { key: 'a', label: 'Alpha', domain: [0, 5], ticks: 5, weight: 2 }
		const [out] = resolveAxes([spec], rows, 'm')
		expect(out).toMatchObject(spec)
	})

	it('accepts a mixed array', () => {
		const axes = resolveAxes(['a', { key: 'b', weight: 3 }], rows, 'm')
		expect(axes.map((a) => a.key)).toEqual(['a', 'b'])
		expect(axes.map((a) => a.weight)).toEqual([1, 3])
	})

	it('defaults label to key and weight to 1 on a partial spec', () => {
		const [out] = resolveAxes([{ key: 'a' }], rows, 'm')
		expect(out.label).toBe('a')
		expect(out.weight).toBe(1)
	})

	it('appends unit to the label when given', () => {
		const [out] = resolveAxes([{ key: 'a', label: 'Latency', unit: 'ms' }], rows, 'm')
		expect(out.displayLabel).toBe('Latency (ms)')
	})

	it('infers first-appearance order when axes is omitted, and warns', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const axes = resolveAxes(undefined, [{ m: 'c' }, { m: 'a' }, { m: 'c' }], 'm')
		expect(axes.map((a) => a.key)).toEqual(['c', 'a'])
		expect(warn).toHaveBeenCalled()
		expect(warn.mock.calls[0][0]).toMatch(/radar/i)
		warn.mockRestore()
	})

	it('does NOT warn when axes is supplied', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		resolveAxes(['a'], rows, 'm')
		expect(warn).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it('renders an empty spoke for a declared axis absent from the data', () => {
		const axes = resolveAxes(['a', 'zzz'], rows, 'm')
		expect(axes.map((a) => a.key)).toEqual(['a', 'zzz'])
	})

	it('drops a data axis not named in axes, and warns', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const axes = resolveAxes(['a'], rows, 'm')
		expect(axes.map((a) => a.key)).toEqual(['a'])
		expect(warn).toHaveBeenCalled()
		warn.mockRestore()
	})
})
```

- [ ] **Step 2: Run it, confirm FAILURE**

`cd /Users/Jerry/Developer/rokkit && bunx vitest run --project chart packages/chart/spec/brewing/polar.spec.js`
Expect an unresolved import. Do not proceed until you have seen it fail.

- [ ] **Step 3: Implement `resolveAxes`**

Create `polar.js`. Export `resolveAxes(axes, data, axisField)`. Normalise each entry to
`{ key, label, displayLabel, domain, ticks, tickLabels, format, weight }` with `label ??= key`,
`weight ??= 1`, and `displayLabel = unit ? \`${label} (${unit})\` : label`.

When `axes` is omitted, derive first-appearance order from `data` and `console.warn` once — match the
message register of `lib/plot/stat.js` and `lib/preset.js` (read them; they warn when silently
patching over something). Warn also when data contains an axis `axes` doesn't name.

- [ ] **Step 4: Verify**

All 9 pass. `bunx vitest run --project chart` green. `bun run lint` 0 errors.

- [ ] **Step 5: Break-it check**

Make `resolveAxes` always default `weight` to `2`. The mixed-array and default-weight tests MUST
fail. Restore. Report the outcome.

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/lib/brewing/polar.js packages/chart/spec/brewing/polar.spec.js
git commit -m "feat(chart): radar axis resolution — string, AxisSpec, or mixed

Normalises the three accepted forms to one internal shape. Omitting axes still
works but warns in dev, matching stat.js/preset.js's precedent: axis order is an
analytical choice, and inferring it from row order makes the shape depend on
incidental upstream sort."
```

---

### Task 2: Angles from weights — the corrected formula

**Files:** Modify `polar.js`, append to `polar.spec.js`

⚠ The first spec draft had this formula **wrong** — off by exactly `180/n`, putting nothing at the top. The corrected form is below. Implement exactly it.

- [ ] **Step 1: Write the failing test**

```js
import { anglesFor } from '../../src/lib/brewing/polar.js'

const near = (a, b) => Math.abs(a - b) < 1e-9

describe('anglesFor', () => {
	it.each([3, 4, 5, 6])('reduces exactly to -90 + i*360/n at equal weights (n=%i)', (n) => {
		const got = anglesFor(Array(n).fill(1))
		expect(got).toHaveLength(n)
		for (let i = 0; i < n; i++) expect(near(got[i], -90 + (i * 360) / n)).toBe(true)
	})

	it('puts the first axis at the top regardless of weights', () => {
		expect(near(anglesFor([2, 1, 1])[0], -90)).toBe(true)
		expect(near(anglesFor([1, 5, 1])[0], -90)).toBe(true)
	})

	it('gives wedge widths proportional to weight', () => {
		// w=[2,1,1] over 360 => 180/90/90
		const a = anglesFor([2, 1, 1])
		expect(near(a[1] - a[0], 135)).toBe(true) // half of 180 + half of 90
		expect(near(a[2] - a[1], 90)).toBe(true) // half of 90 + half of 90
	})

	it('treats a zero or missing weight as 1', () => {
		expect(anglesFor([1, 0, 1])).toEqual(anglesFor([1, 1, 1]))
	})

	it('returns [] for no axes', () => {
		expect(anglesFor([])).toEqual([])
	})
})
```

- [ ] **Step 2: Confirm FAILURE**, then implement:

```js
/**
 * Angle in degrees for each axis, first axis at the top, clockwise.
 *
 * Each axis owns a wedge proportional to its weight and sits at that wedge's
 * MIDPOINT — which is the meaningful weighted semantics, but on its own would put
 * axis 0 at half a sector past the top. Subtracting axis 0's half-wedge rotates the
 * whole thing so axis 0 lands at -90 exactly, for any weights.
 *
 * At equal weights this reduces exactly to -90 + i*360/n. A test asserts that,
 * because an earlier draft of this formula omitted the rotation term and was off by
 * 180/n for every n.
 */
export function anglesFor(weights) {
	const w = weights.map((x) => (Number.isFinite(x) && x > 0 ? x : 1))
	const total = w.reduce((a, b) => a + b, 0)
	if (!total) return []
	let before = 0
	const half0 = w[0] / 2
	return w.map((wi) => {
		const a = -90 + (360 * (before + wi / 2 - half0)) / total
		before += wi
		return a
	})
}
```

- [ ] **Step 3: Verify** all pass; full suite green.

- [ ] **Step 4: Break-it check — this is the important one**

Remove the `- half0` term (reproducing the spec's original error). The reduction tests MUST fail with
the first axis at `-90 + 180/n` instead of `-90`. Restore. Report the outcome.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/polar.js packages/chart/spec/brewing/polar.spec.js
git commit -m "feat(chart): radar angles from weights, first axis at top

Each axis sits at the midpoint of a wedge proportional to its weight, rotated so
axis 0 lands at -90 for any weights. Reduces exactly to -90 + i*360/n at equal
weights, asserted for n=3..6 — an earlier draft of this formula omitted the
rotation and was off by 180/n for every n, which a test now prevents recurring."
```

---

### Task 3: Domains — declared, inferred, negatives, sharedDomain

**Files:** Modify `polar.js`, append to `polar.spec.js`

- [ ] **Step 1: Tests**

Cover: a declared `domain` is used verbatim; an inferred domain is `[0, max]` for non-negative data;
an axis containing a negative gets `[min, max]`; `sharedDomain` is
`[min over all values, max over all]` applying negatives-extend globally; **and the stability
criterion** — with a declared domain, computing the layout with and without an extra series yields
identical domains, whereas with an inferred domain it does not. That last test is the whole point of
the feature, so construct it so an inferred-domain implementation fails it.

- [ ] **Step 2–4:** Confirm failure, implement `domainsFor(axes, data, channels, { sharedDomain })`,
verify, break-it (make declared domains fall through to inferred → the stability test MUST fail),
commit.

---

### Task 4: Radius transform — linear, sqrt, auto

**Files:** Modify `polar.js`, append to `polar.spec.js`

- [ ] **Step 1: Tests**

`radiusFor(value, domain, R, transform)`:
- linear: `R × (v - min)/(max - min)`; on `[-5,10]` with `R=100`, `v=0` → `33.33`, **not** the centre
- sqrt: `R × √((v - min)/(max - min))`
- the two give **different** answers for the same input (assert that explicitly)
- `'auto'` selects linear when all weights equal, sqrt when any differ
- an explicit `'linear'`/`'sqrt'` overrides `'auto'`
- **area proportionality**: under sqrt with weights `[2,1]`, wedge area `½θr²` is proportional to
  `weight × value`. Assert numerically — this is the entire justification for the transform.

- [ ] **Step 2–4:** Confirm failure, implement, verify, break-it (force linear under unequal weights
→ the area-proportionality test MUST fail), commit.

---

### Task 5: Vertices — duplicates, missing cells

**Files:** Modify `polar.js`, append to `polar.spec.js`

⚠ Duplicate `(series, axis)` cells average **inside this module**, not via a `stat` default —
`applyGeomStat` builds fresh rows, breaking `indexOf` identity so `onselect` would report `index: -1`
and drop non-channel fields.

- [ ] **Step 1: Tests**

Per-series vertex lists with `{ axisKey, value, angle, radius, row }`; duplicates averaged **and**
`console.warn`ed; the surviving `row` reference is one of the original row objects (assert `===`
against an input row, so identity is provably preserved); a missing `(series, axis)` yields a **gap**
(null vertex) and is never defaulted to `0`.

- [ ] **Step 2–4:** Confirm failure, implement, verify, break-it (return a synthesised row object
instead of an original → the identity test MUST fail; default missing cells to 0 → the gap test MUST
fail), commit.

---

### Task 6: Rings, zero-reference marker, `buildRadarLayout`

**Files:** Modify `polar.js`, append to `polar.spec.js`

- [ ] Tests: rings evenly spaced in radius (`i/rings × R`); ring count from uniform `AxisSpec.ticks`,
else `options.rings`, **with a dev-warn when specs disagree**; a zero-reference ring segment on any
axis whose domain excludes zero, at `radiusFor(0, …)`; `tickLabels` used for ring labels when
supplied, `format` applied otherwise.

- [ ] Then compose the public `buildRadarLayout(data, channels, opts)` returning
`{ axes, angles, domains, series, rings, zeroRings, radius, transform }`, and assert it is **pure** —
no Svelte import (grep the file), and callable with no context.

- [ ] Break-it: space rings evenly in *value* rather than radius on a non-zero-anchored axis → the
ring test MUST fail. Commit.

---

### Task 7: `preset.opacity.radar` + the adapter

**Files:** Modify `packages/chart/src/lib/preset.js`; create `geoms/lib/marks/radar.js`

⚠ `defaultPreset.opacity` has **no `radar` entry**, so `resolveAlpha` would return `1` and render
fully opaque overlapping polygons, hiding every series but the top one. Verified absent.

- [x] Add `radar: 0.25`. Every existing preset test must pass **unmodified**. (`27097ec5`)
- [x] `buildRadarMarks({ data, plot, channels, options, alpha, type })` — call `buildRadarLayout`,
resolve per-series fill/stroke via `resolveFillStroke` on one representative row per series (the
pattern `lines.js` uses), apply `resolveAlpha`, build the polygon `d` with **d3-shape `lineRadial`**,
and return marks ordered so **all fills precede all strokes**. (`d65b668f`)
- [x] Test the paint order explicitly: a smaller series nested inside a larger one must have its
stroke emitted after every fill.
- [x] Break-it: emit fill-then-stroke per series → the paint-order test MUST fail. Commit.

  Done 2026-08-21. `packages/chart/src/geoms/lib/marks/radar.js` +
  `packages/chart/spec/geoms/radar-marks.spec.js` (8 tests). All four break-it checks
  confirmed and restored (opacity-removed → fill alpha 1; interleaved fill/stroke →
  paint-order assertion fails 2 vs 1; margin-dropped → 100 not < 100; unconverted
  angle → x off by ~0.89R). Angle conversion: `(deg + 90) * PI / 180` (both
  conventions wind clockwise, only the zero-offset differs). `LABEL_MARGIN = 32`px
  reserved outside the outer ring (radar's axis labels sit outside, unlike Arc's).
  100% statements+lines on `radar.js` and `preset.js`. Full chart suite
  1463 → 1472; full `test:ci` 5689 passing; lint 0 errors.

---

### Task 8: `Radar.svelte` — full form

**Files:** Create `geoms/Radar.svelte`, `spec/geoms/Radar.spec.svelte.js`, a `TestRadar.svelte` harness

- [x] Follow the house harness pattern (`spec/helpers/TestBar.svelte`), including `untrack(() => state)`.
- [x] Register via `GeomState` with `channels: { x: axis, y: value, color: series, pattern }`.
- [x] Render the DOM hooks exactly as the spec's table specifies — `data-plot-geom="radar"`, and
`data-plot-element` values `radar-area`, `radar-vertex`, `radar-grid-ring`, `radar-grid-spoke`,
`radar-axis-label`, plus `data-plot-series` / `data-plot-axis`.
- [x] Axis labels at `R + labelGap` with `text-anchor` flipped by hemisphere; **reduce the outer
radius to reserve the label margin** — `buildArcs` reserves none, so labels would otherwise clip.
- [x] Break-it: hardcode `text-anchor="middle"` → the hemisphere test MUST fail. Commit.

  Done 2026-08-21 (`a037a00e`). `geoms/Radar.svelte` + `spec/geoms/Radar.spec.svelte.js`
  (20 tests) + `spec/helpers/TestRadar.svelte`. Also emits `radar-zero-ring` for Task 6's
  per-axis zero marker (a spoke-local dashed arc, not a full ring).

  Four break-it checks confirmed and restored. Because these files were untracked,
  `git diff` could not verify restoration (plan rule 6) — used an md5-checked backup
  instead. Hardcoded `text-anchor` → only the hemisphere test fails; gap defaulted to a
  centre vertex → only the gap test fails; one shared vertex colour → only the colour
  test fails; vertices pinned to the outer radius → only the half-domain test fails, and
  **not** the full-radius geometry test, which is why both assertions exist.

  Vertices are visual only here; focus/Enter/Space/`onselect` is Task 9. Vertex colour is
  read back off the adapter's stroke marks rather than re-resolving the palette, so a dot
  cannot disagree with its own polygon outline. Needed a local `RadarMark` type — the
  first geom to read `geom.marks` in script rather than only spreading it in a template.

  `Radar.svelte` 100% statements+lines, 98% branch. Chart suite 1472 → 1492; full
  `test:ci` 5709 passing / 378 files; lint 0 errors; `svelte-check` 0 errors 0 warnings.

  Incidental: a stale `packages/cli/spec/fixtures/output/` scratch dir (leftover from an
  interrupted `convert.spec.js` run) was failing lint with a `require()` error in a
  generated file. Ignored in `.gitignore` + eslint config (`1114d4db`), verified with the
  dir present on disk.

---

### Task 9: `Radar.svelte` — interactivity

**Files:** Modify `Radar.svelte`, append to its spec

⚠ Do **not** use the `keyboardNav` action — it does linear traversal over DOM order, built for a 1-D
category list; radar vertices are 2-D. Use the per-element `onkeydown` pattern `Point`/`Arc` use.

- [x] Vertices focusable; Enter and Space fire `onselect` with the standard `buildSelectDetail` shape;
`plotState.handleSelect` called when `plotState.interactive`.
- [x] **Assert `detail.index !== -1`** and that a non-channel field on the original row survives into
`detail.datum` — this is what the Task 5 identity work exists to guarantee.
- [x] Break-it: pass a synthesised row to `buildSelectDetail` → the index test MUST fail. Commit.

  Done 2026-08-21 (`c2eb68a0`). `spec/geoms/Radar.interaction.spec.js` (11 tests).
  Used `Point`/`Arc`'s per-element `onkeydown`; `keyboardNav` correctly avoided.

  On the payload: the plan's wording reads as though `onselect` itself receives the
  detail, but Line/Point/Bar/Area all pass the **raw row** to the geom's own `onselect`
  and route the full `buildSelectDetail` shape through `plotState.handleSelect`. Followed
  the house split rather than inventing a radar-only convention.

  Five break-it checks confirmed and restored. The plan's named one needed splitting:
  passing `{ ...row }` as `buildSelectDetail`'s *datum* leaves `indexOf` still receiving
  the original, so it only broke the identity assertion — the index assertion needed
  `plotState.data.indexOf({ ...row })` to prove it has teeth (then: `expected -1 not to
  be -1`). Also: dropped `interactive` guard → withheld-routing test fails; `reachable`
  forced true → unfocusable test fails; any-key accepted → Enter/Space-only test fails.
  Those last two passed vacuously during RED, so the checks are what make them count.

  Two type gaps surfaced and were fixed at the root, not suppressed: `buildSelectDetail`'s
  `geom` union omitted `'radar'`, and `polar.js` typed `Vertex.row` as the bare `Object`
  (not assignable to a `Record`-shaped row).

  `Radar.svelte` 100% statements+lines, 93% branch; `select.js`/`polar.js` still 100%.
  Chart suite 1492 → 1503; full `test:ci` 5720 passing; lint 0 errors; `svelte-check` 0/0.

---

### Task 10: `Radar.svelte` — micro form inside `Spark`

**Files:** Modify `Radar.svelte`, append to its spec

⚠ A 24px hit target does not fit in 28×28 even once. Inside `Spark`, radar renders the **polygon
only** — no rings, spokes, labels, hit targets or tooltips.

- [x] ~~Detect via `plotState.interactive`~~ → **detect via available space.** See the deviation below.
- [x] Assert inside `Spark`: a polygon exists, and `[data-plot-element="radar-grid-ring"]`,
`radar-vertex` and `radar-axis-label` are all **absent**.
- [x] Axis cap 3–5 in the micro form with a dev warn.
- [x] Break-it: render the grid unconditionally → the absence tests MUST fail. Commit.

  Done 2026-08-21 (`72ab885c`). `spec/geoms/Radar.spark.spec.svelte.js` (11 tests) +
  `spec/helpers/SparkRadarHarness.svelte`.

  **⚠ Plan deviation — `plotState.interactive` is the wrong detector.** It is
  `Boolean(onselect) || selectable`, so an ordinary *static* `<Plot>` reads `false` just
  like `SparkState` does. Gating chrome on it would strip rings, spokes and axis labels
  from any radar without a click handler, and would have failed Task 8's committed
  full-form tests. Verified against `PlotState.svelte.js:568`, not assumed.

  It was also insufficient on its own. A **second, independent defect** broke the micro
  form: both `Radar.svelte` and `buildRadarMarks` subtracted `LABEL_MARGIN` (32px) from
  the radius. A `Spark` is 80×24 → half-extent 12px − 32px, clamped to **R = 0**, so the
  polygon collapsed to an invisible point. Proven by a RED test before any fix
  (`expected 0 to be greater than 1`). Gating on `interactive` alone would have produced
  a correctly-empty but still invisible glyph.

  **Replacement:** `resolveRadarRadius(innerWidth, innerHeight) → { R, micro }` in
  `geoms/lib/marks/radar.js` is now the single definition of the radius *and* of which
  form is drawn. The component (grid/labels/vertices) and the adapter (polygons) both
  call it, so the two can no longer disagree — Task 8 needed a test to *police* that
  drift, and it is now structurally impossible. `micro` is derived from available space
  rather than from "am I inside a Spark", which keeps the geom free of any
  container-specific branch (the spec's actual requirement) and correctly covers a Plot
  too small for chrome. Threshold is derived, not taste:
  `2 × (LABEL_MARGIN + MIN_PLOT_RADIUS) = 112px` — the size at which the label margin and
  a usable 24px hit-target radius both just fit.

  A contract member (`micro` on `SparkState`) was considered and rejected:
  `spark-contract.spec.js` hardcodes `EXPECTED_CONTRACT` and asserts its length, so it
  would require editing a pre-existing test file — blocked by rule 7 without a waiver.

  The axis-count warn lives in the adapter beside `polar.js`'s other dev warns, so the
  component stays render-only and needs no `eslint-disable` in a `.svelte` file
  (`no-console` is only relaxed for specs).

  Six break-it checks confirmed and restored (md5-verified), including re-checking the
  warn after relocating it. `Radar.svelte` 100% statements+lines / 94% branch;
  `marks/radar.js` 100% / 96%. Chart suite 1503 → 1514; `test:ci` 5731; lint 0 errors;
  `svelte-check` 0 errors 0 warnings.

---

### Task 11: `Spark` accessibility — cycle 1 debt

**Files:** Modify `Spark.svelte`, create `spec/Spark.a11y.spec.svelte.js`

⚠ `Spark.svelte` renders a bare `<svg data-spark>` with **no `role`, `aria-label` or `<title>`** —
every sparkline shipped in cycle 1 is invisible to assistive tech. Verified.

- [x] Add `role="img"`, an `aria-label` from a new `label` prop else a generated summary, and an
sr-only textual data summary.
- [x] Every existing `Spark` and `Sparkline` test must pass **unmodified** — 27 Sparkline specs and
`sparkline.e2e.ts` included. If one fails, report BLOCKED.
- [x] Break-it: drop the `aria-label` → the a11y test MUST fail. Commit separately from the radar
work, since it is a distinct fix.

  Done 2026-08-21 (`b029b522`). `spec/Spark.a11y.spec.svelte.js` (9 tests) +
  `spec/helpers/SparkLabelHarness.svelte`. Committed separately, as required.

  **Constraint met, and verified rather than asserted:** 27 Sparkline specs + 13 Spark
  specs + 3 `sparkline.e2e.ts` tests all pass **unmodified** — `git diff` over those files
  is empty, and the e2e was actually run (`3 passed`), not assumed. No BLOCKED needed.
  Checked *before* implementing that none of them assert `textContent` or child counts,
  which is what made adding `<title>`/`<desc>` safe.

  Two deliberate choices beyond the letter of the task:
  - The "sr-only textual summary" is `<desc>` inside the SVG, not a sibling sr-only
    `<div>`. A `<div>` cannot be an SVG child, so it would have forced a wrapper element
    around `<svg data-spark>` — a DOM structure change, and the fastest way to break the
    40 specs this task must not break. `<title>`/`<desc>` are the SVG-native mechanism and
    need no wrapper. `desc` keeps the generated data summary even when `label` overrides
    the name, so the numbers survive the caller's wording.
  - `Sparkline` gained a forwarding `label` prop. Without it the shipped API could only
    ever get the generated summary, which makes the fix half-useful for real callers.

  The fallback name is generated from the series (count, direction, endpoints, extent),
  never a fixed string — a constant would satisfy an axe rule while telling a screen
  reader user nothing. Break-it check proves it: replacing the summary with the constant
  `'Sparkline'` fails 4 tests, including the two-series-must-differ assertion. Also
  confirmed: `aria-label` dropped → 6 fail; `role` dropped → the role tests fail.

  `Spark.svelte` 100% statements+lines / 96% branch; `Sparkline.svelte` 100% / 100%.
  `test:ci` 5740 passing / 381 files; lint 0 errors; `svelte-check` 0 errors 0 warnings.

---

### Task 12: `RadarChart` wrapper, legend default, `GEOM_COMPONENTS`

**Files:** Create `charts/RadarChart.svelte`; modify `Plot.svelte`, `index.js`; append to `exports.spec.js`

- [x] Wrapper mirrors `PieChart` — `<Plot grid={false} axes={false} margin={…}>` + `<Radar>`.
- [x] ⚠ **Legend defaults ON for 2+ series.** `PieChart`'s `legend` defaults to `false`; radar must
not inherit that, because colour-matching alone is insufficient with washed-out fill intersections.
Assert: one series → no legend; two → legend present.
- [x] Register `radar` in `Plot.svelte`'s `GEOM_COMPONENTS`, consistent with `arc`.
- [x] Export `Radar` (as `GeomRadar`, matching the `Geom*` convention) and `RadarChart`.
- [x] ⚠ Assert `Plot`'s inherited `plot-sr-table` renders something legible for radar's long-format
rows — `tableColumns` falls back to `Object.keys(firstRow)`, giving a flat 3-column dump. Do not
assume inheritance means correctness.
- [x] Break-it: force `legend={false}` → the two-series legend test MUST fail. Commit.

  Done 2026-08-21 (`f3faae98`). `charts/RadarChart.svelte`,
  `spec/charts/RadarChart.spec.js` (10 tests), +2 in `spec/exports.spec.js`.

  **Registration needed more than a map entry.** `GEOM_COMPONENTS` is consulted *only* by
  Plot's spec-driven path, whose passthrough is a fixed prop list
  (`x`/`y`/`color`/`fill`/`pattern`/`symbol`/`stat`/`label`/`options`) — never radar's own
  `axis`/`value`/`series`. Adding just the entry would have been a registration that can
  never render. Radar now accepts `x`/`y`/`color` as generic-pipeline aliases (its own
  names win when both are given) and reads axis order from `options.axes`, so a spec drives
  it through the existing passthrough with **no change to the generic block** — avoiding
  radar-specific props leaking onto every other geom. Both routes tested.

  **sr-table verdict: legible, no pivot needed.** The fallback yields
  `metric | score | team` with one row per (series, axis) cell — a faithful reading of
  long-format data, arguably better for a screen reader than a pivoted matrix. Asserted
  concretely (exact headers, row count, and one row's real values), not assumed.

  Four break-it checks confirmed and restored. **One initially FAILED TO FAIL and exposed a
  real defect in the test:** the declared axis order matched the data's first-appearance
  order, so `resolveAxes`'s inference produced an identical answer and the assertion could
  not distinguish a working fallback from a dropped one (plan rule 3, exactly). Reordered
  the declared axes to `['range','speed','power']` so a dropped fallback now yields a
  provably different result — re-verified failing.

  Simplified while green: the `seriesCount` ternary had a `data.length ? 1 : 0` arm that
  could never change the outcome (with no series channel the count cannot exceed one), now
  a direct `multiSeries` boolean. `RadarChart` 100% on all four metrics.

  `test:ci` 5752 passing / 382 files; lint 0 errors; `svelte-check` 0 errors 0 warnings.

---

### Task 13: Browser mode — real geometry and area proportionality

**Files:** Create `packages/chart/browser/Radar.browser.spec.ts` + fixtures

Read `packages/ui/browser/README.md` for conventions first. Disable animations in fixtures; await a
frame before measuring.

- [x] A vertex lands at the pixel its angle and radius imply — assert against the **pinned formula's
output**, not merely self-consistency.
- [x] Under sqrt radius with unequal weights, measured wedge area is proportional to `weight × value`.
- [x] Computed-style: fill opacity is `preset.opacity.radar`, not `1`.
- [x] Paint order holds in the rendered document.
- [x] `<Radar>` in `<Spark>` versus in `<Plot>` — same polygon geometry at the same size.
- [x] Commit.

  Done 2026-08-21 (`f020e1bb`). `browser/Radar.browser.spec.ts` (9 tests) + 4 fixtures.
  Browser suite 25 → 34.

  Independence is real, not claimed: the expected radius and the equal-weight closed form
  are re-derived in the spec from literal constants, **not** by calling
  `resolveRadarRadius`/`anglesFor`. Proven by a break-it check — changing `LABEL_MARGIN`
  32 → 40 in the source fails the pinned test, which self-consistent assertions would not.

  Area proportionality uses weights 3/1/2 against values 8/8/2 → products 24/8/4,
  deliberately ordered unlike the weights alone or the values alone, so an implementation
  tracking only one factor ranks them differently. Radii are measured from real pixels;
  wedge widths come from the declared weights (the transform is what is under test).

  Spark/Plot parity is at 300px, above the micro threshold, so **both** render the full
  form — which is the point: the form follows available space, not container identity, so
  a container-sniffing implementation fails this test.

  **Two test-authoring bugs found here, both of which would have produced a
  passing-but-wrong suite:**
  1. Measured against `[data-plot-canvas]` instead of the `<svg>`. `getBoundingClientRect`
     on an SVG `<g>` returns the union bbox of its **children**, not the group's coordinate
     origin, so every measurement was offset. The vertex read 118 where 150 was expected —
     exactly `R`, which is what gave it away.
  2. A break-it check that silently **did not apply**: the sabotage pattern missed
     `preset.js`'s aligned `radar:       0.25` formatting, so "removing the preset" changed
     nothing and the check passed vacuously. A break-it check that cannot fail is worth
     exactly as much as a test that cannot fail — re-run two ways once corrected.

  Five break-it checks confirmed and restored (md5-verified): `LABEL_MARGIN` 32→40 → pinned
  geometry fails; sqrt ignored → area proportionality fails; preset 0.25→1 → the `< 1`
  assertion fails; adapter hardcoding `alpha = 1` → the ≈0.25 assertion fails; interleaved
  fills/strokes → paint order fails.

  `test:browser` 34 passing; `test:ci` 5752 / 382 files; lint 0 errors; `svelte-check` 0/0.

---

### Task 14: Docs, explorer registry, guides

**Files:** `docs/design/20-chart.md`; `apps/learn/…`

⚠ `docs/design/21-charts.md` does **not exist** — it was folded into `20-chart.md`. Do not recreate it.

- [ ] Document the geom, `AxisSpec`, the radius transform table, both forms, and **when radar
misleads** (area exaggeration; inferred-domain instability and how declaring `domain` avoids it).
- [ ] Add radar to the chart-explorer registry so generic navigation reaches it. Add guide coverage at
the same depth as other geoms, including the `Spark` composition guidance from cycle 1.
- [ ] Full gate: `bun run check`, `bun run test:browser`, `bun run coverage`. Coverage gates are 100%
statements+lines on `.js`, ≥90% on `.svelte`. If short, add tests — never lower a threshold.
- [ ] Commit docs and learn changes separately.

---

### Task 15: Journal, priority, release prep

**Files:** `agents/journal.md`, `docs/design/12-priority.md`

- [ ] Journal entry covering: the three pre-implementation reviews and what each found (notably a
provably wrong angle formula in an approved spec); the declared-scale/weighting design that came from
review feedback; the `Spark` accessibility gap inherited from cycle 1; measured outcomes; commit
hashes.
- [ ] Mark radar complete; note both cycles done.
- [ ] Confirm the version bump target is **1.4.0** (new public API: `Spark`, `SparkState`,
`GEOM_CONTRACT`, `Radar`, `RadarChart`) and that release is a **separate, explicitly-approved step** —
`bun run bump` tags and pushes, which triggers npm publish and is irreversible. **Do not run it.**

---

## Self-review

**Spec coverage:** criteria 1–2 → Tasks 2, 6; 3–6 → Tasks 3, 4, 6; 7 → Tasks 5, 9; 8 → Task 5;
9 → Task 1; 10 → Tasks 8, 10; 11 → Tasks 10, 11; 12 → Tasks 7, 12; 13 → Tasks 7, 13; 14 → Task 12;
15 → every task's "existing tests unmodified"; 16 → Task 14; 17–20 → Tasks 1, 3, 6; 21–23 → Task 4;
24 → Task 14.

**Type consistency:** `resolveAxes` (Task 1) → `anglesFor(weights)` (Task 2) → `domainsFor` (Task 3)
→ `radiusFor(value, domain, R, transform)` (Task 4) → vertices (Task 5) → `buildRadarLayout` (Task 6)
→ `buildRadarMarks` (Task 7). `AxisSpec` fields are fixed in Task 1 and unchanged thereafter.

**Ordering dependency:** Tasks 1–6 build `polar.js` incrementally and must run in order. Task 7
depends on 6. Tasks 8–10 depend on 7. Task 11 is independent and could run any time. Tasks 12–15 are
last.
