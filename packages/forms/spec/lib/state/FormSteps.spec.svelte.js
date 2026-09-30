import { describe, it, expect } from 'vitest'
import { FormValues } from '../../../src/lib/state/FormValues.svelte.js'
import { FormDefinition } from '../../../src/lib/state/FormDefinition.svelte.js'
import { FormSteps, stepPaths } from '../../../src/lib/state/FormSteps.svelte.js'

const layout = {
	type: 'vertical',
	elements: [
		{ type: 'step', elements: [{ scope: '#/a' }, { type: 'group', elements: [{ scope: '#/b' }] }] },
		{ type: 'step', elements: [{ scope: '#/c' }] },
		{ type: 'step', elements: [] }
	]
}
const make = (l = layout) => new FormSteps(new FormDefinition(new FormValues({}), null, l))

describe('FormSteps', () => {
	it('counts the steps and starts at the first', () => {
		const s = make()
		expect(s.isMultiStep).toBe(true)
		expect(s.total).toBe(3)
		expect(s.current).toBe(0)
		expect(s.canAdvance).toBe(true)
	})

	it('shows only the active step’s elements', () => {
		const s = make()
		expect(s.activeElements.map((e) => e.scope)).toEqual(['#/a', undefined])
		s.advance()
		expect(s.activeElements.map((e) => e.scope)).toEqual(['#/c'])
	})

	it('advances to the last step and no further; goes back to the first and no further', () => {
		const s = make()
		expect(s.advance()).toBe(true)
		expect(s.advance()).toBe(true)
		expect(s.canAdvance).toBe(false)
		expect(s.advance()).toBe(false)
		expect(s.back()).toBe(true)
		expect(s.back()).toBe(true)
		expect(s.back()).toBe(false)
	})

	it('goes back to a visited step, never forward', () => {
		const s = make()
		s.advance()
		s.goTo(0)
		expect(s.current).toBe(0)
		expect(() => s.goTo(1)).toThrow('Cannot navigate forward')
	})

	it('a flat layout has no steps and every element is active', () => {
		const s = make({ type: 'vertical', elements: [{ scope: '#/x' }] })
		expect(s.isMultiStep).toBe(false)
		expect(s.total).toBe(0)
		expect(s.activeElements.map((e) => e.scope)).toEqual(['#/x'])
		expect(s.allStepElements).toEqual([])
	})

	it('flattens every step’s elements, and finds a step by index', () => {
		const s = make()
		expect(s.allStepElements.map((e) => e.scope)).toEqual(['#/a', undefined, '#/c'])
		expect(s.step(1).elements[0].scope).toBe('#/c')
		expect(s.step(9)).toBeNull()
	})
})

describe('stepPaths', () => {
	it('collects every scoped field, nested groups included', () => {
		expect(stepPaths(layout.elements[0].elements)).toEqual(['a', 'b'])
		expect(stepPaths(undefined)).toEqual([])
	})
})
