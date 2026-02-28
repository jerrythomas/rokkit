import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import DisplaySection from '../../src/display/DisplaySection.svelte'

describe('DisplaySection', () => {
	const sampleData = { name: 'Alice', age: 30, role: 'Engineer' }
	const sampleFields = [
		{ key: 'name', label: 'Full Name' },
		{ key: 'age', label: 'Age', format: 'number' },
		{ key: 'role', label: 'Role' }
	]

	it('should render section with data-display-section attribute', () => {
		const { container } = render(DisplaySection, {
			props: { data: sampleData, fields: sampleFields }
		})
		expect(container.querySelector('[data-display-section]')).toBeTruthy()
	})

	it('should render all fields', () => {
		const { container } = render(DisplaySection, {
			props: { data: sampleData, fields: sampleFields }
		})
		const fieldEls = container.querySelectorAll('[data-display-field]')
		expect(fieldEls).toHaveLength(3)
	})

	it('should render labels from field definitions', () => {
		const { container } = render(DisplaySection, {
			props: { data: sampleData, fields: sampleFields }
		})
		const labels = container.querySelectorAll('[data-display-label]')
		expect(labels[0].textContent).toBe('Full Name')
		expect(labels[1].textContent).toBe('Age')
		expect(labels[2].textContent).toBe('Role')
	})

	it('should render values from data', () => {
		const { container } = render(DisplaySection, {
			props: { data: sampleData, fields: sampleFields }
		})
		const values = container.querySelectorAll('[data-display-value]')
		expect(values[0].textContent).toBe('Alice')
		expect(values[2].textContent).toBe('Engineer')
	})

	it('should fall back to key as label when label is not provided', () => {
		const { container } = render(DisplaySection, {
			props: { data: { x: 1 }, fields: [{ key: 'x' }] }
		})
		expect(container.querySelector('[data-display-label]').textContent).toBe('x')
	})

	it('should render title when provided', () => {
		const { container } = render(DisplaySection, {
			props: { data: sampleData, fields: sampleFields, title: 'User Info' }
		})
		const title = container.querySelector('[data-display-title]')
		expect(title).toBeTruthy()
		expect(title.textContent).toBe('User Info')
	})

	it('should not render title when not provided', () => {
		const { container } = render(DisplaySection, {
			props: { data: sampleData, fields: sampleFields }
		})
		expect(container.querySelector('[data-display-title]')).toBeNull()
	})

	it('should handle empty fields array', () => {
		const { container } = render(DisplaySection, {
			props: { data: sampleData, fields: [] }
		})
		expect(container.querySelectorAll('[data-display-field]')).toHaveLength(0)
	})

	it('should handle missing data keys gracefully', () => {
		const { container } = render(DisplaySection, {
			props: { data: {}, fields: [{ key: 'missing', label: 'Missing' }] }
		})
		// DisplayValue renders '—' for undefined
		expect(container.querySelector('[data-display-value]').textContent).toBe('—')
	})
})
