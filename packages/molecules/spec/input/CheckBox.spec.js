import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Checkbox from '../../src/input/CheckBox.svelte'

describe('Checkbox.svelte', () => {
	beforeEach(() => cleanup())

	it('should render checkbox', () => {
		const { container } = render(Checkbox, { name: 'test' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle checkbox state change', async () => {
		const { getByRole } = render(Checkbox, { name: 'test' })
		const checkbox = getByRole('checkbox')

		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')
		await fireEvent.click(checkbox)
		await tick()
		expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('checked')
	})

	it('should apply custom class names', async () => {
		const { getByRole, container, component } = render(Checkbox, {
			name: 'test',
			class: 'custom-class'
		})
		expect(container).toMatchSnapshot()

		const checkbox = getByRole('checkbox')
		expect(Array.from(checkbox.classList)).toContain('custom-class')

		// handle class change
		component.$set({ class: 'new-class' })
		await tick()
		expect(Array.from(checkbox.classList)).toContain('new-class')
	})

	it('should render checkbox with disabled state', () => {
		const { getByRole } = render(Checkbox, { name: 'test', readOnly: true })
		const checkbox = getByRole('checkbox')

		expect(Array.from(checkbox.classList)).toContain('disabled')
		expect(checkbox.getAttribute('aria-disabled')).toBe('true')
	})

	it('should handle click events', async () => {
		const { container } = render(Checkbox, { name: 'test', value: null })
		const checkbox = container.querySelector('checkbox')
		expect(checkbox.getAttribute('aria-checked')).toBe('unknown')

		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('checked')

		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')
	})

	it('should handle clicks without changing value when disabled', async () => {
		const { container, component } = render(Checkbox, {
			name: 'test',
			readOnly: true
		})
		const checkbox = container.querySelector('checkbox')
		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')

		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')

		component.$set({ readOnly: false })
		await fireEvent.click(checkbox)
		await tick()
		expect(checkbox.getAttribute('aria-checked')).toBe('checked')
	})
})
