import { describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
// import { getPropertyValue, toHaveBeenCalledWith } from 'validators'
import Tabs from '../src/Tabs.svelte'
import MockItem from './mocks/MockItem.svelte'

// expect.extend({ toHaveBeenCalledWith })

describe('Tabs.svelte', () => {
	const events = ['select', 'remove', 'add']
	const handlers = {}
	beforeEach(() => {
		cleanup()
		events.forEach((name) => (handlers[name] = vi.fn()))
	})

	it('should render text array', () => {
		const { container } = render(Tabs, { options: ['Alpha', 'Beta'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should support editable attribute', () => {
		const { container, component } = render(Tabs, {
			options: ['Alpha', 'Beta']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		setProperties(component, { editable: true })
		expect(container).toMatchSnapshot()
	})
	it('should render using default field mapping', () => {
		const { container } = render(Tabs, {
			options: [{ text: 'Alpha' }, { text: 'Beta' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using field mappings', () => {
		const { container } = render(Tabs, {
			options: [{ name: 'Alpha' }, { name: 'Beta' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should support custom class', async () => {
		const { container, component } = render(Tabs, {
			options: ['Alpha', 'Beta'],
			class: 'custom'
		})
		let wrapper = container.querySelector('tabs')
		expect(Array.from(wrapper.classList)).toContain('custom')
		setProperties(component, { class: 'other' })
		await tick()
		wrapper = container.querySelector('tabs')
		expect(Array.from(wrapper.classList)).toContain('other')
	})
	it('should support custom icons', async () => {
		const { container, component } = render(Tabs, {
			options: ['Alpha', 'Beta']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		setProperties(component, { icons: { remove: 'close' } })
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('should render items using custom component', () => {
		const { container } = render(Tabs, {
			options: ['Alpha', 'Beta'],
			using: { default: MockItem }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should handle item value changes', async () => {
		const { container, component } = render(Tabs, {
			options: ['Alpha', 'Beta', 'Gamma'],
			value: 'Beta',
			editable: true
		})
		expect(container).toMatchSnapshot()
		setProperties(component, { value: 'Gamma' })
		component.$on('select', handlers.select)
		await tick()
		expect(container).toMatchSnapshot()
		const items = container.querySelectorAll('tabs wrap-item')
		await fireEvent.click(items[0])
		await tick()
		expect(handlers.select).toHaveBeenCalled()
		expect(handlers.select).toHaveBeenCalledWith({
			item: 'Alpha',
			indices: [0]
		})
		expect(getPropertyValue(component, 'value')).toBe('Alpha')
	})
	it('should emit the add event', async () => {
		const { container, component } = render(Tabs, {
			options: ['Alpha', 'Beta', 'Gamma'],
			editable: true
		})
		component.$on('add', handlers.add)
		const addIcon = container.querySelector('tabs > icon')
		await fireEvent.click(addIcon)
		await tick()
		expect(container).toMatchSnapshot()
		expect(handlers.add).toHaveBeenCalled()
		expect(handlers.add).toHaveBeenCalledWith(null)
	})
	it('should remove tabs when remove icon is clicked', async () => {
		const { container, component } = render(Tabs, {
			options: ['Alpha', 'Beta', 'Gamma'],
			editable: true
		})
		component.$on('remove', handlers.remove)
		const items = container.querySelectorAll('tabs wrap-item')
		await fireEvent.click(items[0].querySelector('icon'))
		await tick()
		expect(container).toMatchSnapshot()
		expect(handlers.remove).toHaveBeenCalled()
		expect(handlers.remove).toHaveBeenCalledWith({
			item: 'Alpha'
		})
	})
})
