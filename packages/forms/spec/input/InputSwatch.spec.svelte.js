import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputSwatch from '../../src/input/InputSwatch.svelte'

describe('InputSwatch', () => {
	beforeEach(() => cleanup())

	const colorOptions = ['#ff0000', '#00ff00', '#0000ff']

	it('should render a swatch component', () => {
		const props = $state({ value: '#ff0000', options: colorOptions })
		const { container } = render(InputSwatch, { props })

		expect(container.querySelector('[data-swatch]')).toBeTruthy()
	})

	it('should render a swatch item for each option', () => {
		const props = $state({ value: '#ff0000', options: colorOptions })
		const { container } = render(InputSwatch, { props })

		const items = container.querySelectorAll('[data-swatch-item]')
		expect(items).toHaveLength(3)
	})

	it('should render with square shape by default', () => {
		const props = $state({ value: '#ff0000', options: colorOptions })
		const { container } = render(InputSwatch, { props })

		const swatch = container.querySelector('[data-swatch]')
		expect(swatch.getAttribute('data-swatch-shape')).toBe('square')
	})

	it('should render with circle shape when specified', () => {
		const props = $state({ value: '#ff0000', options: colorOptions, shape: 'circle' })
		const { container } = render(InputSwatch, { props })

		const swatch = container.querySelector('[data-swatch]')
		expect(swatch.getAttribute('data-swatch-shape')).toBe('circle')
	})

	it('should render with the given size', () => {
		const props = $state({ value: '#ff0000', options: colorOptions, size: 'lg' })
		const { container } = render(InputSwatch, { props })

		const swatch = container.querySelector('[data-swatch]')
		expect(swatch.getAttribute('data-swatch-size')).toBe('lg')
	})

	it('should render as disabled when disabled prop is true', () => {
		const props = $state({ value: '#ff0000', options: colorOptions, disabled: true })
		const { container } = render(InputSwatch, { props })

		const swatch = container.querySelector('[data-swatch]')
		expect(swatch.hasAttribute('data-swatch-disabled')).toBe(true)
	})

	it('should not set disabled when disabled is false', () => {
		const props = $state({ value: '#ff0000', options: colorOptions, disabled: false })
		const { container } = render(InputSwatch, { props })

		const swatch = container.querySelector('[data-swatch]')
		expect(swatch.hasAttribute('data-swatch-disabled')).toBe(false)
	})

	it('should render with empty options array', () => {
		const props = $state({ value: undefined, options: [] })
		const { container } = render(InputSwatch, { props })

		expect(container.querySelector('[data-swatch]')).toBeTruthy()
		const items = container.querySelectorAll('[data-swatch-item]')
		expect(items).toHaveLength(0)
	})

	it('should call onchange when a swatch item is clicked', async () => {
		const onchange = vi.fn()
		const props = $state({ value: '#ff0000', options: colorOptions, onchange })
		const { container } = render(InputSwatch, { props })

		const items = container.querySelectorAll('[data-swatch-item]')
		await fireEvent.click(items[1])

		expect(onchange).toHaveBeenCalled()
	})

	it('should mark selected item with data-selected', () => {
		const props = $state({ value: '#ff0000', options: colorOptions })
		const { container } = render(InputSwatch, { props })

		const items = container.querySelectorAll('[data-swatch-item]')
		expect(items[0].hasAttribute('data-selected')).toBe(true)
		expect(items[1].hasAttribute('data-selected')).toBe(false)
	})

	it('should update value reactively', () => {
		const props = $state({ value: '#ff0000', options: colorOptions })
		const { container } = render(InputSwatch, { props })

		let items = container.querySelectorAll('[data-swatch-item]')
		expect(items[0].hasAttribute('data-selected')).toBe(true)

		props.value = '#00ff00'
		flushSync()

		items = container.querySelectorAll('[data-swatch-item]')
		expect(items[1].hasAttribute('data-selected')).toBe(true)
		expect(items[0].hasAttribute('data-selected')).toBe(false)
	})
})
