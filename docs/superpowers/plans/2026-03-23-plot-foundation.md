# Plot Foundation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pure-JS foundation layer for the Plot architecture — stat resolver, unified scale building, color scale types, orientation inference, preset resolver, and PlotState reactive class — with comprehensive tests using the mpg dataset.

**Architecture:** All logic is pure JS (no Svelte components). PlotState is a Svelte 5 reactive class (`$state`, `$derived`) that wires together stat → aggregated data → unified scales → color assignment. Existing `lib/brewing/` utilities are extended or wrapped rather than replaced. New code lives in `lib/plot/`.

**Tech Stack:** Svelte 5, D3 (d3-scale, d3-array, d3-interpolate), Vitest, existing `@rokkit/data` dataset utilities.

**Spec:** `docs/superpowers/specs/2026-03-23-plot-architecture-design.md`

---

## Chunk 1: Test fixture + stat resolver

### Task 1: mpg test fixture

The mpg dataset (from ggplot2) is the primary test fixture for all chart logic. 234 rows, categorical + numeric fields.

**Files:**

- Create: `packages/chart/spec/fixtures/mpg.json`

- [ ] **Step 1: Create the mpg fixture file**

```json
[
  {
    "manufacturer": "audi",
    "model": "a4",
    "displ": 1.8,
    "year": 1999,
    "cyl": 4,
    "trans": "auto(l5)",
    "drv": "f",
    "cty": 18,
    "hwy": 29,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4",
    "displ": 1.8,
    "year": 1999,
    "cyl": 4,
    "trans": "manual(m5)",
    "drv": "f",
    "cty": 21,
    "hwy": 29,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4",
    "displ": 2.0,
    "year": 2008,
    "cyl": 4,
    "trans": "manual(m6)",
    "drv": "f",
    "cty": 20,
    "hwy": 31,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4",
    "displ": 2.0,
    "year": 2008,
    "cyl": 4,
    "trans": "auto(av)",
    "drv": "f",
    "cty": 21,
    "hwy": 30,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4",
    "displ": 2.8,
    "year": 1999,
    "cyl": 6,
    "trans": "auto(l5)",
    "drv": "f",
    "cty": 16,
    "hwy": 26,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4",
    "displ": 2.8,
    "year": 1999,
    "cyl": 6,
    "trans": "manual(m5)",
    "drv": "f",
    "cty": 18,
    "hwy": 26,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4",
    "displ": 3.1,
    "year": 2008,
    "cyl": 6,
    "trans": "auto(av)",
    "drv": "f",
    "cty": 18,
    "hwy": 27,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4 quattro",
    "displ": 1.8,
    "year": 1999,
    "cyl": 4,
    "trans": "manual(m5)",
    "drv": "4",
    "cty": 18,
    "hwy": 26,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4 quattro",
    "displ": 1.8,
    "year": 1999,
    "cyl": 4,
    "trans": "auto(l5)",
    "drv": "4",
    "cty": 16,
    "hwy": 25,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "audi",
    "model": "a4 quattro",
    "displ": 2.0,
    "year": 2008,
    "cyl": 4,
    "trans": "manual(m6)",
    "drv": "4",
    "cty": 20,
    "hwy": 28,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "chevrolet",
    "model": "c1500 suburban 2wd",
    "displ": 5.3,
    "year": 2008,
    "cyl": 8,
    "trans": "auto(l4)",
    "drv": "r",
    "cty": 14,
    "hwy": 20,
    "fl": "r",
    "class": "suv"
  },
  {
    "manufacturer": "chevrolet",
    "model": "corvette",
    "displ": 5.7,
    "year": 1999,
    "cyl": 8,
    "trans": "manual(m6)",
    "drv": "r",
    "cty": 16,
    "hwy": 26,
    "fl": "p",
    "class": "2seater"
  },
  {
    "manufacturer": "dodge",
    "model": "caravan 2wd",
    "displ": 2.4,
    "year": 1999,
    "cyl": 4,
    "trans": "auto(l3)",
    "drv": "f",
    "cty": 18,
    "hwy": 24,
    "fl": "r",
    "class": "minivan"
  },
  {
    "manufacturer": "dodge",
    "model": "dakota pickup 4wd",
    "displ": 3.9,
    "year": 1999,
    "cyl": 6,
    "trans": "auto(l4)",
    "drv": "4",
    "cty": 13,
    "hwy": 17,
    "fl": "r",
    "class": "pickup"
  },
  {
    "manufacturer": "ford",
    "model": "expedition 2wd",
    "displ": 4.6,
    "year": 1999,
    "cyl": 8,
    "trans": "auto(l4)",
    "drv": "r",
    "cty": 11,
    "hwy": 17,
    "fl": "r",
    "class": "suv"
  },
  {
    "manufacturer": "honda",
    "model": "civic",
    "displ": 1.6,
    "year": 1999,
    "cyl": 4,
    "trans": "manual(m5)",
    "drv": "f",
    "cty": 28,
    "hwy": 33,
    "fl": "r",
    "class": "subcompact"
  },
  {
    "manufacturer": "honda",
    "model": "civic",
    "displ": 1.8,
    "year": 2008,
    "cyl": 4,
    "trans": "auto(l5)",
    "drv": "f",
    "cty": 25,
    "hwy": 36,
    "fl": "r",
    "class": "subcompact"
  },
  {
    "manufacturer": "hyundai",
    "model": "sonata",
    "displ": 2.4,
    "year": 2008,
    "cyl": 4,
    "trans": "auto(l4)",
    "drv": "f",
    "cty": 21,
    "hwy": 30,
    "fl": "r",
    "class": "midsize"
  },
  {
    "manufacturer": "toyota",
    "model": "camry",
    "displ": 2.2,
    "year": 1999,
    "cyl": 4,
    "trans": "manual(m5)",
    "drv": "f",
    "cty": 21,
    "hwy": 29,
    "fl": "r",
    "class": "midsize"
  },
  {
    "manufacturer": "toyota",
    "model": "corolla",
    "displ": 1.8,
    "year": 1999,
    "cyl": 4,
    "trans": "auto(l4)",
    "drv": "f",
    "cty": 26,
    "hwy": 29,
    "fl": "r",
    "class": "compact"
  },
  {
    "manufacturer": "toyota",
    "model": "4runner 4wd",
    "displ": 4.0,
    "year": 2008,
    "cyl": 6,
    "trans": "auto(l5)",
    "drv": "4",
    "cty": 17,
    "hwy": 21,
    "fl": "r",
    "class": "suv"
  },
  {
    "manufacturer": "volkswagen",
    "model": "gti",
    "displ": 2.0,
    "year": 2008,
    "cyl": 4,
    "trans": "manual(m6)",
    "drv": "f",
    "cty": 21,
    "hwy": 29,
    "fl": "p",
    "class": "compact"
  },
  {
    "manufacturer": "volkswagen",
    "model": "jetta",
    "displ": 2.5,
    "year": 2008,
    "cyl": 5,
    "trans": "auto(s6)",
    "drv": "f",
    "cty": 21,
    "hwy": 29,
    "fl": "r",
    "class": "compact"
  },
  {
    "manufacturer": "volkswagen",
    "model": "passat",
    "displ": 2.0,
    "year": 2008,
    "cyl": 4,
    "trans": "auto(s6)",
    "drv": "f",
    "cty": 19,
    "hwy": 28,
    "fl": "p",
    "class": "midsize"
  }
]
```

