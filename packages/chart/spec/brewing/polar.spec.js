import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
	resolveAxes,
	anglesFor,
	domainsFor,
	radiusFor,
	resolveRadiusTransform,
	verticesFor,
	ringsFor,
	zeroRingFor,
	buildRadarLayout
} from '../../src/lib/brewing/polar.js'

// Vitest runs from the repo root; the jsdom env sets import.meta.url to a
// non-file: URL, so resolve against cwd rather than the module URL (see
// packages/icons/spec/exports.spec.js for the same pattern).
const polarSourcePath = join(process.cwd(), 'packages/chart/src/lib/brewing/polar.js')

const rows = [
	{ m: 'a', v: 1 },
	{ m: 'b', v: 2 },
	{ m: 'c', v: 3 }
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

	it('appends unit to the display label when given', () => {
		const [out] = resolveAxes([{ key: 'a', label: 'Latency', unit: 'ms' }], rows, 'm')
		expect(out.displayLabel).toBe('Latency (ms)')
	})

	it('leaves displayLabel as the label when no unit is given', () => {
		const [out] = resolveAxes([{ key: 'a', label: 'Alpha' }], rows, 'm')
		expect(out.displayLabel).toBe('Alpha')
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
		resolveAxes(['a', 'b', 'c'], rows, 'm')
		expect(warn).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it('keeps a declared axis that is absent from the data', () => {
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

	it('returns [] for empty data and no axes', () => {
		expect(resolveAxes(undefined, [], 'm')).toEqual([])
	})
})

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
		expect(near(anglesFor([7, 2, 9, 1])[0], -90)).toBe(true)
	})

	it('spaces midpoints by the half-sum of adjacent wedges', () => {
		// w=[2,1,1] over 360 => wedges 180/90/90
		const a = anglesFor([2, 1, 1])
		expect(near(a[1] - a[0], 135)).toBe(true) // (180 + 90) / 2
		expect(near(a[2] - a[1], 90)).toBe(true) //  (90 + 90) / 2
	})

	it('treats a zero, negative or non-finite weight as 1', () => {
		expect(anglesFor([1, 0, 1])).toEqual(anglesFor([1, 1, 1]))
		expect(anglesFor([1, -3, 1])).toEqual(anglesFor([1, 1, 1]))
		expect(anglesFor([1, NaN, 1])).toEqual(anglesFor([1, 1, 1]))
	})

	it('returns a single axis at the top', () => {
		expect(anglesFor([1]).map((x) => Math.round(x))).toEqual([-90])
	})

	it('returns [] for no axes', () => {
		expect(anglesFor([])).toEqual([])
	})
})

