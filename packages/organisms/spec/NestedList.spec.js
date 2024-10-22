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

	it('should render empty nested list', () => {
		const { container } = render(NestedList)
		expect(container).toBeTruthy()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
	})
	it('should render using default field mapping', () => {
		const { container } = render(NestedList, {
			items: [{ text: 'a' }, { text: 'b' }]
		})
		expect(container).toBeTruthy()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
	})
	it('should render nested items', () => {
		const { container } = render(NestedList, { items })
		expect(container).toBeTruthy()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
	})
	it('should render open items', () => {
		const { container } = render(NestedList, {
			items: [
				{ text: 'a', _open: true, children: [{ text: 'aa' }] },
				{ text: 'b' },
				{ text: 'c', children: [{ text: 'cc' }] }
			]
		})
		expect(container).toBeTruthy()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
	})
	it('should render using field mappings', () => {
		const { container } = render(NestedList, {
			items: [{ name: 'a' }, { name: 'a' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
	})
	it('should support custom class', async () => {
		const { container, component } = render(NestedList, {
			items,
			class: 'custom'
		})
		let wrapper = container.querySelector('.nested-list')
		expect(Array.from(wrapper.classList)).toContain('custom')
		setProperties(component, { class: 'other' })
		await tick()
		wrapper = container.querySelector('.nested-list')
		expect(Array.from(wrapper.classList)).toContain('other')
	})
	it('should support custom icons', async () => {
		const { container, component } = render(NestedList, {
			items
		})
		expect(container).toBeTruthy()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
		setProperties(component, { icons: { open: 'open', close: 'close' } })
		await tick()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
	})

	it('should render with hierarchy', async () => {
		const { container, component } = render(NestedList, {
			items: [
				{ text: 'a', children: [{ text: 'aa' }], _open: true },
				{ text: 'b' },
				{ text: 'c', children: [{ text: 'cc' }] }
			],
			hierarchy: [0]
		})

		expect(container.querySelector('.nested-list')).toMatchSnapshot()
		setProperties(component, { hierarchy: [0, 0] })
		await tick()
		expect(container.querySelector('.nested-list')).toMatchSnapshot()
	})
})
