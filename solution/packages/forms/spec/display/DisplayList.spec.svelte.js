import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import DisplayList from '../../src/display/DisplayList.svelte'

describe('DisplayList', () => {
	const sampleData = [
		{ name: 'Alice', score: 95 },
		{ name: 'Bob', score: 87 }
	]
	const sampleFields = [
		{ key: 'name', label: 'Name' },
		{ key: 'score', label: 'Score' }
	]

	it('should render list with data-display-list attribute', () => {
		const { container } = render(DisplayList, {
			props: { data: sampleData, fields: sampleFields }
		})
		expect(container.querySelector('[data-display-list]')).toBeTruthy()
	})

	it('should render a list item for each data entry', () => {
		const { container } = render(DisplayList, {
			props: { data: sampleData, fields: sampleFields }
		})
		const items = container.querySelectorAll('[data-display-list-item]')
		expect(items).toHaveLength(2)
	})

	it('should render fields for each item', () => {
		const { container } = render(DisplayList, {
			props: { data: sampleData, fields: sampleFields }
		})
		const labels = container.querySelectorAll('[data-display-label]')
		// 2 fields × 2 items = 4 labels
		expect(labels).toHaveLength(4)
	})

	it('should render values from data items', () => {
		const { container } = render(DisplayList, {
			props: { data: sampleData, fields: sampleFields }
		})
		const values = container.querySelectorAll('[data-display-value]')
		expect(values[0].textContent).toBe('Alice')
		expect(values[1].textContent).toBe('95')
	})

	it('should render title when provided', () => {
		const { container } = render(DisplayList, {
			props: { data: sampleData, fields: sampleFields, title: 'Scores' }
		})
		expect(container.querySelector('[data-display-title]').textContent).toBe('Scores')
	})

	it('should not render title when not provided', () => {
		const { container } = render(DisplayList, {
			props: { data: sampleData, fields: sampleFields }
		})
		expect(container.querySelector('[data-display-title]')).toBeNull()
	})

	it('should handle empty data array', () => {
		const { container } = render(DisplayList, {
			props: { data: [], fields: sampleFields }
		})
		expect(container.querySelectorAll('[data-display-list-item]')).toHaveLength(0)
	})
})