describe('domainsFor', () => {
	// `x` names the axis field, `y` the value field — the same channel convention
	// buildLines/GeomState use, not a radar-specific one.
	const channels = { x: 'm', y: 'v' }

	it('returns a declared domain verbatim even when the data max is lower', () => {
		const data = [
			{ m: 'a', v: 1 },
			{ m: 'a', v: 3 }
		]
		const axes = resolveAxes([{ key: 'a', domain: [0, 5] }], data, 'm')
		expect(domainsFor(axes, data, channels)).toEqual([[0, 5]])
	})

	it('returns a declared domain verbatim even when data exceeds it (out-of-domain values are the caller/renderer problem, not domainsFor\'s)', () => {
		const data = [{ m: 'a', v: 100 }]
		const axes = resolveAxes([{ key: 'a', domain: [0, 5] }], data, 'm')
		expect(domainsFor(axes, data, channels)).toEqual([[0, 5]])
	})

	it('infers [0, max] for non-negative data with no declared domain', () => {
		const data = [
			{ m: 'a', v: 2 },
			{ m: 'a', v: 5 },
			{ m: 'a', v: 3 }
		]
		const axes = resolveAxes(['a'], data, 'm')
		expect(domainsFor(axes, data, channels)).toEqual([[0, 5]])
	})

	it('infers [min, max] — NOT [0, max] — when an axis contains a negative', () => {
		const data = [
			{ m: 'a', v: -2 },
			{ m: 'a', v: 5 },
			{ m: 'a', v: 3 }
		]
		const axes = resolveAxes(['a'], data, 'm')
		const result = domainsFor(axes, data, channels)
		expect(result).toEqual([[-2, 5]])
		expect(result).not.toEqual([[0, 5]])
	})

	it('sharedDomain gives one domain across all axes, differing from the per-axis result', () => {
		const data = [
			{ m: 'p', v: 1 },
			{ m: 'p', v: 2 },
			{ m: 'q', v: 10 },
			{ m: 'q', v: 20 }
		]
		const axes = resolveAxes(['p', 'q'], data, 'm')
		expect(domainsFor(axes, data, channels)).toEqual([
			[0, 2],
			[0, 20]
		])
		expect(domainsFor(axes, data, channels, { sharedDomain: true })).toEqual([
			[0, 20],
			[0, 20]
		])
	})

	it('sharedDomain applies negatives-extend globally, even to an axis whose own data is all non-negative', () => {
		const data = [
			{ m: 'p', v: -4 },
			{ m: 'p', v: 3 },
			{ m: 'q', v: 2 },
			{ m: 'q', v: 6 }
		]
		const axes = resolveAxes(['p', 'q'], data, 'm')
		// q's own data never goes negative, so its per-axis domain would be [0, 6]...
		expect(domainsFor(axes, data, channels)).toEqual([
			[-4, 3],
			[0, 6]
		])
		// ...but under sharedDomain it is extended down to the global min of -4.
		expect(domainsFor(axes, data, channels, { sharedDomain: true })).toEqual([
			[-4, 6],
			[-4, 6]
		])
	})

	it('a declared domain still wins per-axis when sharedDomain is on', () => {
		const data = [
			{ m: 'p', v: 100 },
			{ m: 'q', v: 10 },
			{ m: 'q', v: 50 }
		]
		const axes = resolveAxes([{ key: 'p', domain: [0, 5] }, 'q'], data, 'm')
		const result = domainsFor(axes, data, channels, { sharedDomain: true })
		// p keeps its declared domain rather than the shared [0, 100]...
		expect(result[0]).toEqual([0, 5])
		// ...while q (undeclared) takes the shared domain, which is wider than q's own
		// per-axis inferred domain of [0, 50] would have been — proving sharedDomain is
		// actually being applied to it, not just coincidentally equal.
		expect(result[1]).toEqual([0, 100])
	})

	it('STABILITY: a declared domain is identical whether or not a much-larger comparator series is present; an inferred domain is not', () => {
		const seriesA = [
			{ m: 'a', series: 'A', v: 3 },
			{ m: 'b', series: 'A', v: 4 }
		]
		const seriesB = [
			{ m: 'a', series: 'B', v: 1000 },
			{ m: 'b', series: 'B', v: 2000 }
		]
		const combined = [...seriesA, ...seriesB]

		const declaredAxes = resolveAxes(
			[
				{ key: 'a', domain: [0, 10] },
				{ key: 'b', domain: [0, 10] }
			],
			seriesA,
			'm'
		)
		const declaredAlone = domainsFor(declaredAxes, seriesA, channels)
		const declaredWithComparator = domainsFor(declaredAxes, combined, channels)
		expect(declaredAlone).toEqual([
			[0, 10],
			[0, 10]
		])
		expect(declaredWithComparator).toEqual(declaredAlone)

		const inferredAxes = resolveAxes(['a', 'b'], seriesA, 'm')
		const inferredAlone = domainsFor(inferredAxes, seriesA, channels)
		const inferredWithComparator = domainsFor(inferredAxes, combined, channels)
		expect(inferredAlone).toEqual([
			[0, 3],
			[0, 4]
		])
		expect(inferredWithComparator).toEqual([
			[0, 1000],
			[0, 2000]
		])
		expect(inferredWithComparator).not.toEqual(inferredAlone)
	})

	it('filters non-finite values (a string or missing field) instead of letting them poison the domain to NaN', () => {
		const data = [{ m: 'a', v: 'oops' }, { m: 'a' }, { m: 'a', v: 5 }]
		const axes = resolveAxes(['a'], data, 'm')
		const result = domainsFor(axes, data, channels)
		expect(result).toEqual([[0, 5]])
		expect(result[0].every((n) => Number.isFinite(n))).toBe(true)
	})

	it('ignores a row whose axis value names no axis in `axes` at all', () => {
		const data = [
			{ m: 'a', v: 5 },
			{ m: 'unrelated-axis-not-in-axes', v: 999 }
		]
		const axes = resolveAxes(['a'], data, 'm')
		expect(domainsFor(axes, data, channels)).toEqual([[0, 5]])
	})

	it('gives a finite, degenerate domain to a declared axis that is absent from the data', () => {
		const data = [{ m: 'a', v: 1 }]
		const axes = resolveAxes(['a', 'zzz'], data, 'm')
		const result = domainsFor(axes, data, channels)
		expect(result).toHaveLength(2)
		expect(result[1]).toEqual([0, 0])
		expect(result[1].every((n) => Number.isFinite(n))).toBe(true)
	})
})

