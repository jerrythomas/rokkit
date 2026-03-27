# Plot CrossFilter Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dc.js-style linked interactive charts to the Plot system. Multiple `Plot` components share a `CrossFilter` context. Clicking a bar (categorical) or dragging a range (continuous) on one chart updates all others. Filtered-out marks are dimmed via `data-dimmed` attribute and theme CSS. `FilterBar` and `FilterSlider` are thin wrapper components for common filter controls.

**Architecture:** A `createCrossFilter()` factory creates a reactive filter state object with a `filters` getter (a `Map<string, Set | [number, number]>`). The `<CrossFilter>` Svelte component provides the instance via Svelte context and exposes the current filter state as `bind:filters`. Each geom reads the filter state from context and applies `data-dimmed` to marks outside the active filter. Dimming opacity (0.15) is applied via theme CSS on `[data-dimmed]`, not inline styles. Filtering is driven by click (categorical) via `filterable` prop; brush (continuous drag) is deferred pending a `brush` geom implementation.

**Tech Stack:** Svelte 5 (`$state`, `$derived`, Svelte context), Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-plot-architecture-design.md` Section 8

**Prerequisites:** Plans 1, 2, and 3 must be complete.

---

## File Structure

```
packages/chart/src/
  crossfilter/
    createCrossFilter.svelte.js   CREATE — factory + filter state (.svelte.js for $state)
    CrossFilter.svelte            CREATE — context provider, bind:filters
    FilterBar.svelte              CREATE — thin wrapper: filterable bar chart
    FilterSlider.svelte           CREATE — range slider (interim: HTML inputs; spec calls for
                                            Plot+Point+brush — deferred until brush geom exists)
  lib/plot/
    crossfilter.js                CREATE — applyDimming utility
```

---

## Chunk 1: CrossFilter state + context

### Task 1: `crossfilter/createCrossFilter.svelte.js`

The reactive filter registry. Stores one filter per dimension (field name) in a `$state` Map.
Filter values follow the spec type: `Map<string, Set<unknown> | [number, number]>` — a raw `Set`
for categorical, a `[min, max]` tuple for continuous. No wrapper objects.

Exposes a `filters` getter so `CrossFilter.svelte` can bind to the current state.

**Files:**

- Create: `packages/chart/src/crossfilter/createCrossFilter.svelte.js`
- Create: `packages/chart/spec/crossfilter/createCrossFilter.svelte.spec.js`

> **Note on `.svelte.js` extension:** `$state` in plain `.js` files is not processed by the Svelte
> compiler under Vitest. The `.svelte.js` extension tells the toolchain to run Svelte preprocessing
> on this file. All imports must use the `.svelte.js` filename.

- [ ] **Step 1: Write the failing tests**

`packages/chart/spec/crossfilter/createCrossFilter.svelte.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { createCrossFilter } from '../../src/crossfilter/createCrossFilter.svelte.js'

