import { describe, it, expect } from 'vitest'
// skipcq: JS-C1003 - Importing all components for verification
import * as components from '../src/patterns'
import { render } from '@testing-library/svelte'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual([
			'Brick',
			'Circles',
			'Dots',
			'CrossHatch',
			'Waves',
			'Tile',
			'Triangles',
			'CurvedWave',
			'OutlineCircles'
		])
	})

	it.each(Object.keys(components))('should render %s', (key) => {
		const { container } = render(components[key])
		expect(container).toMatchSnapshot()
	})

	// it.each(Object.keys(patterns))('should render NamedPath for pattern "%s"', (key) => {
	// 	const { container } = render(components.NamedPath, { props: { name: key } })
	// 	expect(container).toMatchSnapshot()
	// })
})
