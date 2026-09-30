import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import Plot from '../../src/Plot.svelte'

/**
 * Every spec-driven geom renders — never aborts — on awkward but legal data.
 *
 * A thrown render error (a duplicate `{#each}` key, a property read on null) takes the whole
 * chart down, not just the geom. Two shipped that way: arc keyed slices by a category that
 * repeats, and radar spread a numeric category into `{}`. This sweep found both.
 */

afterEach(() => cleanup())

const row = (k, v, g = 'g1') => ({
	k,
	v,
	w: v,
	g,
	open: 1,
	high: 3,
	low: 0,
	close: 2,
	source: k,
	target: g,
	value: v
})

const DATASETS = {
	'duplicate rows': [row('a', 1), row('a', 1), row('b', 2), row('b', 2)],
	'repeated categories': [row('a', 1), row('a', 2), row('b', 3), row('b', 4)],
	'identical positions': [row('a', 5), row('a', 5, 'g2'), row('a', 5)],
	'missing fields': [{ k: 'a' }, { v: 2 }, {}],
	'a single row': [row('a', 1)],
	'empty-string categories': [row('', 1), row('', 2, '')],
	'numeric categories': [row(1, 1), row(1, 2), row(2, 3)],
	'null categories': [row(null, null, null), row(null, null, null)]
}

const SPECS = {
	'x band': (data, type) => ({ data, x: 'k', y: 'v', geoms: [{ type }] }),
	'x band + colour': (data, type) => ({ data, x: 'k', y: 'v', color: 'g', geoms: [{ type }] }),
	'x numeric + colour': (data, type) => ({ data, x: 'w', y: 'v', color: 'g', geoms: [{ type }] }),
	stacked: (data, type) => ({ data, x: 'k', y: 'v', fill: 'g', stack: true, geoms: [{ type }] })
}

const GEOMS = ['bar', 'line', 'area', 'point', 'arc', 'box', 'violin', 'heatmap', 'candlestick', 'waterfall', 'hexbin', 'ribbon', 'radar', 'hull', 'contour']

describe('spec geoms render on awkward data', () => {
	it.each(GEOMS)('%s', (type) => {
		// Radar warns (by design) when it infers axis order; the warning is not under test.
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		const failures = []
		for (const [dataName, data] of Object.entries(DATASETS)) {
			for (const [specName, make] of Object.entries(SPECS)) {
				try {
					render(Plot, { props: { spec: make(data, type), width: 300, height: 200, animate: false } })
				} catch (error) {
					failures.push(`${dataName} / ${specName}: ${String(error.message).split('\n')[0]}`)
				}
				cleanup()
			}
		}
		expect(failures).toEqual([])
	})
})
