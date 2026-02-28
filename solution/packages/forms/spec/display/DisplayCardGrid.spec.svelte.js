import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import DisplayCardGrid from '../../src/display/DisplayCardGrid.svelte'

describe('DisplayCardGrid', () => {
	const sampleData = [
		{ name: 'Alice', role: 'Engineer' },
		{ name: 'Bob', role: 'Designer' },
		{ name: 'Carol', role: 'Manager' }
	]
	const sampleFields = [
		{ key: 'name', label: 'Name' },
		{ key: 'role', label: 'Role' }
	]

	it('should render with data-display-cards attribute', () => {
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields }
		})
		expect(container.querySelector('[data-display-cards]')).toBeTruthy()
	})

	it('should render a card for each data item', () => {
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields }
		})
		expect(container.querySelectorAll('[data-display-card]')).toHaveLength(3)
	})

	it('should render fields within each card', () => {
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields }
		})
		// 3 cards × 2 fields = 6 field elements
		expect(container.querySelectorAll('[data-display-field]')).toHaveLength(6)
	})

	it('should render title when provided', () => {
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields, title: 'Team' }
		})
		expect(container.querySelector('[data-display-title]').textContent).toBe('Team')
	})

	it('should set data-selectable when select is provided', () => {
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields, select: 'one' }
		})
		expect(
			container.querySelector('[data-display-cards]').hasAttribute('data-selectable')
		).toBe(true)
	})

	it('should not set data-selectable when select is not provided', () => {
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields }
		})
		expect(
			container.querySelector('[data-display-cards]').hasAttribute('data-selectable')
		).toBe(false)
	})

	it('should handle single selection', async () => {
		const onselect = vi.fn()
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields, select: 'one', onselect }
		})

		const cards = container.querySelectorAll('[data-display-card]')
		await fireEvent.click(cards[1])

		expect(onselect).toHaveBeenCalledWith(sampleData[1], sampleData[1])
		expect(cards[1].hasAttribute('data-selected')).toBe(true)
	})

	it('should handle multi selection', async () => {
		const onselect = vi.fn()
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields, select: 'many', onselect }
		})

		const cards = container.querySelectorAll('[data-display-card]')
		await fireEvent.click(cards[0])
		await fireEvent.click(cards[2])

		expect(onselect).toHaveBeenCalledTimes(2)
		// After second click, both 0 and 2 selected
		const lastCall = onselect.mock.calls[1]
		expect(lastCall[0]).toHaveLength(2)
		expect(lastCall[1]).toEqual(sampleData[2])
	})

	it('should toggle selection in multi mode', async () => {
		const onselect = vi.fn()
		const { container } = render(DisplayCardGrid, {
			props: { data: sampleData, fields: sampleFields, select: 'many', onselect }
		})

		const cards = container.querySelectorAll('[data-display-card]')
		await fireEvent.click(cards[0])
		await fireEvent.click(cards[0]) // deselect

		const lastCall = onselect.mock.calls[1]
		expect(lastCall[0]).toHaveLength(0) // empty selection
	})

	it('should handle empty data', () => {
		const { container } = render(DisplayCardGrid, {
			props: { data: [], fields: sampleFields }
		})
		expect(container.querySelectorAll('[data-display-card]')).toHaveLength(0)
	})
})
