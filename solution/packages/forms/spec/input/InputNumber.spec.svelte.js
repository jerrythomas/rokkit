import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputNumber from '../../src/input/InputNumber.svelte'

describe('InputNumber', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: 0 })
		const { container } = render(InputNumber, { props })

		const element = container.querySelector('input')
		expect(element.value).toBe('0')
		expect(element.type).toBe('number')

		props.value = 42
		flushSync()
		expect(element.value).toBe('42')
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			disabled: true
		})

		const { container } = render(InputNumber, { props })
		const element = container.querySelector('input')
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			required: true
		})
		const { container } = render(InputNumber, { props })
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should render with min and max attributes', () => {
		const props = $state({
			value: 5,
			min: 0,
			max: 100
		})
		const { container } = render(InputNumber, { props })
		const element = container.querySelector('input')
		expect(element.min).toBe('0')
		expect(element.max).toBe('100')
	})

	it('should render with step attribute', () => {
		const props = $state({
			value: 5.5,
			step: 0.5
		})
		const { container } = render(InputNumber, { props })
		const element = container.querySelector('input')
		expect(element.step).toBe('0.5')
	})

	it('should render with placeholder', () => {
		const props = $state({
			value: null,
			placeholder: 'Enter a number'
		})
		const { container } = render(InputNumber, { props })
		const element = container.querySelector('input')
		expect(element.placeholder).toBe('Enter a number')
	})

	it('should render as readonly', () => {
		const props = $state({
			value: 42,
			readonly: true
		})
		const { container } = render(InputNumber, { props })
		const element = container.querySelector('input')
		expect(element.readOnly).toBe(true)

		props.readonly = false
		flushSync()
		expect(element.readOnly).toBe(false)
	})

	it('should render with additional attributes', () => {
		const props = $state({
			value: 42,
			id: 'number-input',
			name: 'quantity',
			autocomplete: 'off'
		})
		const { container } = render(InputNumber, { props })
		const element = container.querySelector('input')
		expect(element.id).toBe('number-input')
		expect(element.name).toBe('quantity')
		expect(element.autocomplete).toBe('off')
	})

	it('should handle input events', async () => {
		const props = $state({ value: 0 })
		const { container } = render(InputNumber, { props })

		const element = container.querySelector('input')
		await userEvent.clear(element)
		await userEvent.type(element, '123')
		await tick()

		expect(props.value).toBe(123)
	})

	it('should handle decimal values', async () => {
		const props = $state({ value: 0, step: 0.01 })
		const { container } = render(InputNumber, { props })

		const element = container.querySelector('input')
		await userEvent.clear(element)
		await userEvent.type(element, '12.34')
		await tick()

		expect(props.value).toBe(12.34)
	})

	it('should handle negative values', async () => {
		const props = $state({ value: 0 })
		const { container } = render(InputNumber, { props })

		const element = container.querySelector('input')
		await userEvent.clear(element)
		await userEvent.type(element, '-42')
		await tick()

		expect(props.value).toBe(-42)
	})

	it('should handle onchange callback', async () => {
		const props = $state({
			value: 0,
			onchange: vi.fn()
		})
		const { container } = render(InputNumber, { props })

		const element = container.querySelector('input')
		await userEvent.clear(element)
		await userEvent.type(element, '100')
		await fireEvent.change(element)
		await tick()

		expect(props.onchange).toHaveBeenCalled()
		expect(props.value).toBe(100)
	})

	it('should handle focus and blur events', async () => {
		const props = $state({
			value: 0,
			onfocus: vi.fn(),
			onblur: vi.fn()
		})
		const { container } = render(InputNumber, { props })

		const element = container.querySelector('input')
		await userEvent.click(element)
		expect(props.onfocus).toHaveBeenCalledTimes(1)

		await userEvent.tab()
		expect(props.onblur).toHaveBeenCalledTimes(1)
	})

	it('should render with all number-specific props', () => {
		const props = $state({
			value: 50,
			min: 0,
			max: 100,
			step: 5,
			placeholder: 'Enter percentage',
			required: true,
			disabled: false,
			readonly: false,
			name: 'percentage',
			id: 'percentage-input',
			autocomplete: 'off'
		})
		const { container } = render(InputNumber, { props })
		expect(container).toMatchSnapshot()
	})
})
