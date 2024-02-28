import { describe, it, expect } from 'vitest'
import { shapes, components } from '../src/symbols'

import { render } from '@testing-library/svelte'

describe('components', () => {
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual(['circle', 'square', 'triangle', 'default'])
	})

	it.each(Object.keys(components))('should render %s', (key) => {
		const { container } = render(components[key])
		expect(container).toMatchSnapshot()
	})

	// it.each(Object.keys(components.symbols))('should render the named shape %s', (name) => {
	// 	const { container } = render(components.Shape, { props: { name } })
	// 	expect(container).toMatchSnapshot()
	// })
})
