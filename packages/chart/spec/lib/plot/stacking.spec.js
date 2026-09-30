import { describe, it, expect } from 'vitest'
import { subBandFields, stackFieldOf } from '../../../src/lib/plot/stacking.js'

describe('subBandFields', () => {
	it('lists distinct non-x fields, group first, skipping literal colours', () => {
		expect(subBandFields({ x: 'q', group: 'g', color: 'c', pattern: 'p' })).toEqual(['g', 'c', 'p'])
		expect(subBandFields({ x: 'q', group: 'q', color: '#f00', pattern: 'p' })).toEqual(['p'])
		expect(subBandFields({ x: 'q', group: 'c', color: 'c' })).toEqual(['c'])
	})
})

describe('stackFieldOf — the one stacking rule', () => {
	it('stacks by group when given', () => {
		expect(stackFieldOf({ x: 'q', group: 'g', fill: 'f' })).toBe('g')
	})
	it('defaults group to the interior, fill before colour', () => {
		expect(stackFieldOf({ x: 'q', fill: 'f', color: 'c' })).toBe('f')
		expect(stackFieldOf({ x: 'q', color: 'c' })).toBe('c')
	})
	it('falls through to the pattern when the colour fields are the x field', () => {
		expect(stackFieldOf({ x: 'q', fill: 'q', pattern: 'p' })).toBe('p')
	})
	it('is null when nothing but x groups the bars — the builder draws plain bars', () => {
		expect(stackFieldOf({ x: 'q', fill: 'q' })).toBeNull()
		expect(stackFieldOf({ x: 'q' })).toBeNull()
	})
})
