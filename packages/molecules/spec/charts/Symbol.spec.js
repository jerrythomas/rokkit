import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Symbol from '../../src/charts/Symbol.svelte'
import { Triangle } from '@rokkit/atoms/symbols'

describe('Symbol.svelte', () => {
	beforeEach(() => cleanup())

	it('should render default circle.', () => {
		const { container } = render(Symbol)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render symbol provided', () => {
		const { container } = render(Symbol, {
			shape: 'Triangle',
			using: { Triangle }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using path when component is not provided', () => {
		const { container } = render(Symbol, { shape: 'triangle', using: {} })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
