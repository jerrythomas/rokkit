import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'

import InputCheckbox from '../../src/input/InputCheckbox.svelte'

describe('InputCheckbox', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: true })
		const { container } = render(InputCheckbox, { props })
		expect(container).toMatchSnapshot()

		props.value = false
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			disabled: true
		})
		const { container } = render(InputCheckbox, { props })
		const element = container.querySelector('input')
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			required: true
		})
		const { container } = render(InputCheckbox, { props })
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should update value on click', async () => {
		const props = $state({ value: true, onchange: vi.fn() })
		const { container } = render(InputCheckbox, { props })

		await fireEvent.click(container.querySelector('input'))
		expect(props.value).toBe(false)
		expect(props.onchange).toHaveBeenCalledTimes(1)

		await fireEvent.click(container.querySelector('input'))
		expect(props.value).toBe(true)
		expect(props.onchange).toHaveBeenCalledTimes(2)
	})

	it('should update value on space key', async () => {
		const props = $state({ value: true, onfocus: vi.fn(), onchange: vi.fn() })
		const { container } = render(InputCheckbox, { props })

		const element = container.querySelector('input')
		await fireEvent.focus(element)
		expect(props.onfocus).toHaveBeenCalledTimes(1)

		await userEvent.type(element, '{space}')
		await tick()
		expect(element.checked).toBe(false)
		expect(props.value).toBe(false)
		expect(props.onchange).toHaveBeenCalledTimes(1)

		await userEvent.type(element, '{space}')
		expect(element.checked).toBe(true)
		expect(props.value).toBe(true)
	})


	// ─── Icon-variant toggle (non-default variants render a clickable icon) ─────

	it('clicking the icon toggles the value and fires onchange', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, variant: 'icon', onchange })
		const { container } = render(InputCheckbox, { props })
		await fireEvent.click(container.querySelector('[data-checkbox-icon]'))
		expect(onchange).toHaveBeenCalledWith(true)
	})

	it.each(['Enter', ' '])('%s on the icon toggles the value', async (key) => {
		const onchange = vi.fn()
		const props = $state({ value: false, variant: 'icon', onchange })
		const { container } = render(InputCheckbox, { props })
		await fireEvent.keyDown(container.querySelector('[data-checkbox-icon]'), { key })
		expect(onchange).toHaveBeenCalledWith(true)
	})

	it('other keys on the icon do nothing', async () => {
		const onchange = vi.fn()
		const props = $state({ value: false, variant: 'icon', onchange })
		const { container } = render(InputCheckbox, { props })
		await fireEvent.keyDown(container.querySelector('[data-checkbox-icon]'), { key: 'x' })
		expect(onchange).not.toHaveBeenCalled()
	})

	it('toggling from true goes back to false', async () => {
		const onchange = vi.fn()
		const props = $state({ value: true, variant: 'icon', onchange })
		const { container } = render(InputCheckbox, { props })
		await fireEvent.click(container.querySelector('[data-checkbox-icon]'))
		expect(onchange).toHaveBeenCalledWith(false)
	})
})
