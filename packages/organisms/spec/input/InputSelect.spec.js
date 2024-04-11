import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'

import MockItem from '../mocks/MockItem.svelte'
import InputSelect from '../../src/input/InputSelect.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('InputSelect.svelte', () => {
	const events = ['change', 'select']
	let handlers = {}

	beforeEach(() => {
		cleanup()
		events.forEach((e) => (handlers[e] = vi.fn()))
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should render using default field mapping', () => {
		const { container } = render(InputSelect, {
			name: 'opt',
			options: ['a', 'b', 'c']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using field mappings', () => {
		const { container } = render(InputSelect, {
			name: 'opt',
			options: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom mapping', () => {
		const { container } = render(InputSelect, {
			name: 'opt',
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using default item when data is invalid', () => {
		const { container } = render(InputSelect, {
			name: 'opt',
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', () => {
		const { container } = render(InputSelect, {
			name: 'opt',
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with placeholder', async () => {
		const { container, component } = render(InputSelect, {
			name: 'opt',
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			value: null,
			placeholder: 'select a value'
		})
		let placeholder = container.querySelector('selected-item item p')
		expect(placeholder.textContent).toEqual('select a value')
		component.$set({ placeholder: '-' })
		await tick()
		placeholder = container.querySelector('selected-item item p')
		expect(placeholder.textContent).toEqual('-')
	})
	it('should render items using custom component', () => {
		const { container } = render(InputSelect, {
			name: 'opt',
			options: [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			using: { custom: MockItem }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should emit the change event when the value changes', async () => {
		const { container, component } = render(InputSelect, {
			name: 'opt',
			options: [{ text: 'a' }, { text: 'b' }, { text: 'c' }]
		})

		Object.keys(handlers).forEach((e) => component.$on(e, handlers[e]))

		const select = container.querySelector('selected-item')
		await fireEvent.click(select)
		await tick()
		expect(container).toMatchSnapshot()

		const elements = container.querySelectorAll('input-select list item')
		await fireEvent.click(elements[0])
		await tick()
		expect(getPropertyValue(component, 'value')).toEqual('a')
		expect(handlers.select).not.toHaveBeenCalled()
		expect(handlers.change).toHaveBeenCalled()
		expect(handlers.change).toHaveBeenDispatchedWith({ text: 'a' })
	})
})
