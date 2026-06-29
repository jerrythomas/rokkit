import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputTime from '../../src/input/InputTime.svelte'

describe('InputTime', () => {
	beforeEach(() => cleanup())

	it('should render an input of type time', () => {
		const props = $state({ value: '10:30' })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('time')
		expect(el.value).toBe('10:30')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '08:00' })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		props.value = '14:45'
		flushSync()
		expect(el.value).toBe('14:45')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '10:00', disabled: true })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: '10:30', readonly: true })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with min and max', () => {
		const props = $state({ value: '10:00', min: '08:00', max: '18:00' })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		expect(el.min).toBe('08:00')
		expect(el.max).toBe('18:00')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'start-time', id: 'time-input' })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('start-time')
		expect(el.id).toBe('time-input')
	})

	it('should call onchange with new value when time changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '10:00', onchange })
		const { container } = render(InputTime, { props })

		const el = container.querySelector('input')
		el.value = '14:30'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('14:30')
		expect(props.value).toBe('14:30')
	})
})
