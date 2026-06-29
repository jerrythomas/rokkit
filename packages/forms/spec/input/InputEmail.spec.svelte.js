import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputEmail from '../../src/input/InputEmail.svelte'

describe('InputEmail', () => {
	beforeEach(() => cleanup())

	it('should render an input of type email', () => {
		const props = $state({ value: 'user@example.com' })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('email')
		expect(el.value).toBe('user@example.com')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '' })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		props.value = 'new@example.com'
		flushSync()
		expect(el.value).toBe('new@example.com')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '', disabled: true })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: 'user@example.com', readonly: true })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with placeholder', () => {
		const props = $state({ value: '', placeholder: 'Enter email' })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		expect(el.placeholder).toBe('Enter email')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'email', id: 'email-input' })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('email')
		expect(el.id).toBe('email-input')
	})

	it('should render with maxlength and pattern', () => {
		const props = $state({ value: '', maxlength: 100, pattern: '.+@.+' })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		expect(el.maxLength).toBe(100)
		expect(el.pattern).toBe('.+@.+')
	})

	it('should call onchange with new value when email changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '', onchange })
		const { container } = render(InputEmail, { props })

		const el = container.querySelector('input')
		el.value = 'updated@example.com'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('updated@example.com')
		expect(props.value).toBe('updated@example.com')
	})
})
