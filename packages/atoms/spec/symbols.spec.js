import { describe, it, expect } from 'vitest'
import * as components from '../src/symbols'
import { symbols } from '../src/symbols/symbols'

import { render } from '@testing-library/svelte'

describe('components', () => {
	const names = Object.keys(components).filter((key) => key !== 'symbols')
	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual(['symbols', 'Shape', 'Circle', 'Square', 'Triangle'])
	})

	it.each(names)('should render %s', (key) => {
		const { container } = render(components[key])
		expect(container).toMatchSnapshot()
	})

	it.each(Object.keys(symbols))('should render the named shape %s', (name) => {
		const { container } = render(components.Shape, { props: { name } })
		expect(container).toMatchSnapshot()
	})
})
