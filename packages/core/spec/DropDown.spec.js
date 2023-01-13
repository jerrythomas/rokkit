import { describe, expect, it, beforeEach, vi, afterAll } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import DropDown from '../src/DropDown.svelte'

describe('DropDown.svelte', () => {
	beforeEach(() => {
		cleanup()
		// global.CustomEvent = vi.fn().mockImplementation((name, params) => ({
		// 	name,
		// 	params
		// }))
	})
	afterAll(() => vi.resetAllMocks())

	it('should render the placeholder text by default', async () => {
		const { container } = render(DropDown, {
			props: { items: [], fields: {} }
		})
		const button = container.querySelector('.dropdown > button')
		expect(button.textContent.trim()).toBe('Select a value')
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
		const mockOnChange = vi.fn()
		const { container, component } = render(DropDown, {
			props: {
				items: [{ value: 'foo' }],
				fields: {}
			}
		})
		component.$on('change', mockOnChange)

		const button = container.querySelector('.dropdown > button')
		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)
		const listItem = container.querySelector(
			'.dropdown > .menu > .list > .item'
		)
		await fireEvent.click(listItem)
		expect(mockOnChange).toHaveBeenCalled()
		// todo: check the data passed in the event
	})
})
