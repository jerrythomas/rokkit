import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import NestedList from '../src/NestedList.svelte'

describe('NestedList.svelte', () => {
	const items = [
		{ text: 'a', children: [{ text: 'aa' }] },
		{ text: 'b' },
		{ text: 'c', children: [{ text: 'cc' }] }
	]
	beforeEach(() => cleanup())

	it('Should render empty nested list', () => {
		const { container } = render(NestedList)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using default field mapping', () => {
		const { container } = render(NestedList, {
			items: [{ text: 'a' }, { text: 'b' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render nested items', () => {
		const { container } = render(NestedList, { items })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render open items', () => {
		const { container } = render(NestedList, {
			items: [
				{ text: 'a', _open: true, children: [{ text: 'aa' }] },
				{ text: 'b' },
				{ text: 'c', children: [{ text: 'cc' }] }
			]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using field mappings', () => {
		const { container } = render(NestedList, {
			items: [{ name: 'a' }, { name: 'a' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should support custom class', async () => {
		const { container, component } = render(NestedList, {
			items,
			class: 'custom'
		})
		let wrapper = container.querySelector('nested-list')
		expect(Array.from(wrapper.classList)).toContain('custom')
		component.$set({ class: 'other' })
		await tick()
		wrapper = container.querySelector('nested-list')
		expect(Array.from(wrapper.classList)).toContain('other')
	})
	it('Should support custom icons', async () => {
		const { container, component } = render(NestedList, {
			items
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		component.$set({ icons: { open: 'open', close: 'close' } })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('Should render items using custom component', () => {})
	it('Should expand and collapse', () => {})
	it('Should autoclose others', () => {})
	it('Should pass select and change events', () => {})
})
