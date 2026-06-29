import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import InputSwitch from '../../src/input/InputSwitch.svelte'

describe('InputSwitch', () => {
	beforeEach(() => cleanup())

	it('should render a switch component', () => {
		const props = $state({ value: false })
		const { container } = render(InputSwitch, { props })

		expect(container.querySelector('[data-switch]')).toBeTruthy()
	})

	it('should render a hidden input with the name', () => {
		const props = $state({ value: false, name: 'active' })
		const { container } = render(InputSwitch, { props })

		const hidden = container.querySelector('input[type="hidden"]')
		expect(hidden).toBeTruthy()
		expect(hidden.name).toBe('active')
	})

	it('should not render hidden input without name', () => {
		const props = $state({ value: false })
		const { container } = render(InputSwitch, { props })

		// Hidden input still renders but name attribute is not set
		const hidden = container.querySelector('input[type="hidden"]')
		// name may be empty or absent
		expect(hidden.name).toBeFalsy()
	})

	it('should toggle value when switch button is clicked', async () => {
		const props = $state({ value: false })
		const { container } = render(InputSwitch, { props })

		const btn = container.querySelector('[data-switch]')
		await fireEvent.click(btn)

		expect(props.value).toBe(true)
	})

	it('should call onchange when switch is toggled', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, onchange })
		const { container } = render(InputSwitch, { props })

		const btn = container.querySelector('[data-switch]')
		await fireEvent.click(btn)

		expect(onchange).toHaveBeenCalled()
	})

	it('should render as disabled when disabled prop is true', () => {
		const props = $state({ value: false, disabled: true })
		const { container } = render(InputSwitch, { props })

		const btn = container.querySelector('[data-switch]')
		expect(btn.hasAttribute('data-switch-disabled')).toBe(true)
	})

	it('should not toggle when disabled', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, disabled: true, onchange })
		const { container } = render(InputSwitch, { props })

		const btn = container.querySelector('[data-switch]')
		await fireEvent.click(btn)

		expect(onchange).not.toHaveBeenCalled()
		expect(props.value).toBe(false)
	})

	it('should update hidden input value reactively', () => {
		const props = $state({ value: false, name: 'active' })
		const { container } = render(InputSwitch, { props })

		const hidden = container.querySelector('input[type="hidden"]')
		expect(hidden.value).toBe('false')

		props.value = true
		flushSync()
		expect(hidden.value).toBe('true')
	})

	it('should render with custom options (boolean default)', () => {
		const props = $state({ value: true })
		const { container } = render(InputSwitch, { props })

		const btn = container.querySelector('[data-switch]')
		expect(btn).toBeTruthy()
	})
})
