import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import Swatch from '../src/components/Swatch.svelte'
import SwatchTest from './SwatchTest.svelte'

/**
 * Swatch's shape variants and its multi-select toggle are the parts a consumer
 * configures, and neither the circle shape, the custom `item` snippet, nor the
 * de-select half of multi-select had rendered.
 */

beforeEach(() => cleanup())

const options = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' }
]

const swatches = (c: Element) => [...c.querySelectorAll('[data-swatch-item], button')]

describe('Swatch — shape', () => {
	it('renders squares by default', () => {
		const { container } = render(Swatch, { props: { options } })

		expect(container.querySelectorAll('[data-swatch-square]')).toHaveLength(3)
		expect(container.querySelector('[data-swatch-circle]')).toBeNull()
	})

	it('renders circles when shape is circle', () => {
		const { container } = render(Swatch, { props: { options, shape: 'circle' } })

		expect(container.querySelectorAll('[data-swatch-circle]')).toHaveLength(3)
		expect(container.querySelector('[data-swatch-square]')).toBeNull()
	})

	it('renders the custom item snippet instead of either shape', () => {
		const { container } = render(SwatchTest, {
			props: { withItemSnippet: true, options, value: 'red' }
		})

		expect(container.querySelectorAll('[data-custom-swatch]')).toHaveLength(3)
		expect(container.querySelector('[data-swatch-square]')).toBeNull()
		// The snippet receives the selected flag for the active entry.
		expect(container.querySelectorAll('[data-custom-selected]')).toHaveLength(1)
	})

	it('renders nothing but the container for the default empty options', () => {
		const { container } = render(Swatch)

		expect(swatches(container)).toHaveLength(0)
	})
})

describe('Swatch — single select', () => {
	it('reports a newly picked value', async () => {
		const onchange = vi.fn()
		const { container } = render(Swatch, { props: { options, value: 'red', onchange } })

		await fireEvent.click(swatches(container)[1])
		await tick()

		expect(onchange).toHaveBeenCalledWith('green', expect.anything())
	})

	it('ignores a click on the already-selected value', async () => {
		// Re-picking the current value must not fire onchange — otherwise a
		// controlled parent sees a change event with no change.
		const onchange = vi.fn()
		const { container } = render(Swatch, { props: { options, value: 'red', onchange } })

		await fireEvent.click(swatches(container)[0])
		await tick()

		expect(onchange).not.toHaveBeenCalled()
	})
})

describe('Swatch — multi select', () => {
	it('adds a value that is not yet picked', async () => {
		const onchange = vi.fn()
		const { container } = render(Swatch, {
			props: { options, multiple: true, value: ['red'], onchange }
		})

		await fireEvent.click(swatches(container)[1])
		await tick()

		expect(onchange).toHaveBeenCalled()
		expect(onchange.mock.calls.at(-1)[0]).toEqual(['red', 'green'])
	})

	it('removes a value that is already picked', async () => {
		const onchange = vi.fn()
		const { container } = render(Swatch, {
			props: { options, multiple: true, value: ['red', 'green'], onchange }
		})

		await fireEvent.click(swatches(container)[0])
		await tick()

		expect(onchange.mock.calls.at(-1)[0]).toEqual(['green'])
	})

	it('starts from an empty selection when value is not an array', async () => {
		const onchange = vi.fn()
		const { container } = render(Swatch, {
			props: { options, multiple: true, value: undefined, onchange }
		})

		await fireEvent.click(swatches(container)[2])
		await tick()

		expect(onchange.mock.calls.at(-1)[0]).toEqual(['blue'])
	})
})
