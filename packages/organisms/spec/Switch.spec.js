import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Switch from '../src/Switch.svelte'

describe('Switch.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render default', () => {
		const { container } = render(Switch)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render with value', () => {
		const { container } = render(Switch, { value: true })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render text array', () => {
		const { container } = render(Switch, { items: ['a', 'b'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should support editable attribute', () => {
		const { container, component } = render(Switch, { items: ['a', 'b'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ editable: true })
		expect(container).toMatchSnapshot()
	})
	it('Should render using default field mapping', () => {
		const { container } = render(Switch, {
			items: [{ text: 'a' }, { text: 'b' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using field mappings', () => {
		const { container } = render(Switch, {
			items: [{ name: 'a' }, { name: 'a' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should support custom class', async () => {
		const { container, component } = render(Switch, {
			items: ['a', 'b'],
			class: 'custom'
		})
		let wrapper = container.querySelector('toggle-switch')
		expect(Array.from(wrapper.classList)).toContain('custom')

		component.$set({ class: 'other' })
		await tick()
		wrapper = container.querySelector('toggle-switch')
		expect(Array.from(wrapper.classList)).toContain('other')
	})
	it('Should support custom icons', async () => {
		const { container, component } = render(Switch, {
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
	it('Should render items using custom component', () => {})
	it('Should expand and collapse', () => {})
	it('Should pass select and change events', () => {})
})