describe('radiusFor', () => {
	it('linear matches R * (v - min) / (max - min) exactly', () => {
		// domain [0, 20], v=5 => ratio 0.25 => 12.5, an exact value (no float noise to hide behind)
		expect(radiusFor(5, [0, 20], 50, 'linear')).toBe(12.5)
	})

	it('centres on domain.min, NOT zero: on [-5, 10] v=0 sits at R*5/15, not the middle', () => {
		const result = radiusFor(0, [-5, 10], 100, 'linear')
		// R * (0 - -5) / (10 - -5) = 100 * 5/15 = 33.33...
		expect(result).toBeCloseTo(100 / 3, 10)
		// the naive "centre = 0" reading would put this at R * (10-0)/(10-(-5)) = 66.67, and a
		// true geometric centre would be exactly R/2 = 50 — assert neither of those, since a test
		// that merely avoided one wrong number could still be passing under another one.
		expect(result).not.toBeCloseTo(50, 5)
		expect(result).not.toBeCloseTo((100 * 10) / 15, 5)
	})

	it('sqrt matches R * sqrt((v - min) / (max - min)) exactly', () => {
		// domain [0, 16], v=4 => ratio 0.25 => sqrt 0.5 => 5, again an exact value
		expect(radiusFor(4, [0, 16], 10, 'sqrt')).toBe(5)
	})

	it('linear and sqrt give different radii for the same input', () => {
		const linear = radiusFor(4, [0, 16], 10, 'linear')
		const sqrt = radiusFor(4, [0, 16], 10, 'sqrt')
		expect(linear).toBe(2.5)
		expect(sqrt).toBe(5)
		expect(linear).not.toBe(sqrt)
	})

	it('a zero-width domain does not divide by zero — resolves to the centre, 0', () => {
		const linear = radiusFor(7, [7, 7], 100, 'linear')
		const sqrt = radiusFor(7, [7, 7], 100, 'sqrt')
		expect(linear).toBe(0)
		expect(sqrt).toBe(0)
		expect(Number.isNaN(linear)).toBe(false)
		expect(Number.isNaN(sqrt)).toBe(false)
	})

	it('a non-finite value does not yield NaN — returns null instead', () => {
		expect(radiusFor(NaN, [0, 10], 100, 'linear')).toBe(null)
		expect(radiusFor(Infinity, [0, 10], 100, 'sqrt')).toBe(null)
		expect(radiusFor(-Infinity, [0, 10], 100, 'linear')).toBe(null)
	})

	it('a finite out-of-domain value is clamped rather than producing NaN or overshoot', () => {
		// below min: ratio would be negative, which is fatal to sqrt (no real root) — clamps to 0
		expect(radiusFor(-5, [0, 10], 100, 'sqrt')).toBe(0)
		expect(radiusFor(-5, [0, 10], 100, 'linear')).toBe(0)
		// above max: ratio would exceed 1 — clamps to R
		expect(radiusFor(15, [0, 10], 100, 'sqrt')).toBe(100)
		expect(radiusFor(15, [0, 10], 100, 'linear')).toBe(100)
	})
})