Save this to `packages/chart/spec/fixtures/mpg.json`.

**Known limitation:** This is a 24-row representative subset of the full 234-row ggplot2 mpg dataset. It covers all 7 vehicle classes, 3 drive types, both model years, and a realistic numeric range. Test assertions must be derived from this subset — do not hardcode statistics that assume the full dataset. If full-dataset fidelity is needed (e.g., statistical distribution tests), replace with the full 234-row set from `https://vincentarelbundock.github.io/Rdatasets/csv/ggplot2/mpg.csv`.

Fields: manufacturer (string), model (string), displ (number), year (number: 1999|2008), cyl (number), trans (string), drv (string: 4|f|r), cty (number), hwy (number), fl (string), class (string: compact|suv|2seater|minivan|pickup|subcompact|midsize).

- [ ] **Step 2: Verify the file parses**

```bash
cd packages/chart && node -e "const d = require('./spec/fixtures/mpg.json'); console.log(d.length, 'rows, classes:', [...new Set(d.map(r=>r.class))])"
```

Expected: `24 rows, classes: [ 'compact', 'suv', '2seater', 'minivan', 'pickup', 'subcompact', 'midsize' ]`

- [ ] **Step 3: Commit**

```bash
git add packages/chart/spec/fixtures/mpg.json
git commit -m "test(chart): add mpg dataset fixture for plot foundation tests"
```

---

### Task 2: Extended stat resolver

Extends existing `applyAggregate` with: `identity` as explicit built-in, helpers lookup by name, unknown stat warns + falls back to identity, and a unified `inferGroupByFields` helper that derives grouping keys from channel config.

**Files:**

- Create: `packages/chart/src/lib/plot/stat.js`
- Create: `packages/chart/spec/plot/stat.spec.js`

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/plot/stat.spec.js
import { describe, it, expect, vi } from 'vitest'
import mpg from '../fixtures/mpg.json'
import { resolveStat, inferGroupByFields, applyGeomStat } from '../../src/lib/plot/stat.js'

describe('resolveStat', () => {
  it('returns identity function for "identity"', () => {
    const fn = resolveStat('identity', {})
    const data = [1, 2, 3]
    expect(fn(data)).toBe(data)
  })

  it('returns built-in sum function', () => {
    const fn = resolveStat('sum', {})
    expect(fn([10, 20, 30])).toBe(60)
  })

  it('returns built-in mean function', () => {
    const fn = resolveStat('mean', {})
    expect(fn([10, 20, 30])).toBe(20)
  })

  it('returns built-in count function', () => {
    const fn = resolveStat('count', {})
    expect(fn([1, 2, 3])).toBe(3)
  })

  it('returns built-in median function', () => {
    const fn = resolveStat('median', {})
    expect(fn([1, 3, 2])).toBe(2)
  })

  it('returns built-in min function', () => {
    const fn = resolveStat('min', {})
    expect(fn([5, 1, 9])).toBe(1)
  })

  it('returns built-in max function', () => {
    const fn = resolveStat('max', {})
    expect(fn([5, 1, 9])).toBe(9)
  })

  it('resolves custom stat from helpers.stats', () => {
    const custom = (vals) => vals.reduce((a, b) => a + b, 0) * 2
    const fn = resolveStat('double_sum', { stats: { double_sum: custom } })
    expect(fn([5, 5])).toBe(20)
  })

  it('warns and returns identity for unknown stat', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fn = resolveStat('nonexistent', {})
    const data = [1, 2, 3]
    expect(fn(data)).toBe(data)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent'))
    warn.mockRestore()
  })
})

describe('inferGroupByFields', () => {
  it('returns all non-value channel fields', () => {
    const channels = { x: 'class', y: 'cty', color: 'drv' }
    const valueFields = ['cty']
    expect(inferGroupByFields(channels, valueFields)).toEqual(['class', 'drv'])
  })

  it('excludes undefined channels', () => {
    const channels = { x: 'class', y: 'cty', color: undefined }
    expect(inferGroupByFields(channels, ['cty'])).toEqual(['class'])
  })

  it('deduplicates fields', () => {
    const channels = { x: 'class', color: 'class', y: 'cty' }
    expect(inferGroupByFields(channels, ['cty'])).toEqual(['class'])
  })
})

