import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Tabs from '../src/Tabs.svelte'

describe('Tabs.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render text array', () => {
		const { container } = render(Tabs, { items: ['a', 'b'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should support editable attribute', () => {
		const { container, component } = render(Tabs, { items: ['a', 'b'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ editable: true })
		expect(container).toMatchSnapshot()
	})
	it('Should render using default field mapping', () => {
		const { container } = render(Tabs, {
			items: [{ text: 'a' }, { text: 'b' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using field mappings', () => {
		const { container } = render(Tabs, {
			items: [{ name: 'a' }, { name: 'a' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should support custom class', async () => {
		const { container, component } = render(Tabs, {
			items: ['a', 'b'],
			class: 'custom'
		})
		let wrapper = container.querySelector('tabs')
		expect(Array.from(wrapper.classList)).toContain('custom')
		component.$set({ class: 'other' })
		await tick()
		wrapper = container.querySelector('tabs')
		expect(Array.from(wrapper.classList)).toContain('other')
	})
	it('Should support custom icons', async () => {
		const { container, component } = render(Tabs, {
			items: ['a', 'b']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		component.$set({ icons: { remove: 'close' } })
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('Should render items using custom component', () => {})
	it('Should handle item value changes', () => {})
	it('Should pass select and change events', () => {})
	it('Should remove tabs when remove icon is clicked', () => {})
})
