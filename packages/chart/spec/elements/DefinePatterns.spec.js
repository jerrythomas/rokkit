import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import DefinePatterns from '../../src/elements/DefinePatterns.svelte'
import { Circles, Triangles } from '../../src/patterns'

describe('DefinePatterns.svelte', () => {
	beforeEach(() => cleanup())

	it('should be empty when patterns are not provided.', () => {
		const { container } = render(DefinePatterns)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render error when pattern names are not unique', () => {
		const patterns = [{ name: 'test' }, { name: 'test' }]
		const { container } = render(DefinePatterns, { patterns })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render the patterns when provided', () => {
		const patterns = [
			{ name: 'circles', component: Circles },
			{ name: 'triangles', component: Triangles }
		]
		const { container } = render(DefinePatterns, { patterns })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render the patterns using fills and colors when provided', () => {
		const patterns = [
			{ name: 'circles', component: Circles, fill: 'red', stroke: 'blue' },
			{
				name: 'triangles',
				component: Triangles,
				fill: 'green',
				stroke: 'yellow'
			}
		]
		const { container } = render(DefinePatterns, { patterns })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