describe('applyGeomStat', () => {
  it('identity returns data unchanged', () => {
    const result = applyGeomStat(mpg, { stat: 'identity', channels: { x: 'class', y: 'cty' } }, {})
    expect(result).toBe(mpg)
  })

  it('sum aggregates cty by class from mpg', () => {
    const result = applyGeomStat(mpg, { stat: 'sum', channels: { x: 'class', y: 'cty' } }, {})
    const compact = result.find((r) => r.class === 'compact')
    const expected = mpg.filter((r) => r.class === 'compact').reduce((a, r) => a + r.cty, 0)
    expect(compact.cty).toBe(expected)
  })

  it('mean aggregates hwy by class from mpg', () => {
    const result = applyGeomStat(mpg, { stat: 'mean', channels: { x: 'class', y: 'hwy' } }, {})
    const suv = result.find((r) => r.class === 'suv')
    const suvRows = mpg.filter((r) => r.class === 'suv')
    const expected = suvRows.reduce((a, r) => a + r.hwy, 0) / suvRows.length
    expect(suv.hwy).toBeCloseTo(expected)
  })

  it('groups by multiple channels (class + drv)', () => {
    const result = applyGeomStat(
      mpg,
      { stat: 'count', channels: { x: 'class', color: 'drv', y: 'cty' } },
      {}
    )
    // compact+f and compact+4 should be separate groups
    const compactF = result.filter((r) => r.class === 'compact' && r.drv === 'f')
    const compactFour = result.filter((r) => r.class === 'compact' && r.drv === '4')
    expect(compactF.length).toBeGreaterThan(0)
    expect(compactFour.length).toBeGreaterThan(0)
  })

  it('uses custom stat from helpers', () => {
    const helpers = {
      stats: { p95: (vals) => vals.sort((a, b) => a - b)[Math.floor(vals.length * 0.95)] }
    }
    const result = applyGeomStat(mpg, { stat: 'p95', channels: { x: 'class', y: 'cty' } }, helpers)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('class')
    expect(result[0]).toHaveProperty('cty')
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd packages/chart && bun run test spec/plot/stat.spec.js
```

Expected: FAIL — `stat.js` does not exist yet.

- [ ] **Step 3: Implement stat.js**

```js
// packages/chart/src/lib/plot/stat.js
import { sum, mean, min, max, median } from 'd3-array'
import { applyAggregate } from '../brewing/stats.js'

// Built-in value reducers: each receives an array of values and returns a scalar.
// 'identity' is handled separately in applyGeomStat — it never enters the reducer path.
const BUILT_IN_STATS = {
  sum,
  mean,
  min,
  max,
  count: (values) => values.length,
  median
}

/**
 * Resolves a stat name to a values-reducer function.
 * Resolution order: built-in → helpers.stats[name] → warn + null (caller treats null as identity).
 *
 * Returns null for 'identity' — callers must short-circuit before calling this.
 * All other returned functions accept an array of values and return a scalar.
 *
 * @param {string} name
 * @param {import('./types.js').PlotHelpers} helpers
 * @returns {Function|null}
 */
export function resolveStat(name, helpers = {}) {
  if (name === 'identity') return (data) => data // identity: pass-through (receives full array)
  if (BUILT_IN_STATS[name]) return BUILT_IN_STATS[name]
  if (helpers?.stats?.[name]) return helpers.stats[name]
  console.warn(
    `[Plot] Unknown stat "${name}" — falling back to identity. Add it to helpers.stats to suppress this warning.`
  )
  return (data) => data
}

/**
 * Infers the groupBy fields from a channel config by excluding value fields.
 * Deduplicates and removes undefined values.
 *
 * @param {Record<string, string|undefined>} channels
 * @param {string[]} valueFields  — channel keys whose values ARE the aggregated quantity (e.g. ['y', 'size'])
 * @returns {string[]}
 */
export function inferGroupByFields(channels, valueFields) {
  const seen = new Set()
  const result = []
  for (const [key, field] of Object.entries(channels)) {
    if (!field) continue
    if (valueFields.includes(key)) continue
    if (seen.has(field)) continue
    seen.add(field)
    result.push(field)
  }
  return result
}

/**
 * Applies a geom's stat transform to data.
 * Groups by all non-value channels, aggregates each value channel.
 *
 * @param {Object[]} data
 * @param {{ stat: string, channels: Record<string, string> }} geomConfig
 * @param {import('./types.js').PlotHelpers} helpers
 * @returns {Object[]}
 */
export function applyGeomStat(data, geomConfig, helpers = {}) {
  const { stat = 'identity', channels = {} } = geomConfig
  if (stat === 'identity') return data

  // Resolve stat name → reducer function BEFORE calling applyAggregate.
  // This ensures custom helpers.stats and median work — applyAggregate only knows
  // the built-ins from brewing/stats.js (sum/mean/min/max/count), not median or helpers.
  const statFn = resolveStat(stat, helpers)
  // resolveStat returns identity fn for unknown stats (after warning); treat as no-op
  if (!statFn || stat === 'identity') return data

  // Value fields: y, size, theta are aggregated quantities
  const VALUE_CHANNEL_KEYS = ['y', 'size', 'theta']
  const groupByFields = inferGroupByFields(channels, VALUE_CHANNEL_KEYS)
  const primaryKey = VALUE_CHANNEL_KEYS.find((k) => channels[k])
  if (!primaryKey) return data

  // Aggregate primary value field using the resolved function
  let result = applyAggregate(data, {
    by: groupByFields,
    value: channels[primaryKey],
    stat: statFn // pass the resolved function, not the raw string name
  })

  // Merge additional value fields (size, theta) if present
  for (const key of VALUE_CHANNEL_KEYS.filter((k) => k !== primaryKey && channels[k])) {
    const extra = applyAggregate(data, { by: groupByFields, value: channels[key], stat: statFn })
    const index = new Map(extra.map((r) => [groupByFields.map((f) => r[f]).join('|'), r]))
    result = result.map((r) => {
      const mapKey = groupByFields.map((f) => r[f]).join('|')
      const extraRow = index.get(mapKey)
      return extraRow ? { ...r, [channels[key]]: extraRow[channels[key]] } : r
    })
  }

  return result
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd packages/chart && bun run test spec/plot/stat.spec.js
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/stat.js packages/chart/spec/plot/stat.spec.js packages/chart/spec/fixtures/mpg.json
git commit -m "feat(chart): add plot stat resolver with helpers extension and mpg fixture"
```

---

## Chunk 2: Scale utilities + orientation inference

### Task 3: Scale utilities — union domains and color scales

**Files:**

- Create: `packages/chart/src/lib/plot/scales.js`
- Create: `packages/chart/spec/plot/scales.spec.js`

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/plot/scales.spec.js
import { describe, it, expect } from 'vitest'
import mpg from '../fixtures/mpg.json'
import {
  inferFieldType,
  inferOrientation,
  buildUnifiedXScale,
  buildUnifiedYScale,
  inferColorScaleType
} from '../../src/lib/plot/scales.js'

describe('inferFieldType', () => {
  it('returns "band" for string field (class)', () => {
    expect(inferFieldType(mpg, 'class')).toBe('band')
  })

  it('returns "continuous" for numeric field (cty)', () => {
    expect(inferFieldType(mpg, 'cty')).toBe('continuous')
  })

  it('returns "continuous" for year (numbers)', () => {
    expect(inferFieldType(mpg, 'year')).toBe('continuous')
  })

  it('returns "band" for drv (single-char strings)', () => {
    expect(inferFieldType(mpg, 'drv')).toBe('band')
  })
})

describe('inferOrientation', () => {
  it('returns "vertical" when x is band, y is continuous', () => {
    expect(inferOrientation('band', 'continuous')).toBe('vertical')
  })

  it('returns "horizontal" when y is band, x is continuous', () => {
    expect(inferOrientation('continuous', 'band')).toBe('horizontal')
  })

  it('returns "none" when both are continuous', () => {
    expect(inferOrientation('continuous', 'continuous')).toBe('none')
  })

  it('returns "none" when both are band (unusual but valid)', () => {
    expect(inferOrientation('band', 'band')).toBe('none')
  })
})

describe('buildUnifiedXScale', () => {
  it('builds band scale for categorical x field', () => {
    const scale = buildUnifiedXScale([mpg], 'class', 500)
    expect(typeof scale.bandwidth).toBe('function')
    expect(scale.domain()).toContain('compact')
    expect(scale.domain()).toContain('suv')
  })

  it('builds linear scale for numeric x field (displ)', () => {
    const scale = buildUnifiedXScale([mpg], 'displ', 500)
    expect(typeof scale.ticks).toBe('function')
  })

  it('unions domains across multiple datasets', () => {
    const ds1 = mpg.filter((r) => r.class === 'compact')
    const ds2 = mpg.filter((r) => r.class === 'suv')
    const unified = buildUnifiedXScale([ds1, ds2], 'class', 500)
    expect(unified.domain()).toContain('compact')
    expect(unified.domain()).toContain('suv')
  })

  it('respects explicit numeric domain override', () => {
    const scale = buildUnifiedXScale([mpg], 'cty', 500, { domain: [0, 50] })
    expect(scale.domain()).toEqual([0, 50])
    expect(typeof scale.ticks).toBe('function') // still linear
  })

  it('respects explicit categorical domain override (preserves band scale)', () => {
    const scale = buildUnifiedXScale([mpg], 'class', 500, { domain: ['suv', 'compact', 'midsize'] })
    expect(typeof scale.bandwidth).toBe('function') // still band
    expect(scale.domain()).toEqual(['suv', 'compact', 'midsize'])
  })
})

describe('buildUnifiedYScale', () => {
  it('builds scale from 0 to max cty when includeZero (bar chart default)', () => {
    const scale = buildUnifiedYScale([mpg], 'cty', 400, { includeZero: true })
    expect(scale.domain()[0]).toBe(0)
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(28)
  })

  it('builds scale from min to max hwy when not includeZero (scatter/line)', () => {
    const scale = buildUnifiedYScale([mpg], 'hwy', 400, { includeZero: false })
    expect(scale.domain()[0]).toBeGreaterThan(0) // should be ~17, not 0
    expect(scale.domain()[0]).toBeLessThan(20)
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(36)
  })

  it('unions y domain across multiple datasets', () => {
    const ds1 = mpg.filter((r) => r.cty < 20)
    const ds2 = mpg.filter((r) => r.cty >= 20)
    const scale = buildUnifiedYScale([ds1, ds2], 'cty', 400, { includeZero: true })
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(28) // covers both subsets
  })

  it('respects explicit domain override', () => {
    const scale = buildUnifiedYScale([mpg], 'cty', 400, { domain: [10, 40] })
    expect(scale.domain()).toEqual([10, 40])
  })
})

describe('inferFieldType + inferOrientation integration', () => {
  it('x=cty (numeric) + y=class (band) → horizontal (spec Section 10 example)', () => {
    const xType = inferFieldType(mpg, 'cty')
    const yType = inferFieldType(mpg, 'class')
    expect(xType).toBe('continuous')
    expect(yType).toBe('band')
    expect(inferOrientation(xType, yType)).toBe('horizontal')
  })

  it('x=class (band) + y=hwy (continuous) → vertical', () => {
    const xType = inferFieldType(mpg, 'class')
    const yType = inferFieldType(mpg, 'hwy')
    expect(inferOrientation(xType, yType)).toBe('vertical')
  })

  it('x=displ (continuous) + y=hwy (continuous) → none (scatter)', () => {
    const xType = inferFieldType(mpg, 'displ')
    const yType = inferFieldType(mpg, 'hwy')
    expect(inferOrientation(xType, yType)).toBe('none')
  })
})

describe('inferColorScaleType', () => {
  it('returns "categorical" for string color field', () => {
    expect(inferColorScaleType(mpg, 'class', {})).toBe('categorical')
  })

  it('returns "categorical" for string color field (drv)', () => {
    expect(inferColorScaleType(mpg, 'drv', {})).toBe('categorical')
  })

  it('returns "sequential" for numeric color field', () => {
    expect(inferColorScaleType(mpg, 'cty', {})).toBe('sequential')
  })

  it('returns "diverging" when colorMidpoint is set', () => {
    expect(inferColorScaleType(mpg, 'cty', { colorMidpoint: 20 })).toBe('diverging')
  })

  it('respects explicit colorScale override', () => {
    expect(inferColorScaleType(mpg, 'cty', { colorScale: 'categorical' })).toBe('categorical')
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd packages/chart && bun run test spec/plot/scales.spec.js
```

Expected: FAIL — `scales.js` does not exist yet.

- [ ] **Step 3: Implement scales.js**

```js
// packages/chart/src/lib/plot/scales.js
import { scaleBand, scaleLinear } from 'd3-scale'
import { max, extent } from 'd3-array'

/**
 * Infers whether a field is a band (categorical) or continuous (numeric) dimension.
 * @param {Object[]} data
 * @param {string} field
 * @returns {'band'|'continuous'}
 */
export function inferFieldType(data, field) {
  const values = data.map((d) => d[field]).filter((v) => v !== null && v !== undefined)
  if (values.length === 0) return 'band'
  const isNumeric = values.every(
    (v) => typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== '')
  )
  return isNumeric ? 'continuous' : 'band'
}

/**
 * Infers chart orientation from x and y field types.
 * @param {'band'|'continuous'} xType
 * @param {'band'|'continuous'} yType
 * @returns {'vertical'|'horizontal'|'none'}
 */
export function inferOrientation(xType, yType) {
  if (xType === 'band' && yType === 'continuous') return 'vertical'
  if (yType === 'band' && xType === 'continuous') return 'horizontal'
  return 'none'
}

/**
 * Builds a unified x scale from one or more datasets.
 * Band scale for categorical fields, linear for numeric.
 * Unions categories / extends numeric range across all datasets.
 *
 * @param {Object[][]} datasets
 * @param {string} field
 * @param {number} width
 * @param {{ domain?: unknown[], padding?: number, includeZero?: boolean }} opts
 */
export function buildUnifiedXScale(datasets, field, width, opts = {}) {
  const allValues = datasets.flatMap((d) => d.map((r) => r[field]))
  const isNumeric = allValues.every(
    (v) => typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== '')
  )

  if (opts.domain) {
    // Respect explicit domain but preserve scale type based on value types
    const domainIsNumeric = opts.domain.every((v) => typeof v === 'number')
    if (domainIsNumeric || isNumeric) {
      return scaleLinear().domain(opts.domain).range([0, width]).nice()
    }
    // Categorical explicit domain (e.g. reordering: ['suv', 'compact', 'midsize'])
    return scaleBand()
      .domain(opts.domain)
      .range([0, width])
      .padding(opts.padding ?? 0.2)
  }

  if (isNumeric) {
    const numericValues = allValues.map(Number)
    const [minVal, maxVal] = extent(numericValues)
    const domainMin = (opts.includeZero ?? false) ? 0 : (minVal ?? 0)
    return scaleLinear()
      .domain([domainMin, maxVal ?? 0])
      .range([0, width])
      .nice()
  }

  const domain = [...new Set(allValues)].filter((v) => v !== null && v !== undefined)
  return scaleBand()
    .domain(domain)
    .range([0, width])
    .padding(opts.padding ?? 0.2)
}

/**
 * Builds a unified y scale from one or more datasets.
 * Always linear, domain [0, max] unless overridden.
 *
 * @param {Object[][]} datasets
 * @param {string} field
 * @param {number} height
 * @param {{ domain?: [number, number] }} opts
 */
/**
 * Builds a unified y scale from one or more datasets.
 * Domain starts at 0 when includeZero is true (default for bar charts where x is band).
 * Uses extent ([min, max]) when includeZero is false (scatter, line — avoids wasted canvas).
 *
 * @param {Object[][]} datasets
 * @param {string} field
 * @param {number} height
 * @param {{ domain?: [number, number], includeZero?: boolean }} opts
 */
export function buildUnifiedYScale(datasets, field, height, opts = {}) {
  if (opts.domain) {
    return scaleLinear().domain(opts.domain).range([height, 0]).nice()
  }
  const allValues = datasets.flatMap((d) => d.map((r) => Number(r[field]))).filter((v) => !isNaN(v))
  const [minVal, maxVal] = extent(allValues)
  const domainMin = (opts.includeZero ?? true) ? 0 : (minVal ?? 0)
  return scaleLinear()
    .domain([domainMin, maxVal ?? 0])
    .range([height, 0])
    .nice()
}

/**
 * Infers the color scale type from data and spec config.
 * @param {Object[]} data
 * @param {string} field
 * @param {{ colorScale?: string, colorMidpoint?: number }} spec
 * @returns {'categorical'|'sequential'|'diverging'}
 */
export function inferColorScaleType(data, field, spec = {}) {
  if (spec.colorScale) return spec.colorScale
  if (spec.colorMidpoint !== undefined) return 'diverging'
  const type = inferFieldType(data, field)
  return type === 'continuous' ? 'sequential' : 'categorical'
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd packages/chart && bun run test spec/plot/scales.spec.js
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/scales.js packages/chart/spec/plot/scales.spec.js
git commit -m "feat(chart): add unified scale building and orientation inference"
```

---

## Chunk 3: Preset resolver + helpers resolver

### Task 4: Preset resolver

Presets control the ordered colors, patterns, and symbols used for categorical series. Built-in presets: `default`, `accessible`, `print`. Custom presets via `helpers.presets`.

**Files:**

- Create: `packages/chart/src/lib/plot/preset.js`
- Create: `packages/chart/spec/plot/preset.spec.js`

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/plot/preset.spec.js
import { describe, it, expect, vi } from 'vitest'
import { resolvePreset, DEFAULT_PRESET, ACCESSIBLE_PRESET } from '../../src/lib/plot/preset.js'

describe('resolvePreset', () => {
  it('returns default preset when no preset specified', () => {
    const preset = resolvePreset(undefined, {})
    expect(preset.colors).toBeDefined()
    expect(preset.colors.length).toBeGreaterThan(0)
    expect(preset.patterns).toBeDefined()
    expect(preset.symbols).toBeDefined()
  })

  it('returns default preset for "default" name', () => {
    const preset = resolvePreset('default', {})
    expect(preset).toEqual(DEFAULT_PRESET)
  })

  it('returns accessible preset for "accessible" name', () => {
    const preset = resolvePreset('accessible', {})
    expect(preset).toEqual(ACCESSIBLE_PRESET)
    expect(preset.colors.length).toBeGreaterThan(0)
  })

  it('resolves named preset from helpers.presets', () => {
    const brand = { colors: ['#ff0000', '#00ff00'], patterns: ['dots'], symbols: ['circle'] }
    const preset = resolvePreset('brand', { presets: { brand } })
    expect(preset.colors).toEqual(['#ff0000', '#00ff00'])
  })

  it('resolves inline preset from helpers.preset', () => {
    const inline = { colors: ['#aabbcc'], patterns: ['waves'], symbols: ['square'] }
    const preset = resolvePreset(undefined, { preset: inline })
    expect(preset.colors).toEqual(['#aabbcc'])
  })

  it('named preset from helpers overrides helpers.preset', () => {
    const named = { colors: ['#111'], patterns: [], symbols: [] }
    const inline = { colors: ['#222'], patterns: [], symbols: [] }
    const preset = resolvePreset('my-theme', { presets: { 'my-theme': named }, preset: inline })
    expect(preset.colors).toEqual(['#111'])
  })

  it('warns and returns default for unknown named preset', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const preset = resolvePreset('nonexistent', {})
    expect(preset).toEqual(DEFAULT_PRESET)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent'))
    warn.mockRestore()
  })

  it('merges partial preset with defaults (missing fields fall back)', () => {
    const partial = { colors: ['#ff0000'] } // no patterns or symbols
    const preset = resolvePreset(undefined, { preset: partial })
    expect(preset.colors).toEqual(['#ff0000'])
    expect(preset.patterns).toEqual(DEFAULT_PRESET.patterns) // fallback to default
    expect(preset.symbols).toEqual(DEFAULT_PRESET.symbols)
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd packages/chart && bun run test spec/plot/preset.spec.js
```

Expected: FAIL.

- [ ] **Step 3: Implement preset.js**

```js
// packages/chart/src/lib/plot/preset.js
import palette from '../brewing/palette.json'
import { PATTERN_ORDER } from '../brewing/patterns.js'
import { SYMBOL_ORDER } from '../brewing/symbols.js'

/** @typedef {{ colors: string[], patterns: string[], symbols: string[] }} PlotPreset */

export const DEFAULT_PRESET = {
  colors: palette.map((p) => p.shades.light.fill),
  patterns: PATTERN_ORDER,
  symbols: SYMBOL_ORDER
}

// ColorBrewer qualitative Set2 — colorblind-friendly 8-color palette
export const ACCESSIBLE_PRESET = {
  colors: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
  patterns: PATTERN_ORDER,
  symbols: SYMBOL_ORDER
}

// Greyscale + high-contrast patterns for print/PDF
export const PRINT_PRESET = {
  colors: ['#f0f0f0', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
  patterns: [
    'CrossHatch',
    'DiagonalLines',
    'Dots',
    'Brick',
    'Waves',
    'Triangles',
    'HorizontalLines'
  ],
  symbols: SYMBOL_ORDER
}

const BUILT_IN_PRESETS = {
  default: DEFAULT_PRESET,
  accessible: ACCESSIBLE_PRESET,
  print: PRINT_PRESET
}

/**
 * Resolves a preset by name or from helpers.
 * Resolution: named built-in → helpers.presets[name] → helpers.preset (inline) → default.
 * Partial presets are merged with defaults.
 *
 * @param {string|undefined} name
 * @param {import('./types.js').PlotHelpers} helpers
 * @returns {PlotPreset}
 */
export function resolvePreset(name, helpers = {}) {
  let resolved = null

  if (name && BUILT_IN_PRESETS[name]) {
    resolved = BUILT_IN_PRESETS[name]
  } else if (name && helpers?.presets?.[name]) {
    resolved = helpers.presets[name]
  } else if (name) {
    console.warn(
      `[Plot] Unknown preset "${name}" — falling back to default. Add it to helpers.presets to suppress this warning.`
    )
    resolved = DEFAULT_PRESET
  } else if (helpers?.preset) {
    resolved = helpers.preset
  } else {
    resolved = DEFAULT_PRESET
  }

  // Merge with defaults so partial presets work
  return {
    colors: resolved.colors ?? DEFAULT_PRESET.colors,
    patterns: resolved.patterns ?? DEFAULT_PRESET.patterns,
    symbols: resolved.symbols ?? DEFAULT_PRESET.symbols
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd packages/chart && bun run test spec/plot/preset.spec.js
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/preset.js packages/chart/spec/plot/preset.spec.js
git commit -m "feat(chart): add preset resolver with default/accessible/print built-ins"
```

---

### Task 5: Helpers resolver

A unified lookup utility used by PlotState to resolve all helper functions (format, tooltip, geoms, colorScale).

**Files:**

- Create: `packages/chart/src/lib/plot/helpers.js`
- Create: `packages/chart/spec/plot/helpers.spec.js`

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/plot/helpers.spec.js
import { describe, it, expect } from 'vitest'
import { resolveFormat, resolveTooltip, resolveGeom } from '../../src/lib/plot/helpers.js'

describe('resolveFormat', () => {
  it('returns identity formatter when no format defined', () => {
    const fmt = resolveFormat('revenue', {})
    expect(fmt(1234)).toBe('1234')
  })

  it('returns field formatter from helpers.format', () => {
    const helpers = { format: { revenue: (v) => `$${v}` } }
    const fmt = resolveFormat('revenue', helpers)
    expect(fmt(100)).toBe('$100')
  })

  it('returns identity when field not in helpers.format', () => {
    const helpers = { format: { other: (v) => `x${v}` } }
    const fmt = resolveFormat('revenue', helpers)
    expect(fmt(42)).toBe('42')
  })
})

describe('resolveTooltip', () => {
  it('returns null when no tooltip helper defined', () => {
    expect(resolveTooltip({})).toBeNull()
  })

  it('returns tooltip function from helpers', () => {
    const fn = (d) => `${d.name}: ${d.value}`
    const helpers = { tooltip: fn }
    expect(resolveTooltip(helpers)).toBe(fn)
  })
})

describe('resolveGeom', () => {
  it('returns null for unknown geom type with no helpers', () => {
    expect(resolveGeom('hexbin', {})).toBeNull()
  })

  it('returns component from helpers.geoms', () => {
    const FakeComponent = {}
    const helpers = { geoms: { hexbin: FakeComponent } }
    expect(resolveGeom('hexbin', helpers)).toBe(FakeComponent)
  })

  it('returns null for built-in geom names (handled by Plot, not helpers)', () => {
    // Built-in geoms don't need to be in helpers
    expect(resolveGeom('bar', {})).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd packages/chart && bun run test spec/plot/helpers.spec.js
```

Expected: FAIL.

- [ ] **Step 3: Implement helpers.js**

```js
// packages/chart/src/lib/plot/helpers.js

const BUILT_IN_GEOMS = new Set(['bar', 'line', 'area', 'point', 'box', 'violin', 'arc'])

/**
 * Resolves a tick/label formatter for a field.
 * Falls back to String(v) if no formatter defined.
 *
 * @param {string} field
 * @param {import('./types.js').PlotHelpers} helpers
 * @returns {(v: unknown) => string}
 */
export function resolveFormat(field, helpers = {}) {
  return helpers?.format?.[field] ?? ((v) => String(v))
}

/**
 * Returns the tooltip render function from helpers, or null if not defined.
 *
 * @param {import('./types.js').PlotHelpers} helpers
 * @returns {((d: Record<string, unknown>) => string) | null}
 */
export function resolveTooltip(helpers = {}) {
  return helpers?.tooltip ?? null
}

/**
 * Resolves a custom geom component from helpers.geoms.
 * Returns null for built-in geom names and for unknown names with no helpers entry.
 *
 * @param {string} type
 * @param {import('./types.js').PlotHelpers} helpers
 * @returns {unknown | null}  Svelte component or null
 */
export function resolveGeom(type, helpers = {}) {
  if (BUILT_IN_GEOMS.has(type)) return null
  return helpers?.geoms?.[type] ?? null
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd packages/chart && bun run test spec/plot/helpers.spec.js
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/helpers.js packages/chart/spec/plot/helpers.spec.js
git commit -m "feat(chart): add helpers resolver for format, tooltip, and custom geoms"
```

---

## Chunk 4: PlotState reactive class

### Task 6: PlotState

The central reactive class. Registers geoms, runs stat transforms, builds unified scales, resolves colors/labels. Consumed via Svelte context by all child components.

**Files:**

- Create: `packages/chart/src/PlotState.svelte.js`
- Create: `packages/chart/spec/PlotState.spec.js`

Note: `PlotState.svelte.js` uses Svelte 5 `$state`/`$derived` runes. Tests run via vitest with the Svelte plugin (already configured in this repo — see existing `spec/brewing/brewer.spec.js` for the pattern).

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/PlotState.spec.js
import { describe, it, expect, vi } from 'vitest'
import mpg from '../src/fixtures/mpg.json'
import { PlotState } from '../src/PlotState.svelte.js'

describe('PlotState — label resolution', () => {
  it('returns field name when no labels defined', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' }, labels: {} })
    expect(state.label('class')).toBe('class')
    expect(state.label('cty')).toBe('cty')
  })

  it('returns display label when defined', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'class', y: 'cty' },
      labels: { cty: 'City MPG', class: 'Vehicle Class' }
    })
    expect(state.label('cty')).toBe('City MPG')
    expect(state.label('class')).toBe('Vehicle Class')
  })
})

describe('PlotState — geom registration and stat', () => {
  it('registerGeom stores a geom config', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    const id = state.registerGeom({
      type: 'bar',
      channels: { x: 'class', y: 'cty' },
      stat: 'identity'
    })
    expect(typeof id).toBe('string')
  })

  it('geomData returns post-stat rows for registered geom (identity)', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    const id = state.registerGeom({
      type: 'bar',
      channels: { x: 'class', y: 'cty' },
      stat: 'identity'
    })
    const rows = state.geomData(id)
    expect(rows).toBe(mpg)
  })

  it('geomData returns aggregated rows for stat=sum', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'sum' })
    const rows = state.geomData(id)
    // mpg has 7 classes — should produce 7 aggregated rows
    expect(rows.length).toBeLessThan(mpg.length)
    expect(rows[0]).toHaveProperty('class')
    expect(rows[0]).toHaveProperty('cty')
  })

  it('geomData with stat=mean produces correct average', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'hwy' } })
    const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'hwy' }, stat: 'mean' })
    const rows = state.geomData(id)
    const compact = rows.find((r) => r.class === 'compact')
    const expectedMean =
      mpg.filter((r) => r.class === 'compact').reduce((a, r) => a + r.hwy, 0) /
      mpg.filter((r) => r.class === 'compact').length
    expect(compact.hwy).toBeCloseTo(expectedMean)
  })
})

