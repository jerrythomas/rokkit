import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputUrl from '../../src/input/InputUrl.svelte'

describe('InputUrl', () => {
	beforeEach(() => cleanup())

	it('should render an input of type url', () => {
		const props = $state({ value: 'https://example.com' })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('url')
		expect(el.value).toBe('https://example.com')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '' })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		props.value = 'https://new.example.com'
		flushSync()
		expect(el.value).toBe('https://new.example.com')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '', disabled: true })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '', required: true })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render as readonly', () => {
		const props = $state({ value: 'https://example.com', readonly: true })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		expect(el.readOnly).toBe(true)
	})

	it('should render with placeholder', () => {
		const props = $state({ value: '', placeholder: 'https://' })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		expect(el.placeholder).toBe('https://')
	})

	it('should render with name and id', () => {
		const props = $state({ value: '', name: 'website', id: 'url-input' })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('website')
		expect(el.id).toBe('url-input')
	})

	it('should render with pattern', () => {
		const props = $state({ value: '', pattern: 'https://.*' })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		expect(el.pattern).toBe('https://.*')
	})

	it('should call onchange with new value when url changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '', onchange })
		const { container } = render(InputUrl, { props })

		const el = container.querySelector('input')
		el.value = 'https://updated.com'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('https://updated.com')
		expect(props.value).toBe('https://updated.com')
	})
})
