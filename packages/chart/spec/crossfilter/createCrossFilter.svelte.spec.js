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

		it('stores a copy — mutating the input array does not change the stored filter', () => {
			const cf = createCrossFilter()
			const range = [2, 4]
			cf.setRange('displ', range)
			range[0] = 0 // mutate original
			// stored filter should still be [2, 4]
			expect(cf.filters.get('displ')[0]).toBe(2)
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

		it('clearFilter on non-existent dimension is a no-op', () => {
			const cf = createCrossFilter()
			cf.toggleCategorical('class', 'compact')
			expect(() => cf.clearFilter('nonexistent')).not.toThrow()
			expect(cf.isFiltered('class')).toBe(true) // other filters intact
		})
	})
})
