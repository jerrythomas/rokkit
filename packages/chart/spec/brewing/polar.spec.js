import { describe, it, expect, vi } from 'vitest'
import { resolveAxes, anglesFor } from '../../src/lib/brewing/polar.js'

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
