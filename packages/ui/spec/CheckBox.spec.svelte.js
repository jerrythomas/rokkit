import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import CheckBox from '../src/CheckBox.svelte'

describe('CheckBox', () => {
	const ROOT_ELEMENT = 'rk-checkbox'
	beforeEach(() => cleanup())

	it('should render checkbox', () => {
		const props = $state({ name: 'test' })
		const { container } = render(CheckBox, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle checkbox state change', async () => {
		const props = $state({ name: 'state' })
		const { container } = render(CheckBox, { props })
		const checkbox = container.querySelector(ROOT_ELEMENT)

		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')
		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('checked')
	})

	it('should apply custom class names', () => {
		const props = $state({
			name: 'test',
			class: 'custom-class'
		})
		const { container } = render(CheckBox, { props })
		expect(container).toMatchSnapshot()

		const checkbox = container.querySelector(ROOT_ELEMENT)
		expect(Array.from(checkbox.classList)).toContain('custom-class')

		props.class = 'new-class'
		flushSync()
		expect(Array.from(checkbox.classList)).toContain('new-class')
	})

	it('should render checkbox with disabled state', () => {
		const { container } = render(CheckBox, { name: 'test', readOnly: true })
		const checkbox = container.querySelector(ROOT_ELEMENT)

		expect(Array.from(checkbox.classList)).toContain('disabled')
		expect(checkbox.getAttribute('aria-disabled')).toBe('true')
	})

	it('should handle click events', async () => {
		const { container } = render(CheckBox, { name: 'test', value: null })
		const checkbox = container.querySelector(ROOT_ELEMENT)

		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('checked')

		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')
	})

	it('should handle clicks without changing value when disabled', async () => {
		const props = $state({
			name: 'test',
			readOnly: true
		})
		const { container } = render(CheckBox, { props })
		const checkbox = container.querySelector(ROOT_ELEMENT)

		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')

		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')

		props.readOnly = false
		flushSync()
		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('checked')
	})
})
