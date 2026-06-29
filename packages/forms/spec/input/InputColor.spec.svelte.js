import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputColor from '../../src/input/InputColor.svelte'

describe('InputColor', () => {
	beforeEach(() => cleanup())

	it('should render an input of type color', () => {
		const props = $state({ value: '#ff0000' })
		const { container } = render(InputColor, { props })

		const el = container.querySelector('input')
		expect(el).toBeTruthy()
		expect(el.type).toBe('color')
		expect(el.value).toBe('#ff0000')
	})

	it('should reflect value changes', () => {
		const props = $state({ value: '#ff0000' })
		const { container } = render(InputColor, { props })

		const el = container.querySelector('input')
		props.value = '#00ff00'
		flushSync()
		expect(el.value).toBe('#00ff00')
	})

	it('should render as disabled', () => {
		const props = $state({ value: '#000000', disabled: true })
		const { container } = render(InputColor, { props })

		const el = container.querySelector('input')
		expect(el.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(el.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({ value: '#000000', required: true })
		const { container } = render(InputColor, { props })

		const el = container.querySelector('input')
		expect(el.required).toBe(true)
	})

	it('should render with name and id', () => {
		const props = $state({ value: '#000000', name: 'color', id: 'color-input' })
		const { container } = render(InputColor, { props })

		const el = container.querySelector('input')
		expect(el.name).toBe('color')
		expect(el.id).toBe('color-input')
	})

	it('should call onchange with new value when color changes', () => {
		const onchange = vi.fn()
		const props = $state({ value: '#ff0000', onchange })
		const { container } = render(InputColor, { props })

		const el = container.querySelector('input')
		el.value = '#0000ff'
		fireEvent.change(el)

		expect(onchange).toHaveBeenCalledWith('#0000ff')
		expect(props.value).toBe('#0000ff')
	})
})
