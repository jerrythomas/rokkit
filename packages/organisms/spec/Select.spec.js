import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'

import Custom from './mocks/Custom.svelte'

import Select from '../src/Select.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('Select.svelte', () => {
	const events = ['change', 'select']
	let handlers = {}

	beforeEach(() => {
		cleanup()
		events.map((e) => (handlers[e] = vi.fn()))
	})

	it('should render using default field mapping', () => {
		const { container } = render(Select, { options: ['a', 'b', 'c'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using field mappings', () => {
		const { container } = render(Select, {
			options: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom mapping', () => {
		const { container } = render(Select, {
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using default item when data is invalid', () => {
		const { container } = render(Select, {
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', () => {
		const { container } = render(Select, {
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom component', () => {
		const { container } = render(Select, {
			options: [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			using: { custom: Custom }
		})
		expect(container).toBeTruthy()
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
	})
})