describe('resolveRadiusTransform', () => {
	it("auto picks 'linear' when all weights are equal", () => {
		expect(resolveRadiusTransform([1, 1, 1], 'auto')).toBe('linear')
	})

	it("auto picks 'sqrt' when any weight differs", () => {
		expect(resolveRadiusTransform([2, 1, 1], 'auto')).toBe('sqrt')
	})

	it("defaults to 'auto' when requested is omitted", () => {
		expect(resolveRadiusTransform([1, 1, 1])).toBe('linear')
		expect(resolveRadiusTransform([2, 1, 1])).toBe('sqrt')
	})

	it('an explicit linear overrides auto even with unequal weights', () => {
		expect(resolveRadiusTransform([2, 1, 1], 'linear')).toBe('linear')
	})

	it('an explicit sqrt overrides auto even with equal weights', () => {
		expect(resolveRadiusTransform([1, 1, 1], 'sqrt')).toBe('sqrt')
	})

	it('normalises non-positive/non-finite weights like anglesFor before comparing them', () => {
		// 0, negative and NaN all coerce to 1 in anglesFor, so [1, 0, 1] draws 3 equal wedges —
		// resolveRadiusTransform must agree, or its choice would contradict the shape actually drawn.
		expect(resolveRadiusTransform([1, 0, 1], 'auto')).toBe('linear')
		expect(resolveRadiusTransform([1, -3, 1], 'auto')).toBe('linear')
		expect(resolveRadiusTransform([1, NaN, 1], 'auto')).toBe('linear')
	})
})

describe('radiusFor + anglesFor: area proportionality (the whole justification for sqrt)', () => {
	it('under sqrt, wedge area (1/2 * theta * r^2) is proportional to weight * value', () => {
		// Three axes so wedge widths are actually recoverable from anglesFor's midpoints: with
		// only 2 axes the two wedges are complementary and their midpoints are ALWAYS 180 degrees
		// apart regardless of the weight split, so the split ratio can't be read back out. With 3+
		// axes, the "spaces midpoints by the half-sum of adjacent wedges" relationship (asserted
		// above in the anglesFor suite) is invertible, so we solve it here rather than hardcode
		// 360*weight/total ourselves.
		const weights = [2, 1, 1]
		const a = anglesFor(weights)
		expect(a).toHaveLength(3)

		const g1 = a[1] - a[0] // (x0 + x1) / 2
		const g2 = a[2] - a[1] // (x1 + x2) / 2
		const g3 = 360 - (a[2] - a[0]) // (x2 + x0) / 2, wrapping back to axis 0
		const x0 = g1 + g3 - g2 // wedge width (degrees) for the weight-2 axis
		const x1 = g1 + g2 - g3 // wedge width (degrees) for the first weight-1 axis

		expect(x0).toBeCloseTo(180, 9) // sanity: matches 360 * 2/4
		expect(x1).toBeCloseTo(90, 9) //  sanity: matches 360 * 1/4

		// Weights are unequal, so this is exactly the case the whole feature exists for: derive
		// the transform through resolveRadiusTransform's 'auto' path (as a real Radar geom would)
		// rather than hardcoding 'sqrt' — that ties this test to the actual selection logic, not
		// just to radiusFor's sqrt branch in isolation.
		const transform = resolveRadiusTransform(weights, 'auto')
		expect(transform).toBe('sqrt')

		// Same domain/R for both axes so those factors cancel in the ratio, isolating weight*value.
		const domain = [0, 10]
		const R = 100
		const v0 = 8 // on the weight-2 axis
		const v1 = 4 // on a weight-1 axis

		const r0 = radiusFor(v0, domain, R, transform)
		const r1 = radiusFor(v1, domain, R, transform)

		const area0 = 0.5 * (x0 * (Math.PI / 180)) * r0 ** 2
		const area1 = 0.5 * (x1 * (Math.PI / 180)) * r1 ** 2

		const areaRatio = area0 / area1
		const weightValueRatio = (weights[0] * v0) / (weights[1] * v1)

		expect(areaRatio).toBeCloseTo(weightValueRatio, 9)
		// pin the actual numbers too, not just their ratio, so a coincidental ratio match on
		// wrong absolute areas can't sneak this test through
		expect(area0).toBeCloseTo(4000 * Math.PI, 6)
		expect(area1).toBeCloseTo(1000 * Math.PI, 6)
		expect(weightValueRatio).toBe(4)
	})

	it('under linear (equal weights, no sqrt), area is NOT proportional to weight * value the same way', () => {
		// Control case: equal weights => 'auto' picks linear => no compensation applied, so the
		// sqrt branch's proportionality claim is specific to sqrt, not an accident of the area
		// formula. With equal weights and unequal values, area ratio should track value^2, not value.
		const weights = [1, 1]
		const domain = [0, 10]
		const R = 100
		const v0 = 8
		const v1 = 4

		const transform = resolveRadiusTransform(weights, 'auto')
		expect(transform).toBe('linear')

		const r0 = radiusFor(v0, domain, R, transform)
		const r1 = radiusFor(v1, domain, R, transform)
		// equal weights => equal wedge widths => they cancel in the ratio regardless of their value
		const areaRatio = r0 ** 2 / r1 ** 2
		const valueRatio = v0 / v1
		const valueSquaredRatio = (v0 / v1) ** 2

		expect(areaRatio).toBeCloseTo(valueSquaredRatio, 9)
		expect(areaRatio).not.toBeCloseTo(valueRatio, 5)
	})
})

