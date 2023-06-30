import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import CheckBox from '../src/CheckBox.svelte'

describe('CheckBox.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation CheckBox', () => {
		const { container } = render(CheckBox, { name: 'test' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle checkbox state change', async () => {
		const { getByRole } = render(CheckBox, { name: 'test' })
		const checkbox = getByRole('checkbox')

		expect(checkbox.getAttribute('aria-checked')).toBe('unchecked')
		await fireEvent.click(checkbox)
		await tick()
		expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('checked')
	})

	it('should apply custom class names', async () => {
		const { getByRole, container, component } = render(CheckBox, {
			name: 'test',
			class: 'custom-class'
		})
		expect(container).toMatchSnapshot()

		const checkbox = getByRole('checkbox')
		console.log()
		expect(Array.from(checkbox.classList)).toContain('custom-class')

		// handle class change
		component.$set({ class: 'new-class' })
		await tick()
		expect(Array.from(checkbox.classList)).toContain('new-class')
	})

	it('should render label when provided', () => {
		const { getByText } = render(CheckBox, {
			name: 'test',
			label: 'Checkbox Label'
		})
		const label = getByText('Checkbox Label')

		expect(label).toBeTruthy()
	})

	it('should render checkbox with disabled state', () => {
		const { getByRole } = render(CheckBox, { name: 'test', disabled: true })
		const checkbox = getByRole('checkbox')

		expect(Array.from(checkbox.classList)).toContain('disabled')
		expect(checkbox.getAttribute('aria-disabled')).toBe('true')
	})

	it('should render checkbox with custom status class', () => {
		const { getByRole } = render(CheckBox, { name: 'test', status: 'pass' })
		const checkbox = getByRole('checkbox')

		expect(Array.from(checkbox.classList)).toContain('pass')
	})

	it('should render checkbox with text after the icon', () => {
		const { getByRole } = render(CheckBox, { name: 'test', textAfter: true })
		const checkbox = getByRole('checkbox')

		expect(Array.from(checkbox.classList)).toContain('flex-row')
		expect(Array.from(checkbox.classList)).not.toContain('flex-row-reverse')
	})

	it('should render checkbox with text before the icon', () => {
		const { getByRole } = render(CheckBox, { name: 'test', textAfter: false })
		const checkbox = getByRole('checkbox')

		expect(Array.from(checkbox.classList)).toContain('flex-row-reverse')
		expect(Array.from(checkbox.classList)).not.toContain('flex-row')
	})
})
