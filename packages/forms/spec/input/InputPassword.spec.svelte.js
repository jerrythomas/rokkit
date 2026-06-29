import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputPassword from '../../src/input/InputPassword.svelte'

describe('InputPassword', () => {
	beforeEach(() => cleanup())

	it('should render an input of type password', () => {
		const props = $state({ value: 'secret' })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('password')
		expect(el.value).toBe('secret')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '' })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		props.value = 'newpassword'
		flushSync()
		expect(el.value).toBe('newpassword')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '', disabled: true })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: 'secret', readonly: true })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with placeholder', () => {
		const props = $state({ value: '', placeholder: 'Enter password' })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		expect(el.placeholder).toBe('Enter password')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'password', id: 'pw-input' })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('password')
		expect(el.id).toBe('pw-input')
	})

	it('should render with maxlength and minlength', () => {
		const props = $state({ value: '', maxlength: 50, minlength: 8 })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		expect(el.maxLength).toBe(50)
		expect(el.minLength).toBe(8)
	})

	it('should call onchange with new value when password changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '', onchange })
		const { container } = render(InputPassword, { props })

		const el = container.querySelector('input')
		el.value = 'mynewpassword'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('mynewpassword')
		expect(props.value).toBe('mynewpassword')
	})
})