describe('PlotState — color scale type inference', () => {
  it('infers categorical for string color field', () => {
    const state = new PlotState({ data: mpg, channels: { color: 'class' } })
    expect(state.colorScaleType).toBe('categorical')
  })

  it('infers sequential for numeric color field', () => {
    const state = new PlotState({ data: mpg, channels: { color: 'cty' } })
    expect(state.colorScaleType).toBe('sequential')
  })

  it('infers diverging when colorMidpoint set', () => {
    const state = new PlotState({ data: mpg, channels: { color: 'cty' }, colorMidpoint: 20 })
    expect(state.colorScaleType).toBe('diverging')
  })
})

describe('PlotState — orientation inference', () => {
  it('infers vertical when x is categorical (class)', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'class', y: 'cty' },
      width: 600,
      height: 400
    })
    state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
    expect(state.orientation).toBe('vertical')
  })

  it('infers horizontal when y is categorical', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'cty', y: 'class' },
      width: 600,
      height: 400
    })
    state.registerGeom({ type: 'bar', channels: { x: 'cty', y: 'class' }, stat: 'mean' })
    expect(state.orientation).toBe('horizontal')
  })

  it('infers none for scatter (both continuous)', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'cty', y: 'hwy' },
      width: 600,
      height: 400
    })
    state.registerGeom({ type: 'point', channels: { x: 'cty', y: 'hwy' }, stat: 'identity' })
    expect(state.orientation).toBe('none')
  })
})

