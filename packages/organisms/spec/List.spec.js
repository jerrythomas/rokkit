import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import MockItem from './mocks/MockItem.svelte'
import List from '../src/List.svelte'
import { getPropertyValue, toHaveBeenDispatchedWith } from 'validators'

expect.extend({ toHaveBeenDispatchedWith })

describe('List.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render a list of values', () => {
		const { container } = render(List, { items: [1, 2, 3] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using field mappings', () => {
		const { container } = render(List, {
			items: [{ text: 1 }, { text: 2 }, { text: 3 }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom mapping', () => {
		const { container } = render(List, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render items using default item when data is invalid', () => {
		const { container } = render(List, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num', component: 'num' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with alternate class', async () => {
		const { container, component } = render(List, {
			items: [{ num: 1 }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			class: 'myClass'
		})
		expect(container).toBeTruthy()
		let classes = Array.from(container.querySelector('list').classList)
		expect(classes).toContain('myClass')
		component.$set({ class: 'myOtherClass' })
		await tick()
		classes = Array.from(container.querySelector('list').classList)
		expect(classes).not.toContain('myClass')
		expect(classes).toContain('myOtherClass')
	})
	it('should render items using custom component', () => {
		const { container } = render(List, {
			items: [{ num: 1, component: 'custom' }, { num: 2 }, { num: 3 }],
			fields: { text: 'num' },
			using: { custom: MockItem }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should emit select event', async () => {
		let selected

		const items = [{ name: 'item 1' }, { name: 'item 2' }]
		const onSelect = vi.fn()
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
			expect(getPropertyValue(component, 'value')).toEqual(selected.item)
			expect(onSelect).toHaveBeenCalled()
			expect(onSelect).toHaveBeenDispatchedWith(selected)
		})
	})
	it('should render a list of values with hierarchy', async () => {
		const { container, component } = render(List, {
			items: [1, 2, 3],
			hierarchy: [0]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		component.$set({ hierarchy: [0, 1] })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
