import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from '@rokkit/helpers/matchers'
import { flushSync, tick } from 'svelte'

import { MockItem } from '@rokkit/helpers/components'
import InputSelect from '../../src/input/InputSelect.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('InputSelect.svelte', () => {
	const events = ['change', 'select']
	const handlers = {}

	beforeEach(() => {
		cleanup()
		events.forEach((e) => (handlers[e] = vi.fn()))
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should render using default field mapping', () => {
		const props = $state({
			name: 'opt',
			options: ['a', 'b', 'c']
		})
		const { container } = render(InputSelect, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using field mappings', () => {
		const props = $state({
			name: 'opt',
			options: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		const { container } = render(InputSelect, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom mapping', () => {
		const props = $state({
			name: 'opt',
			options: [{ text: 1 }, { text: 2 }, { text: 3 }],
			fields: { text: 'text' }
		})
		const { container } = render(InputSelect, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using default item when data is invalid', () => {
		const props = $state({
			name: 'opt',
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' }
		})
		const { container } = render(InputSelect, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', () => {
		const props = $state({
			name: 'opt',
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' },
			class: 'myClass'
		})
		const { container } = render(InputSelect, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with placeholder', () => {
		const props = $state({
			name: 'opt',
			options: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' },
			placeholder: 'select a value'
		})
		const { container } = render(InputSelect, { props })
		let placeholder = container.querySelector('selected-item item p')
		expect(placeholder.textContent).toEqual('select a value')
		props.placeholder = '-'
		flushSync()
		placeholder = container.querySelector('selected-item item p')
		expect(placeholder.textContent).toEqual('-')
	})
	it('should render items using custom component', () => {
		const props = $state({
			name: 'opt',
			options: [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			using: { custom: MockItem }
		})
		const { container } = render(InputSelect, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	// it('should emit the change event when the value changes', async () => {
	// 	const props = $state({
	// 		name: 'opt',
	// 		options: [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }],
	// 		fields: { text: 'num' },
	// 		using: { custom: MockItem },
	// 		onselect: handlers.select,
	// 		onchange: handlers.change
	// 	})
	// 	const { container, component } = render(InputSelect, { props })

	// 	const select = container.querySelector('selected-item')
	// 	await fireEvent.click(select)
	// 	await tick()
	// 	expect(container).toMatchSnapshot()

	// 	const elements = container.querySelectorAll('input-select list item')
	// 	await fireEvent.click(elements[0])
	// 	await tick()
	// 	expect(getPropertyValue(component, 'value')).toEqual('a')
	// 	expect(handlers.select).not.toHaveBeenCalled()
	// 	expect(handlers.change).toHaveBeenCalled()
	// 	expect(handlers.change).toHaveBeenDispatchedWith({ text: 'a' })
	// })
})
