import { describe, it, expect } from 'vitest'
import { categoricalPalette, categoricalFamilies } from '../src/colors/brewer.js'
import { defaultColors } from '../src/colors/index.js'

describe('categorical palette', () => {
	it('carries every family chart relied on', () => {
		expect(categoricalFamilies).toEqual([
			'amber',
			'blue',
			'cyan',
			'emerald',
			'gold',
			'gray',
			'indigo',
			'lavender',
			'lime',
			'orange',
			'pink',
			'purple',
			'red',
			'rose',
			'sky',
			'stone',
			'teal',
			'violet',
			'wood',
			'yellow',
			'zinc'
		])
	})

	it('gives every family the full 50-950 ladder', () => {
		const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

		// Guard the loop: on an empty families array the body never runs and this passes vacuously.
		expect(categoricalFamilies.length).toBeGreaterThan(0)

		for (const family of categoricalFamilies) {
			expect(Object.keys(categoricalPalette[family]).sort(), family).toEqual(shades.sort())
		}
	})

	it('stays SEPARATE from defaultColors — it is a different palette, not a superset', () => {
		// core's tailwind.json and chart's palette disagree on shared families, so merging
		// them would silently move every chart's colours. `wood` proves the split: it exists
		// only in the categorical palette.
		expect(categoricalPalette.wood).toBeDefined()
		expect(defaultColors.wood).toBeUndefined()
	})

	it('is reachable from the package root, not just the deep path', () => {
		// chart imports it as `from '@rokkit/core'`. core's barrel re-exports colors through
		// constants.js with a NAMED list, so a new export in colors/index.ts is not
		// automatically public — this asserts the barrel was updated too.
		return import('../src/index.js').then((core) => {
			expect(core.categoricalPalette).toBe(categoricalPalette)
			expect(core.categoricalFamilies).toEqual(categoricalFamilies)
		})
	})
})
