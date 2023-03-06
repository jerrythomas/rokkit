import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import Custom from './mocks/Custom.svelte'
import List from './List.svelte'
import { toHaveBeenCalledWithDetail } from 'validators'

expect.extend({ toHaveBeenCalledWithDetail })

describe('List.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('Should render a list of values', () => {
		const { container } = render(List, { items: [1, 2, 3] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render items using field mappings', () => {
		const { container } = render(List, {
			items: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render items using custom mapping', () => {
		const { container } = render(List, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render items using default item when data is invalid', () => {
		const { container } = render(List, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render with alternate class', () => {
		const { container } = render(List, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render items using custom component', () => {
		const { container } = render(List, {
			items: [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			using: { custom: Custom }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should emit select event', async () => {
		let selected

		const items = [{ name: 'item 1' }, { name: 'item 2' }]
		const onSelect = vi.fn().mockImplementation((event) => {
			console.log('list test', event, event.detail)
			expect(event.detail).toEqual(selected)
		})
		const { container, component } = render(List, {
			props: {
				items,
				fields: {
					label: 'name'
				}
			}
		})
		component.$on('select', onSelect)
		container.querySelectorAll('list item').forEach(async (item, index) => {
			selected = { item: items[index], indices: [index] }
			await fireEvent.click(item)
			expect(component.$$.ctx[component.$$.props.value]).toEqual(selected.item)
			expect(onSelect).toHaveBeenCalled()
		})
		// let nodes = container.querySelectorAll('list item')
		// console.log(nodes.length)
		// console.log(nodes[0].dataset['path'])

		// await fireEvent.click(nodes[0])
		// // nodes[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
		// selected = { item: items[0], indices: [0] }
		// expect(onSelect).toHaveBeenCalled()
		// expect(onSelect).toHaveBeenCalledWithDetail({
		// 	item: items[0],
		// 	indices: [0]
		// })
		// .forEach(async (item, index) => {
		// 	await fireEvent.click(item)
		// 	selected = { item: items[index], indices: [index] }
		// 	expect(onSelect).toHaveBeenCalled()
		// 	expect(onSelect.mock.calls[index][0].detail).toEqual(selected)
		// 	// below assertion fails because the props value ges updated.
		// 	// expect(component.$$.ctx[component.$$.props.value]).toEqual(selected.item)
		// })
	})
	it('Should pass change event', () => {})
	it('Should add an item', () => {})
	it('Should remove selected item', () => {})
	it('Should clear selection', () => {})
	it('Should filter list by search string', () => {})
})
