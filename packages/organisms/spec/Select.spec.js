import { describe, expect, it, beforeEach, afterAll, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'

import MockItem from './mocks/MockItem.svelte'
import Select from '../src/Select.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('Select.svelte', () => {
	const events = ['change', 'select']
	let handlers = {}

	beforeEach(() => {
		cleanup()
		events.map((e) => (handlers[e] = vi.fn()))
	})
	afterAll(() => vi.resetAllMocks())

	it('should render string array', async () => {
		const { container } = render(Select, { options: ['a', 'b', 'c'] })
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('selected-item'))
		await tick()
		expect(container).toMatchSnapshot()
		let items = container.querySelectorAll('input-select list item')
		expect(items.length).toEqual(3)
		await fireEvent.click(items[1])
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using field mapping', async () => {
		const { container } = render(Select, {
			options: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('selected-item'))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using custom mapping', async () => {
		const options = [{ num: 1 }, { num: 2 }, { num: 3 }]
		const { container } = render(Select, {
			options,
			value: options[1],
			fields: { text: 'num' }
		})
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('selected-item'))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render items using default component, when invalid component is provided', async () => {
		const options = [{ num: 1 }, { num: 2 }, { num: 3 }]
		const { container } = render(Select, {
			options,
			value: options[1],
			fields: { text: 'num', component: 'num' }
		})
		expect(container).toBeTruthy()
		await fireEvent.click(container.querySelector('selected-item'))
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', async () => {
		const { container, component } = render(Select, {
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		let classes = Array.from(container.querySelector('input-select').classList)

		expect(classes).toContain('myClass')
		component.$set({ class: 'myClass2' })
		await tick()
		classes = Array.from(container.querySelector('input-select').classList)
		expect(classes).not.toContain('myClass')
		expect(classes).toContain('myClass2')
	})

	it('should render items using custom component', async () => {
		const options = [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }]
		const { container, component } = render(Select, {
			options,
			fields: { text: 'num' },
			using: { custom: MockItem },
			value: options[0]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		const item = container.querySelector('selected-item')
		await fireEvent.click(item)
		await tick()
		expect(container).toMatchSnapshot()

		component.$set({ using: { default: MockItem, custom: MockItem } })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should emit the change event when the value changes', async () => {
		const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		const { container, component } = render(Select, {
			options: options
		})

		Object.keys(handlers).map((e) => component.$on(e, handlers[e]))

		const select = container.querySelector('selected-item')
		await fireEvent.click(select)
		await tick()
		expect(container).toMatchSnapshot()

		const elements = container.querySelectorAll('input-select list item')
		await fireEvent.click(elements[1])
		await tick()
		expect(getPropertyValue(component, 'value')).toEqual(options[1])
		expect(handlers.select).toHaveBeenCalled()
		expect(handlers.change).toHaveBeenCalled()
		expect(handlers.change).toHaveBeenDispatchedWith(options[1])
		expect(handlers.select).toHaveBeenDispatchedWith(options[1])
		await tick()
		const classes = Array.from(
			container.querySelector('input-select').classList
		)
		expect(classes).not.toContain('open')
	})

	it('should open/close drop down on click and blur', async () => {
		const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		const { container, component } = render(Select, {
			options: options,
			value: options[1]
		})

		Object.keys(handlers).map((e) => component.$on(e, handlers[e]))

		const wrapper = container.querySelector('input-select')
		await fireEvent.click(wrapper.querySelector('selected-item'))
		await fireEvent.focus(wrapper)

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
		const { container, component } = render(Select, {
			options: options,
			value: options[1]
		})

		Object.keys(handlers).map((e) => component.$on(e, handlers[e]))

		const wrapper = container.querySelector('input-select')
		await fireEvent.click(wrapper.querySelector('selected-item'))

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

	it('should handle option changes', async () => {
		const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		const { container, component } = render(Select, {
			options: options,
			value: options[1]
		})

		expect(container.querySelector('selected-item')).toMatchSnapshot()
		const select = container.querySelector('selected-item')

		await fireEvent.keyDown(select, { key: 'ArrowDown' })
		await tick()
		expect(container.querySelector('scroll')).toMatchSnapshot()

		component.$set({ options: [{ text: 'a' }, { text: 'b' }] })
		await tick()
		expect(container.querySelector('scroll')).toMatchSnapshot()
	})

	it('should handle arrow keys for navigation and select', async () => {
		const options = [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		const { container, component } = render(Select, {
			options: options,
			value: options[1]
		})

		expect(container.querySelector('selected-item')).toMatchSnapshot()
		const select = container.querySelector('selected-item')

		await fireEvent.keyDown(select, { key: 'ArrowDown' })
		await tick()
		await fireEvent.keyDown(select, { key: 'ArrowDown' })
		await tick()
		await fireEvent.keyDown(select, { key: 'Enter' })
		await tick()

		expect(getPropertyValue(component, 'value')).toEqual(options[2])
		expect(container.querySelector('selected-item')).toMatchSnapshot()

		await fireEvent.keyDown(select, { key: 'ArrowUp' })
		await tick()
		await fireEvent.keyDown(select, { key: 'ArrowUp' })
		await tick()
		await fireEvent.keyDown(select, { key: 'Enter' })
		await tick()
		expect(getPropertyValue(component, 'value')).toEqual(options[1])
		expect(container.querySelector('selected-item')).toMatchSnapshot()
	})
})
