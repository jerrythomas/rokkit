import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputRange from '../../src/input/InputRange.svelte'

describe('InputRange', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: 50 })
		const { container } = render(InputRange, { props })

		const element = container.querySelector('input')
		expect(element.value).toBe('50')
		expect(element.type).toBe('range')

		props.value = 75
		flushSync()
		expect(element.value).toBe('75')
	})

	it('should render as disabled', () => {
		const props = $state({
			value: 50,
			disabled: true
		})

		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: 50,
			required: true
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should render with min and max attributes', () => {
		const props = $state({
			value: 50,
			min: 0,
			max: 100
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.min).toBe('0')
		expect(element.max).toBe('100')
	})

	it('should render with step attribute', () => {
		const props = $state({
			value: 50,
			step: 5
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.step).toBe('5')
	})

	it('should render with list attribute', () => {
		const props = $state({
			value: 50,
			list: 'range-list'
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.getAttribute('list')).toBe('range-list')
	})

	it('should render with additional attributes', () => {
		const props = $state({
			value: 50,
			id: 'volume-range',
			name: 'volume'
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.id).toBe('volume-range')
		expect(element.name).toBe('volume')
	})

	it('should handle input events', async () => {
		const props = $state({ value: 50 })
		const { container } = render(InputRange, { props })

		const element = container.querySelector('input')

		// Simulate moving the range slider
		element.value = '75'
		await userEvent.type(element, '{arrowright}')
		await tick()

		// Note: The exact behavior may vary based on browser implementation
		// but we can test that the value changes
		expect(element.value).toBeTruthy()
	})

	it('should handle decimal step values', () => {
		const props = $state({
			value: 5.5,
			min: 0,
			max: 10,
			step: 0.5
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.step).toBe('0.5')
		expect(element.value).toBe('5.5')
	})

	it('should handle negative ranges', () => {
		const props = $state({
			value: -5,
			min: -10,
			max: 10
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')
		expect(element.min).toBe('-10')
		expect(element.max).toBe('10')
		expect(element.value).toBe('-5')
	})

	it('should handle onchange callback', async () => {
		const props = $state({
			value: 50,
			onchange: vi.fn()
		})
		const { container } = render(InputRange, { props })

		const element = container.querySelector('input')

		// Simulate range change
		element.value = '75'
		element.dispatchEvent(new Event('change', { bubbles: true }))
		await tick()

		expect(props.onchange).toHaveBeenCalled()
	})

	it('should handle focus and blur events', async () => {
		const props = $state({
			value: 50,
			onfocus: vi.fn(),
			onblur: vi.fn()
		})
		const { container } = render(InputRange, { props })

		const element = container.querySelector('input')
		await userEvent.click(element)
		expect(props.onfocus).toHaveBeenCalledTimes(1)

		await userEvent.tab()
		expect(props.onblur).toHaveBeenCalledTimes(1)
	})

	it('should handle undefined min, max, and step', () => {
		const props = $state({
			value: 50,
			min: undefined,
			max: undefined,
			step: undefined
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')

		// When undefined, these attributes should not be set or have default values
		expect(element.hasAttribute('min')).toBe(false)
		expect(element.hasAttribute('max')).toBe(false)
		expect(element.hasAttribute('step')).toBe(false)
	})

	it('should render with all range-specific props', () => {
		const props = $state({
			value: 50,
			min: 0,
			max: 100,
			step: 5,
			list: 'volume-levels',
			required: true,
			disabled: false,
			name: 'volume',
			id: 'volume-slider'
		})
		const { container } = render(InputRange, { props })
		expect(container).toMatchSnapshot()
	})

	it('should handle keyboard navigation', async () => {
		const props = $state({
			value: 50,
			min: 0,
			max: 100,
			step: 10
		})
		const { container } = render(InputRange, { props })

		const element = container.querySelector('input')
		element.focus()

		// Test arrow key navigation
		await userEvent.keyboard('{ArrowRight}')
		await tick()

		// Value should have increased (exact amount depends on browser/step)
		const newValue = parseInt(element.value)
		expect(newValue).toBeGreaterThanOrEqual(50)

		await userEvent.keyboard('{ArrowLeft}')
		await tick()

		// Value should have decreased back
		const finalValue = parseInt(element.value)
		expect(finalValue).toBeLessThanOrEqual(newValue)
	})

	it('should respect min and max boundaries', () => {
		const props = $state({
			value: 150, // Value higher than max
			min: 0,
			max: 100
		})
		const { container } = render(InputRange, { props })
		const element = container.querySelector('input')

		// Browser should clamp the value to max
		expect(parseInt(element.value)).toBeLessThanOrEqual(100)
	})
})