describe('verticesFor', () => {
	// `color` carries the series field, mirroring `fill ?? color`'s role as the series
	// channel in every other geom (Point/Bar/Area) — Radar's channel mapping is
	// `{ x: axis, y: value, color: series }`.
	const channels = { x: 'm', y: 'v', color: 's' }

	it('one series across three axes yields three vertices, in axis order', () => {
		const data = [
			{ s: 'A', m: 'a', v: 1 },
			{ s: 'A', m: 'b', v: 2 },
			{ s: 'A', m: 'c', v: 3 }
		]
		const axes = resolveAxes(['a', 'b', 'c'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const result = verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		const vertices = result.get('A')

		expect(vertices).toHaveLength(3)
		expect(vertices.every((v) => v !== null)).toBe(true)
		expect(vertices.map((v) => v.axisKey)).toEqual(['a', 'b', 'c'])
	})

	it("each vertex's angle and radius match anglesFor/radiusFor for that axis", () => {
		const data = [
			{ s: 'A', m: 'a', v: 1 },
			{ s: 'A', m: 'b', v: 2 },
			{ s: 'A', m: 'c', v: 3 }
		]
		const axes = resolveAxes(['a', 'b', 'c'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const result = verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		const vertices = result.get('A')

		expect(vertices).toHaveLength(3)
		vertices.forEach((vertex, i) => {
			expect(vertex.angle).toBe(angles[i])
			expect(vertex.radius).toBe(radiusFor(vertex.value, domains[i], 100, 'linear'))
		})
	})

	it('two series yield two independent vertex lists, keyed by series value', () => {
		const data = [
			{ s: 'A', m: 'a', v: 1 },
			{ s: 'A', m: 'b', v: 2 },
			{ s: 'B', m: 'a', v: 10 },
			{ s: 'B', m: 'b', v: 20 }
		]
		const axes = resolveAxes(['a', 'b'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const result = verticesFor(data, axes, angles, domains, 100, 'linear', channels)

		expect(result.size).toBe(2)
		const a = result.get('A')
		const b = result.get('B')
		expect(a).toHaveLength(2)
		expect(b).toHaveLength(2)
		expect(a.map((v) => v.value)).toEqual([1, 2])
		expect(b.map((v) => v.value)).toEqual([10, 20])
	})

	it('duplicate (series, axis) cell averages the value: 4 and 6 give 5', () => {
		const data = [
			{ s: 'A', m: 'a', v: 4 },
			{ s: 'A', m: 'a', v: 6 }
		]
		const axes = resolveAxes(['a'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const result = verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		warn.mockRestore()

		const vertex = result.get('A')[0]
		expect(vertex).not.toBeNull()
		expect(vertex.value).toBe(5)
	})

	it('duplicate preserves row identity — the surviving row is === one of the input rows', () => {
		const rowA = { s: 'A', m: 'a', v: 4 }
		const rowB = { s: 'A', m: 'a', v: 6 }
		const data = [rowA, rowB]
		const axes = resolveAxes(['a'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const result = verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		warn.mockRestore()

		const vertex = result.get('A')[0]
		// A synthesised `{ ...row }` copy is structurally similar but fails this strict
		// reference check — `toContain` uses identity, not deep equality.
		expect([rowA, rowB]).toContain(vertex.row)
	})

	it('duplicates console.warn in dev', () => {
		const data = [
			{ s: 'A', m: 'a', v: 4 },
			{ s: 'A', m: 'a', v: 6 }
		]
		const axes = resolveAxes(['a'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		expect(warn).toHaveBeenCalled()
		warn.mockRestore()
	})

	it('does NOT warn when there are no duplicates', () => {
		const data = [
			{ s: 'A', m: 'a', v: 4 },
			{ s: 'A', m: 'b', v: 6 }
		]
		const axes = resolveAxes(['a', 'b'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		expect(warn).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it('a missing (series, axis) cell yields a gap — not a value of 0', () => {
		const data = [{ s: 'A', m: 'a', v: 5 }]
		const axes = resolveAxes(['a', 'b'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const result = verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		const vertices = result.get('A')

		expect(vertices).toHaveLength(2)
		expect(vertices[0]).not.toBeNull()
		expect(vertices[1]).toBeNull()
		expect(vertices[1]).not.toBe(0)
	})

	it('a non-finite value yields a gap rather than NaN', () => {
		const data = [{ s: 'A', m: 'a', v: 'oops' }]
		const axes = resolveAxes(['a'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, channels)

		const result = verticesFor(data, axes, angles, domains, 100, 'linear', channels)
		const vertex = result.get('A')[0]

		expect(vertex).toBeNull()
	})

	it('duplicates warn without a series channel too (exercises the no-series message branch)', () => {
		const data = [
			{ m: 'a', v: 4 },
			{ m: 'a', v: 6 }
		]
		const implicitChannels = { x: 'm', y: 'v' }
		const axes = resolveAxes(['a'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, implicitChannels)

		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const result = verticesFor(data, axes, angles, domains, 100, 'linear', implicitChannels)

		expect(warn).toHaveBeenCalled()
		expect(result.get(undefined)[0].value).toBe(5)
		warn.mockRestore()
	})

	it('no series channel (single implicit series) still produces one vertex list', () => {
		const data = [
			{ m: 'a', v: 1 },
			{ m: 'b', v: 2 },
			{ m: 'c', v: 3 }
		]
		const implicitChannels = { x: 'm', y: 'v' }
		const axes = resolveAxes(['a', 'b', 'c'], data, 'm')
		const angles = anglesFor(axes.map((ax) => ax.weight))
		const domains = domainsFor(axes, data, implicitChannels)

		const result = verticesFor(data, axes, angles, domains, 100, 'linear', implicitChannels)

		expect(result.size).toBe(1)
		const vertices = [...result.values()][0]
		expect(vertices).toHaveLength(3)
		expect(vertices.every((v) => v !== null)).toBe(true)
	})
})

describe('ringsFor', () => {
	it('spaces rings evenly in radius: rings=4, R=100 -> 25, 50, 75, 100', () => {
		const axes = resolveAxes(
			['a', 'b'],
			[
				{ m: 'a', v: 1 },
				{ m: 'b', v: 2 }
			],
			'm'
		)
		const rings = ringsFor(axes, { R: 100, rings: 4 })
		expect(rings).toHaveLength(4)
		expect(rings.map((r) => r.radius)).toEqual([25, 50, 75, 100])
	})

	it('spaces rings evenly in RADIUS, not in value, on a non-zero-anchored domain', () => {
		const axes = resolveAxes([{ key: 'a', domain: [20, 120] }], [{ m: 'a', v: 50 }], 'm')
		const domains = [[20, 120]]
		const rings = ringsFor(axes, { R: 100, rings: 4, domains })
		const radii = rings.map((r) => r.radius)
		expect(radii).toEqual([25, 50, 75, 100])

		// A broken implementation that spaces evenly in VALUE (v_i = (i/n) * domain.max,
		// forgetting the domain.min offset) and converts back through radiusFor gives a
		// DIFFERENT set of radii on this non-zero-anchored domain — [10, 40, 70, 100], not
		// [25, 50, 75, 100]. A domain starting at 0 could not distinguish the two (the offset
		// is zero either way), which is why this test deliberately uses [20, 120].
		const [min, max] = [20, 120]
		const valueSpaced = [1, 2, 3, 4].map((i) => radiusFor((i / 4) * max, [min, max], 100, 'linear'))
		expect(valueSpaced).not.toEqual(radii)
	})

	it('uniform AxisSpec.ticks across every axis drives the ring count', () => {
		const axes = resolveAxes(
			[
				{ key: 'a', ticks: 5 },
				{ key: 'b', ticks: 5 }
			],
			[
				{ m: 'a', v: 1 },
				{ m: 'b', v: 2 }
			],
			'm'
		)
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		// opts.rings=4 would be wrong if it were honoured instead of the uniform ticks=5.
		const rings = ringsFor(axes, { R: 100, rings: 4 })
		expect(rings).toHaveLength(5)
		expect(warn).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it('differing AxisSpec.ticks falls back to opts.rings and warns', () => {
		const axes = resolveAxes(
			[
				{ key: 'a', ticks: 5 },
				{ key: 'b', ticks: 7 }
			],
			[
				{ m: 'a', v: 1 },
				{ m: 'b', v: 2 }
			],
			'm'
		)
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const rings = ringsFor(axes, { R: 100, rings: 3 })
		expect(rings).toHaveLength(3)
		expect(warn).toHaveBeenCalled()
		warn.mockRestore()
	})

	it('uses tickLabels for ring labels when declared; formats the ring value with `format` otherwise', () => {
		const axes = resolveAxes(
			[
				{ key: 'csat', domain: [0, 4], ticks: 4, tickLabels: ['Poor', 'Fair', 'Good', 'Best'] },
				{ key: 'latency', domain: [0, 400], ticks: 4, format: (v) => `${v}ms` }
			],
			[
				{ m: 'csat', v: 1 },
				{ m: 'latency', v: 100 }
			],
			'm'
		)
		const domains = [
			[0, 4],
			[0, 400]
		]
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const rings = ringsFor(axes, { R: 100, domains, transform: 'linear' })
		expect(warn).not.toHaveBeenCalled() // both axes agree on ticks=4 -- no fallback needed
		warn.mockRestore()

		expect(rings).toHaveLength(4)
		expect(rings.map((r) => r.labels[0])).toEqual(['Poor', 'Fair', 'Good', 'Best'])
		expect(rings.map((r) => r.labels[1])).toEqual([100, 200, 300, 400].map((v) => `${v}ms`))
	})

	it('falls back to the bare numeric value when neither tickLabels nor format is declared', () => {
		const axes = resolveAxes([{ key: 'a', domain: [0, 4] }], [{ m: 'a', v: 1 }], 'm')
		const rings = ringsFor(axes, { R: 100, rings: 4, domains: [[0, 4]] })
		expect(rings.map((r) => r.labels[0])).toEqual([1, 2, 3, 4])
	})
})

describe('zeroRingFor', () => {
	it('emits a zero marker at radiusFor(0, domain, R, transform) when the domain contains zero but does not start there', () => {
		const axes = resolveAxes(['a'], [{ m: 'a', v: -2 }], 'm')
		const domains = [[-5, 10]]
		const R = 100
		const transform = 'linear'

		const zeroRings = zeroRingFor(axes, domains, R, transform)
		expect(zeroRings).toHaveLength(1)
		expect(zeroRings[0]).not.toBeNull()
		expect(zeroRings[0]).toBe(radiusFor(0, domains[0], R, transform))
	})

	it('emits no marker when the domain already starts at zero -- the hub already is zero', () => {
		const axes = resolveAxes(['a'], [{ m: 'a', v: 5 }], 'm')
		const zeroRings = zeroRingFor(axes, [[0, 10]], 100, 'linear')
		expect(zeroRings).toEqual([null])
	})

	it('emits no marker when the domain excludes zero entirely, e.g. [5, 10]', () => {
		const axes = resolveAxes(['a'], [{ m: 'a', v: 8 }], 'm')
		const zeroRings = zeroRingFor(axes, [[5, 10]], 100, 'linear')
		// Decision: null, not a clamped radius. radiusFor(0, [5, 10], ...) would clamp to ratio 0
		// -- the exact same position domain.min (5) already occupies -- so a marker drawn there
		// would sit on the hub and read as "this is zero", falsely implying 5 IS zero. When the
		// domain excludes zero entirely there is no position on this spoke that honestly
		// represents zero, so it renders nothing rather than a misleading clamp.
		expect(zeroRings).toEqual([null])
	})

	it('emits no marker on the degenerate [0, 0] domain (axis absent from every row)', () => {
		const data = [{ m: 'a', v: 1 }]
		const axes = resolveAxes(['a', 'zzz'], data, 'm')
		const domains = domainsFor(axes, data, { x: 'm', y: 'v' })
		expect(domains[1]).toEqual([0, 0])
		const zeroRings = zeroRingFor(axes, domains, 100, 'linear')
		expect(zeroRings[1]).toBeNull()
	})

	it('resolves each axis independently, positionally aligned with axes/domains', () => {
		const axes = resolveAxes(['a', 'b', 'c'], rows, 'm')
		const domains = [
			[-5, 10],
			[0, 10],
			[5, 10]
		]
		const zeroRings = zeroRingFor(axes, domains, 100, 'linear')
		expect(zeroRings[0]).toBe(radiusFor(0, domains[0], 100, 'linear'))
		expect(zeroRings[1]).toBeNull()
		expect(zeroRings[2]).toBeNull()
	})
})

describe('buildRadarLayout', () => {
	const channels = { x: 'm', y: 'v', color: 's' }

	it('returns every documented key', () => {
		const data = [
			{ s: 'A', m: 'a', v: 1 },
			{ s: 'A', m: 'b', v: 2 },
			{ s: 'A', m: 'c', v: 3 }
		]
		const layout = buildRadarLayout(data, channels, { axes: ['a', 'b', 'c'] })
		for (const key of ['axes', 'angles', 'domains', 'series', 'rings', 'zeroRings', 'radius', 'transform']) {
			expect(layout).toHaveProperty(key)
		}
	})

	it('composes axes/angles/domains/transform exactly as the standalone functions would for the same inputs', () => {
		const data = [
			{ s: 'A', m: 'a', v: 1 },
			{ s: 'A', m: 'b', v: 2 },
			{ s: 'A', m: 'c', v: 3 }
		]
		const opts = { axes: ['a', 'b', 'c'], R: 100 }
		const layout = buildRadarLayout(data, channels, opts)

		const axes = resolveAxes(opts.axes, data, channels.x)
		const angles = anglesFor(axes.map((a) => a.weight))
		const domains = domainsFor(axes, data, channels)
		const transform = resolveRadiusTransform(axes.map((a) => a.weight))

		expect(layout.axes).toEqual(axes)
		expect(layout.angles).toEqual(angles)
		expect(layout.domains).toEqual(domains)
		expect(layout.transform).toBe(transform)
		expect(layout.radius).toBe(100)
	})

	it("series matches verticesFor's output for the same inputs", () => {
		const data = [
			{ s: 'A', m: 'a', v: 1 },
			{ s: 'A', m: 'b', v: 2 },
			{ s: 'B', m: 'a', v: 10 },
			{ s: 'B', m: 'b', v: 20 }
		]
		const opts = { axes: ['a', 'b'], R: 100 }
		const layout = buildRadarLayout(data, channels, opts)

		const axes = resolveAxes(opts.axes, data, channels.x)
		const angles = anglesFor(axes.map((a) => a.weight))
		const domains = domainsFor(axes, data, channels)
		const transform = resolveRadiusTransform(axes.map((a) => a.weight))
		const expectedSeries = verticesFor(data, axes, angles, domains, 100, transform, channels)

		expect(layout.series.size).toBeGreaterThan(0)
		expect(layout.series).toEqual(expectedSeries)
	})

	it('defaults R to a sane pixel radius when opts.R is omitted', () => {
		const data = [{ m: 'a', v: 1 }]
		const layout = buildRadarLayout(data, { x: 'm', y: 'v' }, { axes: ['a'] })
		expect(layout.radius).toBeGreaterThan(0)
	})

	it('forwards opts.sharedDomain, opts.rings and opts.radiusScale to the underlying calls', () => {
		const data = [
			{ s: 'A', m: 'p', v: -4 },
			{ s: 'A', m: 'p', v: 3 },
			{ s: 'A', m: 'q', v: 2 },
			{ s: 'A', m: 'q', v: 6 }
		]
		const layout = buildRadarLayout(data, channels, {
			axes: ['p', 'q'],
			sharedDomain: true,
			rings: 2,
			radiusScale: 'sqrt',
			R: 100
		})
		expect(layout.domains).toEqual([
			[-4, 6],
			[-4, 6]
		])
		expect(layout.transform).toBe('sqrt')
		expect(layout.rings).toHaveLength(2)
	})
})

describe('module purity', () => {
	it('imports nothing from svelte and never reaches into context -- polar.js is a plain data-in/data-out transform', () => {
		const source = readFileSync(polarSourcePath, 'utf8')
		expect(source).not.toMatch(/from\s+['"]svelte/)
		expect(source).not.toMatch(/getContext/)
	})
})