describe('createCrossFilter', () => {
  it('returns an object with filter operations', () => {
    const cf = createCrossFilter()
    expect(typeof cf.toggleCategorical).toBe('function')
    expect(typeof cf.setRange).toBe('function')
    expect(typeof cf.clearFilter).toBe('function')
    expect(typeof cf.clearAll).toBe('function')
    expect(typeof cf.isFiltered).toBe('function')
    expect(typeof cf.isDimmed).toBe('function')
  })

  it('exposes a filters getter that returns the Map', () => {
    const cf = createCrossFilter()
    expect(cf.filters).toBeInstanceOf(Map)
  })

  it('starts with no active filters', () => {
    const cf = createCrossFilter()
    expect(cf.isFiltered('region')).toBe(false)
    expect(cf.filters.size).toBe(0)
  })

  describe('categorical filters', () => {
    it('adds a value to a categorical filter on first toggle', () => {
      const cf = createCrossFilter()
      cf.toggleCategorical('class', 'compact')
      expect(cf.isFiltered('class')).toBe(true)
    })

    it('filter value is a Set (not a wrapper object)', () => {
      const cf = createCrossFilter()
      cf.toggleCategorical('class', 'compact')
      expect(cf.filters.get('class')).toBeInstanceOf(Set)
    })

    it('toggles a value off when toggled again', () => {
      const cf = createCrossFilter()
      cf.toggleCategorical('class', 'compact')
      cf.toggleCategorical('class', 'compact')
      // Filter cleared when last value removed
      expect(cf.isFiltered('class')).toBe(false)
    })

    it('selects multiple values independently', () => {
      const cf = createCrossFilter()
      cf.toggleCategorical('class', 'compact')
      cf.toggleCategorical('class', 'suv')
      expect(cf.isDimmed('class', 'compact')).toBe(false)
      expect(cf.isDimmed('class', 'suv')).toBe(false)
      expect(cf.isDimmed('class', 'midsize')).toBe(true)
    })

    it('isDimmed returns false when no filter active on that dimension', () => {
      const cf = createCrossFilter()
      expect(cf.isDimmed('class', 'compact')).toBe(false)
    })
  })

  describe('range filters', () => {
    it('setRange activates a continuous filter', () => {
      const cf = createCrossFilter()
      cf.setRange('displ', [2, 4])
      expect(cf.isFiltered('displ')).toBe(true)
    })

    it('filter value is a [min, max] array (not a wrapper object)', () => {
      const cf = createCrossFilter()
      cf.setRange('displ', [2, 4])
      expect(Array.isArray(cf.filters.get('displ'))).toBe(true)
    })

    it('isDimmed returns true for values outside range', () => {
      const cf = createCrossFilter()
      cf.setRange('displ', [2, 4])
      expect(cf.isDimmed('displ', 1.8)).toBe(true)
      expect(cf.isDimmed('displ', 3.0)).toBe(false)
      expect(cf.isDimmed('displ', 4.5)).toBe(true)
    })

    it('isDimmed returns false for values at range boundary', () => {
      const cf = createCrossFilter()
      cf.setRange('displ', [2, 4])
      expect(cf.isDimmed('displ', 2)).toBe(false)
      expect(cf.isDimmed('displ', 4)).toBe(false)
    })
  })

  describe('clearFilter / clearAll', () => {
    it('clearFilter removes filter for one dimension', () => {
      const cf = createCrossFilter()
      cf.toggleCategorical('class', 'compact')
      cf.setRange('displ', [2, 4])
      cf.clearFilter('class')
      expect(cf.isFiltered('class')).toBe(false)
      expect(cf.isFiltered('displ')).toBe(true)
    })

    it('clearAll removes all filters', () => {
      const cf = createCrossFilter()
      cf.toggleCategorical('class', 'compact')
      cf.setRange('displ', [2, 4])
      cf.clearAll()
      expect(cf.isFiltered('class')).toBe(false)
      expect(cf.isFiltered('displ')).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/createCrossFilter.spec.js
```

Expected: FAIL — `./createCrossFilter.svelte.js` not found.

- [ ] **Step 3: Write `crossfilter/createCrossFilter.svelte.js`**

```js
/**
 * Creates a reactive cross-filter state object.
 *
 * Filter values follow the spec type:
 *   FilterState = Map<string, Set<unknown> | [number, number]>
 *   - categorical: raw Set of selected values
 *   - continuous:  [min, max] tuple
 *
 * Exposes a `filters` getter so CrossFilter.svelte can bind to current state.
 *
 * @returns {CrossFilter}
 */
export function createCrossFilter() {
  // Map<dimension, Set<unknown> | [number, number]>
  const filters = $state(new Map())

  /**
   * Returns true if any filter is active on this dimension.
   * @param {string} dimension
   */
  function isFiltered(dimension) {
    const f = filters.get(dimension)
    if (!f) return false
    if (f instanceof Set) return f.size > 0
    return true // range: always active if present
  }

  /**
   * Returns true if a value on this dimension is NOT in the active filter.
   * Returns false when no filter is active on this dimension.
   *
   * @param {string} dimension
   * @param {unknown} value
   */
  function isDimmed(dimension, value) {
    const f = filters.get(dimension)
    if (!f) return false
    if (f instanceof Set) {
      return !f.has(value)
    }
    // [min, max] range
    const [lo, hi] = f
    return Number(value) < lo || Number(value) > hi
  }

  /**
   * Toggles a categorical value for a dimension.
   * Adds when absent, removes when present.
   * Clears the dimension filter when the last value is removed.
   *
   * @param {string} dimension
   * @param {unknown} value
   */
  function toggleCategorical(dimension, value) {
    const existing = filters.get(dimension)
    const set = existing instanceof Set ? new Set(existing) : new Set()
    if (set.has(value)) {
      set.delete(value)
    } else {
      set.add(value)
    }
    if (set.size === 0) {
      filters.delete(dimension)
    } else {
      filters.set(dimension, set)
    }
  }

  /**
   * Sets a continuous range filter for a dimension.
   * @param {string} dimension
   * @param {[number, number]} range
   */
  function setRange(dimension, range) {
    filters.set(dimension, range)
  }

  /**
   * Clears the filter for a single dimension.
   * @param {string} dimension
   */
  function clearFilter(dimension) {
    filters.delete(dimension)
  }

  /** Clears all active filters. */
  function clearAll() {
    filters.clear()
  }

  return {
    /** @readonly — reactive Map of current filter state */
    get filters() {
      return filters
    },
    isFiltered,
    isDimmed,
    toggleCategorical,
    setRange,
    clearFilter,
    clearAll
  }
}
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/createCrossFilter.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/crossfilter/createCrossFilter.svelte.js packages/chart/spec/crossfilter/createCrossFilter.svelte.spec.js
git commit -m "feat(chart): add createCrossFilter — reactive categorical and range filter state"
```

---

### Task 2: `crossfilter/CrossFilter.svelte`

Svelte context provider. Wraps child `Plot` components and provides the crossfilter instance via
`setContext`. Exposes current filter state as `bind:filters` per spec. Accepts optional external
`crossfilter` prop (for spec/helpers API).

**Files:**

- Create: `packages/chart/src/crossfilter/CrossFilter.svelte`
- Create: `packages/chart/spec/crossfilter/CrossFilter.spec.js`

- [ ] **Step 1: Write the failing test**

`packages/chart/spec/crossfilter/CrossFilter.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import CrossFilter from '../../src/crossfilter/CrossFilter.svelte'

describe('CrossFilter', () => {
  it('renders without crashing', () => {
    expect(() => render(CrossFilter)).not.toThrow()
  })

  it('renders data-crossfilter container', () => {
    const { container } = render(CrossFilter)
    expect(container.querySelector('[data-crossfilter]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/CrossFilter.spec.js
```

Expected: FAIL — `./CrossFilter.svelte` not found.

- [ ] **Step 3: Write `crossfilter/CrossFilter.svelte`**

```svelte
<script>
  import { setContext } from 'svelte'
  import { createCrossFilter } from './createCrossFilter.svelte.js'

  /**
   * @type {{
   *   crossfilter?: ReturnType<typeof createCrossFilter>,
   *   mode?: 'dim' | 'hide',
   *   filters?: import('./createCrossFilter.svelte.js').FilterState,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    crossfilter: externalCf = undefined,
    mode = 'dim',
    filters = $bindable(undefined),
    children
  } = $props()

  // Use an externally provided instance (spec/helpers API) or create one internally
  const cf = externalCf ?? createCrossFilter()

  // Expose the reactive filters Map to callers via bind:filters
  $effect(() => {
    filters = cf.filters
  })

  setContext('crossfilter', cf)
  setContext('crossfilter-mode', mode)
</script>

<div data-crossfilter data-crossfilter-mode={mode}>
  {@render children?.()}
</div>
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/CrossFilter.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/crossfilter/CrossFilter.svelte packages/chart/spec/crossfilter/CrossFilter.spec.js
git commit -m "feat(chart): add CrossFilter.svelte — context provider with bind:filters"
```

---

## Chunk 2: Filter utilities + geom integration

### Task 3: `lib/plot/crossfilter.js`

Pure utilities for applying crossfilter state to mark data. Used by geoms to compute which marks
are dimmed. Uses `instanceof Set` vs `Array.isArray` to distinguish filter types — consistent with
the spec's `FilterState = Map<string, Set | [number, number]>`.

**Files:**

- Create: `packages/chart/src/lib/plot/crossfilter.js`
- Create: `packages/chart/spec/lib/plot/crossfilter.spec.js`

- [ ] **Step 1: Write the failing tests**

`packages/chart/spec/lib/plot/crossfilter.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { applyDimming } from '../../../src/lib/plot/crossfilter.js'
import { createCrossFilter } from '../../../src/crossfilter/createCrossFilter.svelte.js'

const data = [
  { class: 'compact', displ: 1.8, hwy: 29 },
  { class: 'suv', displ: 5.3, hwy: 20 },
  { class: 'midsize', displ: 2.4, hwy: 27 }
]

describe('applyDimming', () => {
  it('returns all marks as not dimmed when no filters active', () => {
    const cf = createCrossFilter()
    const result = applyDimming(data, cf, {})
    expect(result.every((r) => !r.dimmed)).toBe(true)
  })

  it('dims marks whose categorical value is not selected', () => {
    const cf = createCrossFilter()
    cf.toggleCategorical('class', 'compact')
    const result = applyDimming(data, cf, { x: 'class' })
    expect(result.find((r) => r.data.class === 'compact')?.dimmed).toBe(false)
    expect(result.find((r) => r.data.class === 'suv')?.dimmed).toBe(true)
    expect(result.find((r) => r.data.class === 'midsize')?.dimmed).toBe(true)
  })

  it('dims marks outside continuous range', () => {
    const cf = createCrossFilter()
    cf.setRange('displ', [2, 4])
    const result = applyDimming(data, cf, { x: 'displ' })
    expect(result.find((r) => r.data.displ === 1.8)?.dimmed).toBe(true)
    expect(result.find((r) => r.data.displ === 2.4)?.dimmed).toBe(false)
    expect(result.find((r) => r.data.displ === 5.3)?.dimmed).toBe(true)
  })

  it('dims a mark when ANY active filter dimension deems it dimmed (OR logic)', () => {
    const cf = createCrossFilter()
    cf.toggleCategorical('class', 'compact')
    cf.setRange('displ', [1, 3])
    // compact + displ 1.8 → passes both filters → not dimmed
    // suv + displ 5.3 → fails class AND range → dimmed
    // midsize + displ 2.4 → fails class filter → dimmed
    const result = applyDimming(data, cf, { x: 'class', color: 'displ' })
    expect(result.find((r) => r.data.class === 'compact')?.dimmed).toBe(false)
    expect(result.find((r) => r.data.class === 'suv')?.dimmed).toBe(true)
    expect(result.find((r) => r.data.class === 'midsize')?.dimmed).toBe(true)
  })

  it('preserves original data reference in result', () => {
    const cf = createCrossFilter()
    const result = applyDimming(data, cf, { x: 'class' })
    expect(result[0]).toHaveProperty('data')
    expect(result[0]).toHaveProperty('dimmed')
    expect(result[0].data).toBe(data[0])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/crossfilter.spec.js
```

Expected: FAIL — `./crossfilter.js` not found.

- [ ] **Step 3: Write `lib/plot/crossfilter.js`**

```js
/**
 * Applies crossfilter dimming to raw data rows.
 *
 * A row is dimmed if ANY active filter dimension deems it out-of-filter.
 * Returns an array of `{ data, dimmed }` objects.
 *
 * @param {Object[]} data - raw or post-stat data rows
 * @param {ReturnType<import('../../crossfilter/createCrossFilter.svelte.js').createCrossFilter>} cf
 * @param {{ x?: string, y?: string, color?: string, [k: string]: string | undefined }} channels
 * @returns {{ data: Object, dimmed: boolean }[]}
 */
export function applyDimming(data, cf, channels) {
  // Collect all field names that appear in any channel
  const fields = Object.values(channels).filter(Boolean)

  return data.map((row) => {
    const dimmed = fields.some((field) => cf.isDimmed(field, row[field]))
    return { data: row, dimmed }
  })
}
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/crossfilter.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/crossfilter.js packages/chart/spec/lib/plot/crossfilter.spec.js
git commit -m "feat(chart): add lib/plot/crossfilter.js — applyDimming utility for crossfilter geoms"
```

---

### Task 4: Update `geoms/Bar.svelte` to support `filterable` + dimming

Adds click-to-filter behavior and `data-dimmed` attribute to bars when a CrossFilter context is
present. CrossFilter context is optional — Bar works without it.

**Dimming approach:** Set `data-dimmed` attribute on the `<rect>` element and let theme CSS handle
opacity (spec: 0.15 via `[data-dimmed] { opacity: 0.15 }`). Do NOT add inline `fill-opacity`.

**Files:**

- Modify: `packages/chart/src/geoms/Bar.svelte`
- Create: `packages/chart/spec/geoms/Bar.crossfilter.spec.js`
- Create: `packages/chart/spec/helpers/TestBarCF.svelte`

- [ ] **Step 1: Read `geoms/Bar.svelte`**

Read `packages/chart/src/geoms/Bar.svelte` (written in Plan 2) to understand its current structure
before modifying. Look at the `{#each bars as bar}` loop and the `<rect>` element's attributes.

- [ ] **Step 2: Add crossfilter imports and props to `Bar.svelte` `<script>`**

Add to the top of the `<script>` block (after existing imports):

```js
import { getContext } from 'svelte'
import { applyDimming } from '../lib/plot/crossfilter.js'

// CrossFilter context (optional — undefined if no CrossFilter wraps this chart)
const cf = getContext('crossfilter')
const cfMode = getContext('crossfilter-mode') // 'dim' | 'hide'
```

Add `filterable` to the `$props()` destructure:

```js
// existing props + new:
let { ..., filterable = false } = $props()
```

Add a derived that attaches dimming state to bars:

```js
// After the existing `const bars = $derived.by(() => { ... })`
const barsWithDim = $derived.by(() => {
  if (!cf) return bars.map((b) => ({ ...b, dimmed: false }))
  const dimmed = applyDimming(
    bars.map((b) => b.data),
    cf,
    { x, color }
  )
  return bars.map((b, i) => ({ ...b, dimmed: dimmed[i]?.dimmed ?? false }))
})
```

- [ ] **Step 3: Update the `{#each}` loop in the template**

Replace `{#each bars as bar (bar.key)}` with `{#each barsWithDim as bar (bar.key)}`.

On each `<rect>`, add:

- `data-dimmed={bar.dimmed ? true : undefined}` — attribute present when dimmed, absent when not
- `onclick={filterable && x ? () => cf?.toggleCategorical(x, bar.data[x]) : undefined}`
- `style:cursor={filterable ? 'pointer' : undefined}`
- Wrap the `<rect>` in `{#if cfMode !== 'hide' || !bar.dimmed}...{/if}` for hide mode

Do NOT add `fill-opacity` — dimming opacity is handled by theme CSS via `[data-dimmed]`.

Example template structure after changes:

```svelte
{#each barsWithDim as bar (bar.key)}
  {#if cfMode !== 'hide' || !bar.dimmed}
    <rect
      x={bar.x}
      y={bar.y}
      width={bar.width}
      height={bar.height}
      fill={bar.fill}
      stroke={bar.stroke}
      data-plot-element="bar"
      data-dimmed={bar.dimmed ? true : undefined}
      onclick={filterable && x ? () => cf?.toggleCategorical(x, bar.data[x]) : undefined}
      style:cursor={filterable ? 'pointer' : undefined}
    />
  {/if}
{/each}
```

- [ ] **Step 4: Create `spec/helpers/TestBarCF.svelte`**

```svelte
<script>
  import CrossFilter from '../../src/crossfilter/CrossFilter.svelte'
  import PlotChart from '../../src/Plot.svelte'
  import Bar from '../../src/geoms/Bar.svelte'

  let { data, cf } = $props()
</script>

<CrossFilter crossfilter={cf}>
  <PlotChart {data} width={400} height={300} grid={false}>
    <Bar x="class" y="hwy" filterable={true} />
  </PlotChart>
</CrossFilter>
```

- [ ] **Step 5: Write crossfilter bar integration tests**

`packages/chart/spec/geoms/Bar.crossfilter.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { createCrossFilter } from '../../src/crossfilter/createCrossFilter.svelte.js'
import TestBarCF from '../helpers/TestBarCF.svelte'

describe('Bar geom crossfilter', () => {
  const data = [
    { class: 'compact', hwy: 29 },
    { class: 'suv', hwy: 20 }
  ]

  it('renders bars without data-dimmed when no filter active', () => {
    const cf = createCrossFilter()
    const { container } = render(TestBarCF, { props: { data, cf } })
    const dimmed = container.querySelectorAll('[data-dimmed]')
    expect(dimmed.length).toBe(0)
  })

  it('applies data-dimmed attribute to out-of-filter bars after click', () => {
    const cf = createCrossFilter()
    const { container } = render(TestBarCF, { props: { data, cf } })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBeGreaterThan(0)
    fireEvent.click(bars[0])
    // After clicking the first bar, the OTHER bars should be dimmed
    expect(cf.isFiltered('class')).toBe(true)
  })

  it('clicking a bar triggers toggleCategorical on the crossfilter', () => {
    const cf = createCrossFilter()
    const { container } = render(TestBarCF, { props: { data, cf } })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    fireEvent.click(bars[0])
    expect(cf.isFiltered('class')).toBe(true)
  })

  it('clicking the same bar again removes the filter (toggle)', () => {
    const cf = createCrossFilter()
    const { container } = render(TestBarCF, { props: { data, cf } })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    fireEvent.click(bars[0])
    fireEvent.click(bars[0])
    expect(cf.isFiltered('class')).toBe(false)
  })
})
```

- [ ] **Step 6: Run crossfilter bar tests**

```bash
bun run test:ci -- packages/chart/spec/Bar.crossfilter.spec.js
```

Expected: All pass.

- [ ] **Step 7: Run full test suite**

```bash
bun run test:ci
```

Expected: All existing tests still pass.

- [ ] **Step 8: Commit**

```bash
git add packages/chart/src/geoms/Bar.svelte packages/chart/spec/geoms/Bar.crossfilter.spec.js packages/chart/spec/helpers/TestBarCF.svelte
git commit -m "feat(chart): add crossfilter support to Bar geom — filterable click + data-dimmed"
```

---

## Chunk 3: FilterBar, FilterSlider + exports

### Task 5: `crossfilter/FilterBar.svelte`

A compact, always-filterable bar chart. Thin wrapper around `PlotChart + Bar (filterable=true)`.
Must be placed inside an external `<CrossFilter>` wrapper — it does not create its own.

**Files:**

- Create: `packages/chart/src/crossfilter/FilterBar.svelte`
- Create: `packages/chart/spec/crossfilter/FilterBar.spec.js`

- [ ] **Step 1: Write the failing test**

`packages/chart/spec/crossfilter/FilterBar.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FilterBar from '../../src/crossfilter/FilterBar.svelte'

const data = [
  { class: 'compact', hwy: 29 },
  { class: 'suv', hwy: 20 }
]

describe('FilterBar', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(FilterBar, {
        props: { data, field: 'class', valueField: 'hwy' }
      })
    ).not.toThrow()
  })

  it('renders data-plot-root (contains a Plot)', () => {
    const { container } = render(FilterBar, {
      props: { data, field: 'class', valueField: 'hwy' }
    })
    expect(container.querySelector('[data-plot-root]')).toBeTruthy()
  })

  it('renders bars marked as filterable', () => {
    const { container } = render(FilterBar, {
      props: { data, field: 'class', valueField: 'hwy' }
    })
    expect(container.querySelector('[data-plot-element="bar"]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/FilterBar.spec.js
```

Expected: FAIL — `./FilterBar.svelte` not found.

- [ ] **Step 3: Write `crossfilter/FilterBar.svelte`**

```svelte
<script>
  import PlotChart from '../Plot.svelte'
  import Bar from '../geoms/Bar.svelte'

  /**
   * Compact filterable bar chart for use inside a <CrossFilter> wrapper.
   *
   * @type {{
   *   data: Object[],
   *   field: string,
   *   valueField: string,
   *   stat?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark'
   * }}
   */
  let {
    data = [],
    field,
    valueField,
    stat = 'sum',
    width = 300,
    height = 120,
    mode = 'light'
  } = $props()
</script>

<!-- FilterBar must be used inside a <CrossFilter> parent. Does not create its own context. -->
<PlotChart {data} {width} {height} {mode} grid={false} legend={false}>
  <Bar x={field} y={valueField} {stat} filterable={true} />
</PlotChart>
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/FilterBar.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/crossfilter/FilterBar.svelte packages/chart/spec/crossfilter/FilterBar.spec.js
git commit -m "feat(chart): add FilterBar — compact filterable bar chart for filter panels"
```

---

### Task 6: `crossfilter/FilterSlider.svelte`

A range slider that sets a continuous filter on one dimension. Designed for use inside a `CrossFilter` wrapper.

**Spec deviation note:** The spec (Section 8) describes `FilterSlider` as "a small Plot with a Point
brush geom on a single axis." That architecture requires a `brush` interaction on `GeomPoint`, which
is not yet implemented (deferred, not in this plan set). This task implements `FilterSlider` as two
HTML `<input type="range">` elements as an interim approach. When the `brush` geom is added, this
component should be refactored to wrap `PlotChart + Point brush`.

**Files:**

- Create: `packages/chart/src/crossfilter/FilterSlider.svelte`
- Create: `packages/chart/spec/crossfilter/FilterSlider.spec.js`

- [ ] **Step 1: Write the failing test**

`packages/chart/spec/crossfilter/FilterSlider.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FilterSlider from '../../src/crossfilter/FilterSlider.svelte'

describe('FilterSlider', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(FilterSlider, {
        props: { field: 'displ', min: 1.6, max: 7.0 }
      })
    ).not.toThrow()
  })

  it('renders data-filter-slider container', () => {
    const { container } = render(FilterSlider, {
      props: { field: 'displ', min: 1.6, max: 7.0 }
    })
    expect(container.querySelector('[data-filter-slider]')).toBeTruthy()
  })

  it('renders two range inputs (low and high)', () => {
    const { container } = render(FilterSlider, {
      props: { field: 'displ', min: 1.6, max: 7.0 }
    })
    const inputs = container.querySelectorAll('input[type="range"]')
    expect(inputs.length).toBe(2)
  })

  it('renders data-filter-slider-low and data-filter-slider-high', () => {
    const { container } = render(FilterSlider, {
      props: { field: 'displ', min: 1.6, max: 7.0 }
    })
    expect(container.querySelector('[data-filter-slider-low]')).toBeTruthy()
    expect(container.querySelector('[data-filter-slider-high]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/FilterSlider.spec.js
```

Expected: FAIL — `./FilterSlider.svelte` not found.

- [ ] **Step 3: Write `crossfilter/FilterSlider.svelte`**

```svelte
<script>
  import { getContext } from 'svelte'

  /**
   * Dual range slider for a continuous crossfilter dimension.
   *
   * NOTE: This is an interim implementation using HTML range inputs.
   * The spec calls for a Plot+Point+brush architecture, deferred until the
   * brush geom is implemented.
   *
   * @type {{
   *   field: string,
   *   min: number,
   *   max: number,
   *   step?: number,
   *   label?: string
   * }}
   */
  let { field, min, max, step = 0.1, label = '' } = $props()

  const cf = getContext('crossfilter')

  let low = $state(min)
  let high = $state(max)

  function handleLow(e) {
    low = Math.min(Number(e.currentTarget.value), high)
    cf?.setRange(field, [low, high])
  }

  function handleHigh(e) {
    high = Math.max(Number(e.currentTarget.value), low)
    cf?.setRange(field, [low, high])
  }
</script>

<div class="filter-slider" data-filter-slider data-filter-field={field}>
  {#if label}
    <span class="label" data-filter-slider-label>{label}</span>
  {/if}
  <div class="inputs">
    <input
      type="range"
      {min}
      {max}
      {step}
      value={low}
      oninput={handleLow}
      aria-label="Minimum {label || field}"
      data-filter-slider-low
    />
    <input
      type="range"
      {min}
      {max}
      {step}
      value={high}
      oninput={handleHigh}
      aria-label="Maximum {label || field}"
      data-filter-slider-high
    />
  </div>
  <div class="range-display" data-filter-slider-display>
    {low} – {high}
  </div>
</div>

<style>
  .filter-slider {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }
  .inputs {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .label {
    font-weight: 600;
  }
  .range-display {
    color: currentColor;
    opacity: 0.7;
  }
</style>
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/FilterSlider.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/crossfilter/FilterSlider.svelte packages/chart/spec/crossfilter/FilterSlider.spec.js
git commit -m "feat(chart): add FilterSlider — dual range slider for continuous crossfilter dimensions (interim)"
```

---

### Task 7: Exports + update docs status

**Files:**

- Modify: `packages/chart/src/index.js`
- Modify: `docs/features/07-Charts.md`

- [ ] **Step 1: Read `packages/chart/src/index.js`**

Read the file to see its current exports before modifying.

- [ ] **Step 2: Add CrossFilter exports to `index.js`**

Add after the existing exports:

```js
// CrossFilter system
export { createCrossFilter } from './crossfilter/createCrossFilter.svelte.js'
export { default as CrossFilter } from './crossfilter/CrossFilter.svelte'
export { default as FilterBar } from './crossfilter/FilterBar.svelte'
export { default as FilterSlider } from './crossfilter/FilterSlider.svelte'
```

- [ ] **Step 3: Update `docs/features/07-Charts.md` CrossFilter status**

Update these rows from 🔲 Planned to ✅ Implemented:

```
| `CrossFilter` context provider         | ✅ Implemented |
| `createCrossFilter()` for spec API     | ✅ Implemented |
| Click filter (categorical)             | ✅ Implemented |
| Dimming filtered-out marks             | ✅ Implemented |
| `FilterBar` wrapper component          | ✅ Implemented |
| `FilterSlider` wrapper component       | ✅ Implemented (interim — HTML inputs) |
```

Remaining 🔲 Planned (not in this plan set):

- Brush filter (continuous range via drag on chart canvas) — requires `brush` geom
- Playground e2e page at `/playground/charts/cross-filter` — site work, tracked separately

- [ ] **Step 4: Run tests and lint**

```bash
bun run test:ci && bun run lint
```

Expected: All pass, zero lint errors.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/index.js docs/features/07-Charts.md
git commit -m "feat(chart): export CrossFilter system; update feature status"
```

---

## Done

After Task 7, the CrossFilter layer is complete:

- `crossfilter/createCrossFilter.svelte.js` — reactive categorical + range filter state (tested)
  - `FilterState = Map<string, Set<unknown> | [number, number]>` — raw values, no wrappers
  - Exposes `filters` getter for `bind:filters`
- `crossfilter/CrossFilter.svelte` — Svelte context provider, `dim`/`hide` modes, `bind:filters`
- `lib/plot/crossfilter.js` — `applyDimming` utility (tested)
- `geoms/Bar.svelte` — `filterable` prop, `data-dimmed` attribute (CSS-controlled opacity), click-to-filter
- `crossfilter/FilterBar.svelte` — compact filterable bar chart for filter panels (tested)
- `crossfilter/FilterSlider.svelte` — dual range slider for continuous dimensions (tested, interim)

**The full Plot system (Plans 1–4) is now complete:**

- Plan 1: Pure-JS foundation (stat resolver, scale utilities, PlotState)
- Plan 2: Rendering layer (geoms, Axis, Grid, Legend, Plot.svelte)
- Plan 3: Facets and Animation (FacetPlot, AnimatedPlot, Timeline)
- Plan 4: CrossFilter interaction (linked charts, filtering, dimming)
