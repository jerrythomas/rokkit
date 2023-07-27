import { describe, expect, it, beforeEach, vi, afterAll } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import DropDown from '../src/DropDown.svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'
import MockItem from './mocks/MockItem.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('DropDown.svelte', () => {
	const events = ['change']
	let handlers = {}

	beforeEach(() => {
		cleanup()
		events.map((e) => (handlers[e] = vi.fn()))
	})
	afterAll(() => vi.resetAllMocks())

	it('should render empty text', async () => {
		const { container } = render(DropDown, {
			props: { options: [], fields: {} }
		})
		const button = container.querySelector('drop-down > button')
		expect(button.textContent.trim()).toBe('')
	})

	it('should render using icon only', async () => {
		const { container } = render(DropDown, {
			props: { options: ['One', 'Two', 'Three'], fields: {}, icon: 'theme' }
		})
		const button = container.querySelector('drop-down > button')
		expect(button).toMatchSnapshot()
		await fireEvent.click(button)
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render title', async () => {
		const { container, component } = render(DropDown, {
			props: { options: [], fields: {}, title: 'Select a value' }
		})
		const button = container.querySelector('drop-down > button')
		expect(button.querySelector('p').textContent.trim()).toBe('Select a value')
		component.$set({ icon: 'theme' })
		await tick()
		expect(button).toMatchSnapshot()
		expect(button.querySelector('icon i').getAttribute('class')).toBe('theme')
		component.$set({ icon: 'other' })
		await tick()
		expect(button).toMatchSnapshot()
		component.$set({ title: 'Select a different value' })
		await tick()
		expect(button.querySelector('p').textContent.trim()).toBe(
			'Select a different value'
		)
	})

	it('should toggle open state when button is clicked', async () => {
		const { container } = render(DropDown, {
			props: { options: [], fields: {} }
		})

		expect(container).toMatchSnapshot()
		const button = container.querySelector('drop-down > button')

		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)
		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(false)
	})

	it('should close the dropdown when focus is lost', async () => {
		const { container } = render(DropDown, {
			props: { options: [], fields: {} }
		})
		const button = container.querySelector('drop-down > button')
		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)
		await fireEvent.blur(button.parentNode)
		expect(button.parentNode.classList.contains('open')).toBe(false)
	})

	it('should dispatch a change event when an item is selected', async () => {
		let selected = null
		const options = [{ text: 'foo' }, { text: 'bar' }]

		const { container, component } = render(DropDown, {
			props: {
				options
			}
		})

		component.$on('change', handlers.change)
		const button = container.querySelector('drop-down > button')
		await fireEvent.click(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)

		container
			.querySelectorAll('drop-down list item')
			.forEach(async (item, index) => {
				selected = { item: options[index], indices: [index] }
				await fireEvent.click(item)
				expect(getPropertyValue(component, 'value')).toEqual(selected.item)
				expect(handlers.change).toHaveBeenCalled()
				expect(handlers.change).toHaveBeenDispatchedWith(selected)
			})
	})

	it('should render string array', async () => {
		const { container, component } = render(DropDown, {
			options: ['a', 'b', 'c']
		})
		expect(container).toBeTruthy()
		await fireEvent.focus(container.querySelector('drop-down'))
		await tick()
		expect(container).toMatchSnapshot()
		let items = container.querySelectorAll('drop-down list item')
		expect(items.length).toEqual(3)
		await fireEvent.click(items[1])
		await tick()
		expect(container).toMatchSnapshot()
		await fireEvent.blur(container.querySelector('drop-down'))
		component.$set({ options: ['x', 'y', 'z'], icon: 'theme' })
		await fireEvent.focus(container.querySelector('drop-down'))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using field mapping', async () => {
		const { container } = render(DropDown, {
			options: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('drop-down '))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using custom mapping', async () => {
		const options = [{ num: 1 }, { num: 2 }, { num: 3 }]
		const { container } = render(DropDown, {
			options,
			value: options[1],
			fields: { text: 'num' }
		})
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('drop-down '))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using default component, when invalid component is provided', async () => {
		const options = [{ num: 1 }, { num: 2 }, { num: 3 }]
		const { container } = render(DropDown, {
			options,
			value: options[1],
			fields: { text: 'num', component: 'num' }
		})
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('drop-down '))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', async () => {
		const { container, component } = render(DropDown, {
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		let classes = Array.from(container.querySelector('drop-down').classList)

		expect(classes).toContain('myClass')
		component.$set({ class: 'myClass2' })
		await tick()
		classes = Array.from(container.querySelector('drop-down').classList)
		expect(classes).not.toContain('myClass')
		expect(classes).toContain('myClass2')
	})

	it('should render items using custom component', async () => {
		const options = [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }]
		const { container, component } = render(DropDown, {
			options,
			fields: { text: 'num' },
			using: { custom: MockItem },
			value: options[0]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		const item = container.querySelector('drop-down ')
		await fireEvent.click(item)
		await tick()
		expect(container).toMatchSnapshot()

		component.$set({ using: { default: MockItem, custom: MockItem } })
		await tick()
		expect(container).toMatchSnapshot()
	})

	// it('should emit the change event when the value changes', async () => {
	// 	const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
	// 	const { container, component } = render(DropDown, {
	// 		options: options
	// 	})

	// 	Object.keys(handlers).map((e) => component.$on(e, handlers[e]))

	// 	const select = container.querySelector('drop-down ')
	// 	await fireEvent.click(select)
	// 	await tick()
	// 	expect(container).toMatchSnapshot()

	// 	const elements = container.querySelectorAll('drop-down list item')
	// 	await fireEvent.click(elements[1])
	// 	await tick()
	// 	expect(getPropertyValue(component, 'value')).toEqual(options[1])
	// 	expect(handlers.select).toHaveBeenCalled()
	// 	expect(handlers.change).toHaveBeenCalled()
	// 	expect(handlers.change).toHaveBeenDispatchedWith(options[1])
	// 	expect(handlers.select).toHaveBeenDispatchedWith(options[1])
	// 	await tick()
	// 	const classes = Array.from(
	// 		container.querySelector('drop-down').classList
	// 	)
	// 	expect(classes).not.toContain('open')
	// })

	it('should open/close drop down on click and blur', async () => {
		const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		const { container, component } = render(DropDown, {
			options: options,
			value: options[1]
		})

		Object.keys(handlers).map((e) => component.$on(e, handlers[e]))

		const wrapper = container.querySelector('drop-down')
		// ensure that the drop down is closed
		await fireEvent.blur(wrapper)
		await tick()
		await fireEvent.click(wrapper.querySelector('button'))
		await tick()
		let classes = Array.from(wrapper.classList)
		expect(classes).toContain('open')
		expect(wrapper).toMatchSnapshot()

		await fireEvent.blur(wrapper)
		await tick()
		classes = Array.from(wrapper.classList)
		expect(classes).not.toContain('open')
		expect(wrapper).toMatchSnapshot()
	})

	it('should close drop down on escape key', async () => {
		const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		const { container, component } = render(DropDown, {
			options: options,
			value: options[1]
		})

		Object.keys(handlers).map((e) => component.$on(e, handlers[e]))

		const wrapper = container.querySelector('drop-down')
		await fireEvent.click(wrapper.querySelector('button'))

		await tick()
		let classes = Array.from(wrapper.classList)
		expect(classes).toContain('open')
		expect(wrapper).toMatchSnapshot()

		await fireEvent.keyUp(wrapper, {
			key: 'Escape'
		})
		await tick()
		classes = Array.from(wrapper.classList)
		expect(classes).not.toContain('open')
		expect(wrapper).toMatchSnapshot()
	})

	// it('should handle option changes', async () => {
	// 	const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
	// 	const { container, component } = render(DropDown, {
	// 		options: options,
	// 		value: options[1]
	// 	})
	//   const wrapper = container.querySelector('drop-down')
	// 	expect(wrapper).toMatchSnapshot()

	// 	await fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
	// 	await tick()
	// 	expect(container.querySelector('scroll')).toMatchSnapshot()

	// 	component.$set({ options: [{ text: 'a' }, { text: 'b' }] })
	// 	await tick()
	// 	expect(container.querySelector('scroll')).toMatchSnapshot()
	// })
	//todo: test arrow keys
	// it('should handle arrow keys for navigation and select', async () => {
	// 	const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
	// 	const { container, component } = render(DropDown, {
	// 		options: options,
	// 		value: options[1]
	// 	})

	// 	expect(container.querySelector('drop-down ')).toMatchSnapshot()
	// 	const select = container.querySelector('drop-down ')

	// 	await fireEvent.keyDown(select, { key: 'ArrowDown' })
	// 	await tick()
	// 	await fireEvent.keyDown(select, { key: 'ArrowDown' })
	// 	await tick()
	// 	await fireEvent.keyDown(select, { key: 'Enter' })
	// 	await tick()

	// 	expect(getPropertyValue(component, 'value')).toEqual(options[2])
	// 	expect(container.querySelector('drop-down ')).toMatchSnapshot()

	// 	await fireEvent.keyDown(select, { key: 'ArrowUp' })
	// 	await tick()
	// 	await fireEvent.keyDown(select, { key: 'ArrowUp' })
	// 	await tick()
	// 	await fireEvent.keyDown(select, { key: 'Enter' })
	// 	await tick()
	// 	expect(getPropertyValue(component, 'value')).toEqual(options[1])
	// 	expect(container.querySelector('drop-down ')).toMatchSnapshot()
	// })
})
