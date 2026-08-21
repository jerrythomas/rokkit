import { describe, it, expect, vi } from 'vitest'
import { resolveAxes, anglesFor, domainsFor } from '../../src/lib/brewing/polar.js'

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
