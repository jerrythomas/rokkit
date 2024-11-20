import { describe, expect, it, beforeEach, vi, afterAll } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import DropDown from '../src/DropDown.svelte'
import { tick } from 'svelte'
import MockItem from './mocks/MockItem.svelte'
import 'validators/mocks'

describe('DropDown.svelte', () => {
	const events = ['change']
	const handlers = {}

	beforeEach(() => {
		cleanup()
		events.forEach((e) => (handlers[e] = vi.fn()))
	})
	afterAll(() => vi.resetAllMocks())

	it('should render empty text', () => {
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
		const props = $state({ options: [], fields: {}, title: 'Select a value' })
		const { container } = render(DropDown, { props })

		const button = container.querySelector('drop-down > button')
		expect(button.querySelector('p').textContent.trim()).toBe('Select a value')

		props.icon = 'theme'
		await tick()
		expect(button).toMatchSnapshot()
		expect(button.querySelector('icon i').getAttribute('class')).toBe('theme')

		props.icon = 'other'
		await tick()
		expect(button).toMatchSnapshot()

		props.title = 'Select a different value'
		await tick()
		expect(button.querySelector('p').textContent.trim()).toBe('Select a different value')
	})

	it('should toggle open state on focus change', async () => {
		const { container } = render(DropDown, {
			props: { options: [], fields: {} }
		})

		expect(container).toMatchSnapshot()
		const button = container.querySelector('drop-down > button')

		await fireEvent.focus(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)
		await fireEvent.blur(button)
		expect(button.parentNode.classList.contains('open')).toBe(false)
	})

	it('should dispatch a change event when an item is selected', async () => {
		let selected = null
		const options = [{ text: 'foo' }, { text: 'bar' }]
		const props = $state({
			options,
			onchange: handlers.change,
			value: null
		})
		const { container } = render(DropDown, { props })

		const button = container.querySelector('drop-down > button')
		await fireEvent.focus(button)
		expect(button.parentNode.classList.contains('open')).toBe(true)

		container.querySelectorAll('drop-down list item').forEach(async (item, index) => {
			selected = { item: options[index], indices: [index] }
			await fireEvent.click(item)
			// expect(props).value).toEqual(selected.item)

			expect(handlers.change).toHaveBeenCalled()
			expect(handlers.change).toHaveBeenCalledWith(selected)
		})
	})

	it('should render string array', async () => {
		const props = $state({
			options: ['One', 'Two', 'Three'],
			fields: {},
			onchange: handlers.change
		})
		const { container } = render(DropDown, { props })
		expect(container).toBeTruthy()

		const wrapper = container.querySelector('drop-down')
		const button = container.querySelector('drop-down > button')
		await fireEvent.focus(button)
		await tick()

		expect(container).toMatchSnapshot()
		const items = container.querySelectorAll('drop-down list item')
		expect(items.length).toEqual(3)
		await fireEvent.click(items[1])
		await tick()

		// expect(handlers.change).toHaveBeenCalledWith({
		// 	item: 'b',
		// 	indices: [1]
		// })
		expect(wrapper.classList.contains('open')).toBe(false)
		await fireEvent.blur(button)

		props.options = ['x', 'y', 'z']
		props.icon = 'theme'
		// setProperties(component, { options: ['x', 'y', 'z'], icon: 'theme' })
		await fireEvent.focus(button)
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using field mapping', async () => {
		const props = $state({
			options: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		const { container } = render(DropDown, { props })
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('drop-down '))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using custom mapping', async () => {
		const options = [{ num: 1 }, { num: 2 }, { num: 3 }]
		const props = $state({
			options,
			value: options[1],
			fields: { text: 'num' }
		})

		const { container } = render(DropDown, { props })
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('drop-down '))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using default component, when invalid component is provided', async () => {
		const options = [{ num: 1 }, { num: 2 }, { num: 3 }]
		const props = $state({
			options,
			value: options[1],
			fields: { text: 'num', component: 'num' }
		})
		const { container } = render(DropDown, { props })
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('drop-down '))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', async () => {
		const props = $state({
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		const { container, component } = render(DropDown, { props })
		let classes = Array.from(container.querySelector('drop-down').classList)

		expect(classes).toContain('myClass')
		props.class = 'myClass2'
		await tick()
		classes = Array.from(container.querySelector('drop-down').classList)
		expect(classes).not.toContain('myClass')
		expect(classes).toContain('myClass2')
	})

	it('should render items using custom component', async () => {
		const options = [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }]
		const props = $state({
			options,
			fields: { text: 'num' },
			using: { custom: MockItem },
			value: options[0]
		})

		const { container } = render(DropDown, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		const item = container.querySelector('drop-down ')
		await fireEvent.click(item)
		await tick()
		expect(container).toMatchSnapshot()

		props.using = { default: MockItem, custom: MockItem }
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should close drop down on escape key', async () => {
		const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		const props = $state({
			options,
			value: options[1],
			onchange: handlers.change
		})
		const { container } = render(DropDown, { props })

		const wrapper = container.querySelector('drop-down')
		await fireEvent.focus(wrapper.querySelector('button'))

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

	// it('should handle arrow keys for navigation and select', async () => {
	// 	const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
	// 	const { container, component } = render(DropDown, {
	// 		options: options,
	// 		value: options[1]
	// 	})

	// 	expect(container.querySelector('drop-down ')).toMatchSnapshot()
	// 	component.$on('change', handlers.change)
	// 	const select = container.querySelector('drop-down ')

	// 	await fireEvent.keyDown(select, { key: 'ArrowDown' })
	// 	await tick()
	// 	await fireEvent.keyDown(select, { key: 'ArrowDown' })
	// 	await tick()
	// 	await fireEvent.keyDown(select, { key: 'Enter' })
	// 	await tick()
	// 	expect(handlers.change).toHaveBeenCalled()
	// expect(getPropertyValue(component, 'value')).toEqual(options[2])
	// expect(container.querySelector('drop-down ')).toMatchSnapshot()

	// await fireEvent.keyDown(select, { key: 'ArrowUp' })
	// await tick()
	// await fireEvent.keyDown(select, { key: 'ArrowUp' })
	// await tick()
	// await fireEvent.keyDown(select, { key: 'Enter' })
	// await tick()
	// expect(getPropertyValue(component, 'value')).toEqual(options[1])
	// expect(container.querySelector('drop-down ')).toMatchSnapshot()
	// })
})
