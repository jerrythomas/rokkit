import { describe, it, expect } from 'vitest'
import { shapes, components } from '../src/symbols'

import { render } from '@testing-library/svelte'

describe('symbols', () => {
	const names = shapes.filter((shape) => !Object.keys(components).includes(shape))
	const symbols = Object.keys(components).filter((key) => key !== 'default')

	it('should contain all exported components', () => {
		expect(Object.keys(components)).toEqual(['default', 'rounded-square'])
	})

	describe('custom symbols', () => {
		it.each(symbols)('should render %s', (key) => {
			const { container } = render(components[key])
			expect(container).toMatchSnapshot()
		})
		it.each(symbols)('should render %s with stroke and fill', (key) => {
			const { container } = render(components[key], { props: { stroke: 'red', fill: 'blue' } })
			expect(container).toMatchSnapshot()
		})

		it.each(symbols)('should render %s with size and origin', (key) => {
			const { container } = render(components[key], { props: { size: 10, x: 5, y: 6 } })
			expect(container).toMatchSnapshot()
		})
	})

	describe('named paths', () => {
		it.each(names)('should render "%s"', (name) => {
			const { container } = render(components.default, { props: { name } })
			expect(container).toMatchSnapshot()
		})
		it.each(names)('should render "%s" with stroke and fill', (name) => {
			const { container } = render(components.default, { props: { name } })
			expect(container).toMatchSnapshot()
		})
		it.each(names)('should render "%s" with size and origin', (name) => {
			const { container } = render(components.default, { props: { name, size: 10, x: 5, y: 6 } })
			expect(container).toMatchSnapshot()
		})
	})
})
