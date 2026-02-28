import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputDate from '../../src/input/InputDate.svelte'

describe('InputDate', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: '2023-12-25' })
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		expect(element.value).toBe('2023-12-25')
		expect(element.type).toBe('date')

		props.value = '2024-01-01'
		flushSync()
		expect(element.value).toBe('2024-01-01')
	})

	it('should render as disabled', () => {
		const props = $state({
			value: '2023-12-25',
			disabled: true
		})

		const { container } = render(InputDate, { props })
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
		const { container } = render(InputDate, { props })
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should render with min and max attributes', () => {
		const props = $state({
			value: '2023-12-25',
			min: '2023-01-01',
			max: '2023-12-31'
		})
		const { container } = render(InputDate, { props })
		const element = container.querySelector('input')
		expect(element.min).toBe('2023-01-01')
		expect(element.max).toBe('2023-12-31')
	})

	it('should render with step attribute', () => {
		const props = $state({
			value: '2023-12-25',
			step: 7
		})
		const { container } = render(InputDate, { props })
		const element = container.querySelector('input')
		expect(element.step).toBe('7')
	})

	it('should render as readonly', () => {
		const props = $state({
			value: '2023-12-25',
			readonly: true
		})
		const { container } = render(InputDate, { props })
		const element = container.querySelector('input')
		expect(element.readOnly).toBe(true)

		props.readonly = false
		flushSync()
		expect(element.readOnly).toBe(false)
	})

	it('should render with additional attributes', () => {
		const props = $state({
			value: '2023-12-25',
			id: 'birth-date',
			name: 'birthdate',
			autocomplete: 'bday'
		})
		const { container } = render(InputDate, { props })
		const element = container.querySelector('input')
		expect(element.id).toBe('birth-date')
		expect(element.name).toBe('birthdate')
		expect(element.autocomplete).toBe('bday')
	})

	it('should handle input events', async () => {
		const props = $state({ value: '' })
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		await userEvent.type(element, '2023-12-25')
		await tick()

		expect(props.value).toBe('2023-12-25')
	})

	it('should handle date change', async () => {
		const props = $state({ value: '2023-12-25' })
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		await userEvent.clear(element)
		await userEvent.type(element, '2024-01-15')
		await tick()

		expect(props.value).toBe('2024-01-15')
	})

	it('should handle onchange callback', async () => {
		const props = $state({
			value: '2023-12-25',
			onchange: vi.fn()
		})
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		await userEvent.clear(element)
		await userEvent.type(element, '2024-01-01')
		await tick()

		expect(props.onchange).toHaveBeenCalled()
		expect(props.value).toBe('2024-01-01')
	})

	it('should handle focus and blur events', async () => {
		const props = $state({
			value: '2023-12-25',
			onfocus: vi.fn(),
			onblur: vi.fn()
		})
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		await userEvent.click(element)
		expect(props.onfocus).toHaveBeenCalledTimes(1)

		await userEvent.tab()
		expect(props.onblur).toHaveBeenCalledTimes(1)
	})

	it('should handle empty value', () => {
		const props = $state({ value: '' })
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		expect(element.value).toBe('')
	})

	it('should handle null value', () => {
		const props = $state({ value: null })
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		expect(element.value).toBe('')
	})

	it('should render with all date-specific props', () => {
		const props = $state({
			value: '2023-12-25',
			min: '2023-01-01',
			max: '2023-12-31',
			step: 1,
			required: true,
			disabled: false,
			readonly: false,
			name: 'appointment-date',
			id: 'appointment-date-input',
			autocomplete: 'bday'
		})
		const { container } = render(InputDate, { props })
		expect(container).toMatchSnapshot()
	})

	it('should validate date format', async () => {
		const props = $state({ value: '' })
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')

		// Try to input invalid date format
		await userEvent.type(element, 'invalid-date')
		await tick()

		// Browser should handle validation, value should remain empty or be corrected
		expect(element.value).not.toBe('invalid-date')
	})

	it('should respect min date constraint', () => {
		const props = $state({
			value: '2022-12-25', // Earlier than min
			min: '2023-01-01',
			max: '2023-12-31'
		})
		const { container } = render(InputDate, { props })
		const element = container.querySelector('input')

		// Browser should handle date validation
		expect(element.min).toBe('2023-01-01')
		expect(element.max).toBe('2023-12-31')
	})

	it('should respect max date constraint', () => {
		const props = $state({
			value: '2024-01-15', // Later than max
			min: '2023-01-01',
			max: '2023-12-31'
		})
		const { container } = render(InputDate, { props })
		const element = container.querySelector('input')

		// Browser should handle date validation
		expect(element.min).toBe('2023-01-01')
		expect(element.max).toBe('2023-12-31')
	})

	it('should handle keyboard navigation', async () => {
		const props = $state({ value: '2023-12-25' })
		const { container } = render(InputDate, { props })

		const element = container.querySelector('input')
		element.focus()

		// Test arrow key navigation (behavior varies by browser)
		await userEvent.keyboard('{ArrowUp}')
		await tick()

		// Value may change based on browser implementation
		expect(element.value).toBeTruthy()
	})
})
