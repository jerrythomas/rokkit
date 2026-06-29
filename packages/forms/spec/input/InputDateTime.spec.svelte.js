import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputDateTime from '../../src/input/InputDateTime.svelte'

describe('InputDateTime', () => {
	beforeEach(() => cleanup())

	it('should render an input of type datetime-local', () => {
		const props = $state({ value: '2023-12-25T10:30' })
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('datetime-local')
		expect(el.value).toBe('2023-12-25T10:30')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '2023-12-25T10:30' })
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		props.value = '2024-01-01T09:00'
		flushSync()
		expect(el.value).toBe('2024-01-01T09:00')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '2023-12-25T10:30', disabled: true })
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: '2023-12-25T10:30', readonly: true })
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with min and max', () => {
		const props = $state({
			value: '2023-12-25T10:30',
			min: '2023-01-01T00:00',
			max: '2023-12-31T23:59'
		})
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		expect(el.min).toBe('2023-01-01T00:00')
		expect(el.max).toBe('2023-12-31T23:59')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'dt', id: 'dt-input' })
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('dt')
		expect(el.id).toBe('dt-input')
	})

	it('should call onchange with new value when datetime changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '2023-12-25T10:30', onchange })
		const { container } = render(InputDateTime, { props })

		const el = container.querySelector('input')
		el.value = '2024-06-15T14:00'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('2024-06-15T14:00')
		expect(props.value).toBe('2024-06-15T14:00')
	})
})
