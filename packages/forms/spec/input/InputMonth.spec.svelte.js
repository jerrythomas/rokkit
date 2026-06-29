import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputMonth from '../../src/input/InputMonth.svelte'

describe('InputMonth', () => {
	beforeEach(() => cleanup())

	it('should render an input of type month', () => {
		const props = $state({ value: '2023-12' })
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('month')
		expect(el.value).toBe('2023-12')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '2023-01' })
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		props.value = '2024-06'
		flushSync()
		expect(el.value).toBe('2024-06')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '2023-12', disabled: true })
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: '2023-12', readonly: true })
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with min and max', () => {
		const props = $state({
			value: '2023-06',
			min: '2023-01',
			max: '2023-12'
		})
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		expect(el.min).toBe('2023-01')
		expect(el.max).toBe('2023-12')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'month', id: 'month-input' })
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('month')
		expect(el.id).toBe('month-input')
	})

	it('should call onchange with new value when month changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '2023-01', onchange })
		const { container } = render(InputMonth, { props })

		const el = container.querySelector('input')
		el.value = '2024-03'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('2024-03')
		expect(props.value).toBe('2024-03')
	})
})
