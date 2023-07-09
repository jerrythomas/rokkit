import { describe, it, expect } from 'vitest'
import * as components from '../src/patterns'
import { render } from '@testing-library/svelte'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Brick',
			'Circles',
			'Dots',
			'CrossHatch',
			'Tile',
			'Triangles'
		])
	})

	it.each(Object.keys(components))('should render %s', (key) => {
		const { container } = render(components[key])
		expect(container).toMatchSnapshot()
	})
})
