import { describe, expect, it, beforeEach, vi, afterAll } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import DropDown from '../src/DropDown.svelte'

describe('DropDown.svelte', () => {
	beforeEach(() => {
		cleanup()
	})
	afterAll(() => vi.resetAllMocks())

	it('should render empty text', async () => {
		const { container } = render(DropDown, {
			props: { items: [], fields: {} }
		})
		const button = container.querySelector('.dropdown > button')
		expect(button.textContent.trim()).toBe('')
	})

	it('should render title', async () => {
		const { container } = render(DropDown, {
			props: { items: [], fields: {}, title: 'Select a value' }
		})
		const button = container.querySelector('.dropdown > button')
		expect(button.querySelector('p').textContent.trim()).toBe('Select a value')
	})

	it('should toggle open state when button is clicked', async () => {
		const { container } = render(DropDown, {
			props: { items: [], fields: {} }
		})

		expect(container).toMatchSnapshot()
		const button = container.querySelector('.dropdown > button')

		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)
		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(false)
	})
	it('should close the dropdown when focus is lost', async () => {
		const { container } = render(DropDown, {
			props: { items: [], fields: {} }
		})
		const button = container.querySelector('.dropdown > button')
		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)
		await fireEvent.blur(button.parentNode)
		expect(button.parentNode.classList.contains('open')).toBe(false)
	})
	it('should dispatch a change event when an item is selected', async () => {
		let selected = null
		const items = [{ text: 'foo' }, { text: 'bar' }]

		const mockOnChange = vi.fn().mockImplementation((event) => {
			// console.log(event.detail, selected)
			expect(event.detail).toEqual(selected)
		})
		const { container, component } = render(DropDown, {
			props: {
				items
			}
		})

		component.$on('change', mockOnChange)
		const button = container.querySelector('.dropdown > button')
		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)

		container
			.querySelectorAll('.dropdown list item')
			.forEach(async (item, index) => {
				selected = { item: items[index], indices: [index] }
				await fireEvent.click(item)
				expect(component.$$.ctx[component.$$.props.value]).toEqual(
					selected.item
				)
				expect(mockOnChange).toHaveBeenCalled()
			})
	})
})
