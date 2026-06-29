import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputWeek from '../../src/input/InputWeek.svelte'

describe('InputWeek', () => {
	beforeEach(() => cleanup())

	it('should render an input of type week', () => {
		const props = $state({ value: '2023-W52' })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('week')
		expect(el.value).toBe('2023-W52')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '2023-W01' })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		props.value = '2024-W10'
		flushSync()
		expect(el.value).toBe('2024-W10')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '2023-W52', disabled: true })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: '2023-W52', readonly: true })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with min and max', () => {
		const props = $state({ value: '2023-W26', min: '2023-W01', max: '2023-W52' })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		expect(el.min).toBe('2023-W01')
		expect(el.max).toBe('2023-W52')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'week', id: 'week-input' })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('week')
		expect(el.id).toBe('week-input')
	})

	it('should call onchange with new value when week changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '2023-W01', onchange })
		const { container } = render(InputWeek, { props })

		const el = container.querySelector('input')
		el.value = '2024-W20'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('2024-W20')
		expect(props.value).toBe('2024-W20')
	})
})