describe('PlotState — scale domain includes zero for bar charts', () => {
  it('yScale starts at 0 for vertical bar chart', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'class', y: 'cty' },
      width: 600,
      height: 400
    })
    state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
    expect(state.yScale.domain()[0]).toBe(0)
  })

  it('xScale starts at 0 for horizontal bar chart', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'cty', y: 'class' },
      width: 600,
      height: 400
    })
    state.registerGeom({ type: 'bar', channels: { x: 'cty', y: 'class' }, stat: 'mean' })
    expect(state.xScale.domain()[0]).toBe(0)
  })

  it('yScale does NOT start at 0 for scatter (extent domain)', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'displ', y: 'hwy' },
      width: 600,
      height: 400
    })
    state.registerGeom({ type: 'point', channels: { x: 'displ', y: 'hwy' }, stat: 'identity' })
    expect(state.yScale.domain()[0]).toBeGreaterThan(0) // hwy min is ~17, not 0
  })
})

describe('PlotState — axisOrigin', () => {
  it('axisOrigin defaults to [undefined, undefined]', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    expect(state.axisOrigin).toEqual([undefined, undefined])
  })

  it('xAxisY returns innerHeight when no yScale', () => {
    const state = new PlotState({ data: mpg, channels: {}, width: 600, height: 400 })
    expect(state.xAxisY).toBe(state.innerHeight)
  })

  it('axisOrigin can be set for quadrant mode', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'displ', y: 'hwy' },
      width: 600,
      height: 400
    })
    state.registerGeom({ type: 'point', channels: { x: 'displ', y: 'hwy' }, stat: 'identity' })
    state.axisOrigin = [0, 0]
    // xAxisY should now be at yScale(0), not at chart bottom
    const atZero = state.yScale(0)
    expect(state.xAxisY).toBe(atZero)
  })
})

