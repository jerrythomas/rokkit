import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputTel from '../../src/input/InputTel.svelte'

describe('InputTel', () => {
	beforeEach(() => cleanup())

	it('should render an input of type tel', () => {
		const props = $state({ value: '555-1234' })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('tel')
		expect(el.value).toBe('555-1234')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '' })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		props.value = '555-9999'
		flushSync()
		expect(el.value).toBe('555-9999')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '', disabled: true })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: '555-1234', readonly: true })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with placeholder', () => {
		const props = $state({ value: '', placeholder: '+1 (555) 000-0000' })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		expect(el.placeholder).toBe('+1 (555) 000-0000')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'phone', id: 'phone-input' })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('phone')
		expect(el.id).toBe('phone-input')
	})

	it('should render with pattern', () => {
		const props = $state({ value: '', pattern: '[0-9]{3}-[0-9]{4}' })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		expect(el.pattern).toBe('[0-9]{3}-[0-9]{4}')
	})

	it('should call onchange with new value when tel changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '', onchange })
		const { container } = render(InputTel, { props })

		const el = container.querySelector('input')
		el.value = '555-0000'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('555-0000')
		expect(props.value).toBe('555-0000')
	})
})