describe('PlotState — preset from spec config', () => {
  it('resolves preset by name from config.preset', () => {
    const brandPreset = { colors: ['#ff0000'], patterns: [], symbols: [] }
    const state = new PlotState({
      data: mpg,
      channels: {},
      preset: 'brand',
      helpers: { presets: { brand: brandPreset } }
    })
    expect(state.preset().colors).toEqual(['#ff0000'])
  })

  it('returns default preset when no preset in config', () => {
    const state = new PlotState({ data: mpg, channels: {} })
    expect(state.preset().colors.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd packages/chart && bun run test spec/PlotState.spec.js
```

Expected: FAIL.

- [ ] **Step 3: Implement PlotState.svelte.js**

```js
// packages/chart/src/PlotState.svelte.js
import { applyGeomStat } from './lib/plot/stat.js'
import {
  inferFieldType,
  inferOrientation,
  buildUnifiedXScale,
  buildUnifiedYScale,
  inferColorScaleType
} from './lib/plot/scales.js'
import { resolvePreset } from './lib/plot/preset.js'
import { resolveFormat, resolveTooltip, resolveGeom } from './lib/plot/helpers.js'

let nextId = 0

export class PlotState {
  // Config — all $state so mutations trigger reactive updates
  #data = $state([])
  #channels = $state({})
  #labels = $state({})
  #helpers = $state({})
  #presetName = $state(undefined) // string name from PlotSpec.preset
  #colorMidpoint = $state(undefined)
  #colorSpec = $state(undefined) // colorScale override from spec
  #xDomain = $state(undefined)
  #yDomain = $state(undefined)
  #width = $state(600)
  #height = $state(400)
  #margin = $state({ top: 20, right: 20, bottom: 40, left: 50 })

  // Registered geoms
  #geoms = $state([])

  // Axis crossing points — default undefined means edge-pinned (axis at domain min)
  // Set to [0, 0] for quadrant mode
  axisOrigin = $state([undefined, undefined])

  // --- Derived reactive properties ---
  // IMPORTANT: These MUST be $derived (not plain getters) so Svelte templates
  // re-render when #data, #channels, or #geoms change.

  #innerWidth = $derived(this.#width - this.#margin.left - this.#margin.right)
  #innerHeight = $derived(this.#height - this.#margin.top - this.#margin.bottom)

  orientation = $derived.by(() => {
    const xField = this.#channels.x
    const yField = this.#channels.y
    if (!xField || !yField) return 'none'
    const xType = inferFieldType(this.#data, xField)
    const yType = inferFieldType(this.#data, yField)
    return inferOrientation(xType, yType)
  })

  colorScaleType = $derived.by(() => {
    const field = this.#channels.color
    if (!field) return 'categorical'
    return inferColorScaleType(this.#data, field, {
      colorScale: this.#colorSpec,
      colorMidpoint: this.#colorMidpoint
    })
  })

  xScale = $derived.by(() => {
    const field = this.#channels.x
    if (!field) return null
    const datasets =
      this.#geoms.length > 0 ? this.#geoms.map((g) => this.geomData(g.id)) : [this.#data]
    // Horizontal bars: x carries the value axis → pin to 0
    const includeZero = this.orientation === 'horizontal'
    return buildUnifiedXScale(datasets, field, this.#innerWidth, {
      domain: this.#xDomain,
      includeZero
    })
  })

  yScale = $derived.by(() => {
    const field = this.#channels.y
    if (!field) return null
    const datasets =
      this.#geoms.length > 0 ? this.#geoms.map((g) => this.geomData(g.id)) : [this.#data]
    // Vertical bars: y carries the value axis → pin to 0
    const includeZero = this.orientation === 'vertical'
    return buildUnifiedYScale(datasets, field, this.#innerHeight, {
      domain: this.#yDomain,
      includeZero
    })
  })

  // Axis crossing positions (edge-pinned by default; [0,0] for quadrant mode)
  xAxisY = $derived.by(() => {
    if (!this.yScale || typeof this.yScale !== 'function') return this.#innerHeight
    const crossVal = this.axisOrigin[1]
    if (crossVal !== undefined) return this.yScale(crossVal)
    // Edge-pin: axis at the bottom (domain min of yScale)
    const domain = this.yScale.domain?.()
    return domain ? this.yScale(domain[0]) : this.#innerHeight
  })

  yAxisX = $derived.by(() => {
    if (!this.xScale || typeof this.xScale !== 'function') return 0
    const crossVal = this.axisOrigin[0]
    if (crossVal !== undefined) return this.xScale(crossVal)
    const domain = this.xScale.domain?.()
    return domain ? this.xScale(domain[0]) : 0
  })

  constructor(config = {}) {
    this.#data = config.data ?? []
    this.#channels = config.channels ?? {}
    this.#labels = config.labels ?? {}
    this.#helpers = config.helpers ?? {}
    this.#presetName = config.preset // string from PlotSpec.preset
    this.#colorMidpoint = config.colorMidpoint
    this.#colorSpec = config.colorScale
    this.#xDomain = config.xDomain
    this.#yDomain = config.yDomain
    this.#width = config.width ?? 600
    this.#height = config.height ?? 400
  }

  update(config) {
    if (config.data !== undefined) this.#data = config.data
    if (config.channels !== undefined) this.#channels = config.channels
    if (config.labels !== undefined) this.#labels = config.labels
    if (config.helpers !== undefined) this.#helpers = config.helpers
    if (config.preset !== undefined) this.#presetName = config.preset
    if (config.colorMidpoint !== undefined) this.#colorMidpoint = config.colorMidpoint
    if (config.colorScale !== undefined) this.#colorSpec = config.colorScale
    if (config.xDomain !== undefined) this.#xDomain = config.xDomain
    if (config.yDomain !== undefined) this.#yDomain = config.yDomain
    if (config.width !== undefined) this.#width = config.width
    if (config.height !== undefined) this.#height = config.height
  }

  // --- Geom registration ---

  registerGeom(config) {
    const id = `geom-${nextId++}`
    this.#geoms = [...this.#geoms, { id, ...config }]
    return id
  }

  unregisterGeom(id) {
    this.#geoms = this.#geoms.filter((g) => g.id !== id)
  }

  // --- Post-stat data per geom ---

  geomData(id) {
    const geom = this.#geoms.find((g) => g.id === id)
    if (!geom) return []
    const mergedChannels = { ...this.#channels, ...geom.channels }
    return applyGeomStat(
      this.#data,
      { stat: geom.stat ?? 'identity', channels: mergedChannels },
      this.#helpers
    )
  }

  // --- Labels ---

  label(field) {
    return this.#labels?.[field] ?? field
  }

  // --- Helpers ---

  format(field) {
    return resolveFormat(field, this.#helpers)
  }
  tooltip() {
    return resolveTooltip(this.#helpers)
  }
  geomComponent(type) {
    return resolveGeom(type, this.#helpers)
  }
  preset() {
    return resolvePreset(this.#presetName, this.#helpers)
  }

  // --- Dimensions (for child components) ---

  get margin() {
    return this.#margin
  }
  get innerWidth() {
    return this.#innerWidth
  }
  get innerHeight() {
    return this.#innerHeight
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
cd packages/chart && bun run test spec/PlotState.spec.js
```

Expected: all tests PASS.

- [ ] **Step 5: Run all chart tests to check for regressions**

```bash
cd packages/chart && bun run test
```

Expected: all existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/PlotState.svelte.js packages/chart/spec/PlotState.spec.js
git commit -m "feat(chart): add PlotState reactive class — stat pipeline, unified scales, orientation"
```

---

## Chunk 5: Types + exports

### Task 7: PlotSpec types and barrel export

Document the public types and add PlotState to the package exports. No runtime logic — types only.

**Files:**

- Create: `packages/chart/src/lib/plot/types.js` (JSDoc typedef file)
- Modify: `packages/chart/src/index.js`

- [ ] **Step 1: Create types.js**

```js
// packages/chart/src/lib/plot/types.js
// JSDoc typedefs for the Plot system. No runtime code.

/**
 * @typedef {Object} GeomSpec
 * @property {string} type - Geom type: 'bar'|'line'|'area'|'point'|'box'|'violin'|'arc' or custom
 * @property {string} [x]
 * @property {string} [y]
 * @property {string} [color]
 * @property {string} [fill]
 * @property {string} [size]
 * @property {string} [symbol]
 * @property {string} [pattern]
 * @property {string} [stat] - Built-in or helpers.stats key
 * @property {Record<string, unknown>} [options]
 */

/**
 * @typedef {Object} PlotSpec
 * @property {Record<string, unknown>[]} data
 * @property {string} [x]
 * @property {string} [y]
 * @property {string} [color]
 * @property {string} [fill]
 * @property {string} [size]
 * @property {string} [symbol]
 * @property {string} [pattern]
 * @property {string} [theta]
 * @property {Record<string, string>} [labels]
 * @property {unknown[]} [xDomain]
 * @property {number[]} [yDomain]
 * @property {string} [xLabel]
 * @property {string} [yLabel]
 * @property {[number, number]} [axisOrigin]
 * @property {'categorical'|'sequential'|'diverging'} [colorScale]
 * @property {string} [colorScheme]
 * @property {number} [colorMidpoint]
 * @property {unknown[]} [colorDomain]
 * @property {GeomSpec[]} geoms
 * @property {{ by: string, cols?: number, scales?: 'fixed'|'free'|'free_x'|'free_y' }} [facet]
 * @property {{ by: string, duration?: number, loop?: boolean }} [animate]
 * @property {boolean} [grid]
 * @property {boolean} [legend]
 * @property {boolean} [tooltip]
 * @property {string} [title]
 * @property {string} [preset]
 * @property {number} [width]
 * @property {number} [height]
 * @property {'light'|'dark'} [mode]
 */

/**
 * @typedef {Object} PlotHelpers
 * @property {Record<string, (values: unknown[]) => unknown>} [stats]
 * @property {Record<string, (v: unknown) => string>} [format]
 * @property {(d: Record<string, unknown>) => string} [tooltip]
 * @property {Record<string, unknown>} [geoms]  Svelte components keyed by type name
 * @property {unknown} [colorScale]  d3 scale override
 * @property {{ colors: string[], patterns: string[], symbols: string[] }} [preset]
 * @property {Record<string, { colors: string[], patterns: string[], symbols: string[] }>} [presets]
 * @property {Record<string, unknown>} [patterns]  custom SVG pattern components keyed by name
 * @property {Record<string, unknown>} [symbols]   custom symbol shape components keyed by name
 */

export {}
```

- [ ] **Step 2: Add PlotState to package exports**

In `packages/chart/src/index.js`, add:

```js
export { PlotState } from './PlotState.svelte.js'
```

Find the existing exports block and append. Do not remove any existing exports.

- [ ] **Step 3: Verify build still works**

```bash
cd packages/chart && bun run build 2>&1 | tail -5
```

Expected: build succeeds with no errors.

- [ ] **Step 4: Run full test suite**

```bash
cd packages/chart && bun run test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/types.js packages/chart/src/index.js
git commit -m "feat(chart): add PlotSpec/PlotHelpers typedefs and export PlotState"
```

---

## Final verification

- [ ] **Run full monorepo tests**

```bash
bun run test:ci
```

Expected: all tests pass, zero errors.

- [ ] **Run lint**

```bash
bun run lint
```

Expected: zero errors (warnings are pre-existing and acceptable).

- [ ] **Final commit if needed**

```bash
git add -p
git commit -m "feat(chart): Plot foundation complete — PlotState, stat, scales, presets, helpers"
```
