import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Switch from '../src/Switch.svelte'

describe('Switch.svelte', () => {
	beforeEach(() => cleanup())

	it('should render default', async () => {
		const { container } = render(Switch, { value: false })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		const items = container.querySelectorAll('toggle-switch item')

		expect(items.length).toBe(2)
		await fireEvent.click(items[1])
		await tick()
		expect(container).toMatchSnapshot()
		await fireEvent.click(items[0])
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('should render with value', () => {
		const { container } = render(Switch, { value: true })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render text array', async () => {
		const { container, component } = render(Switch, {
			value: null,
			options: ['a', 'b']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		setProperties(component, { options: ['a', 'b', 'c'] })
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('should support editable attribute', () => {
		const { container, component } = render(Switch, {
			value: null,
			options: ['a', 'b']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		setProperties(component, { editable: true })
		expect(container).toMatchSnapshot()
	})
	it('should render using default field mapping', () => {
		const { container } = render(Switch, {
			value: null,
			options: [{ text: 'a' }, { text: 'b' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using field mappings', () => {
		const { container } = render(Switch, {
			value: null,
			options: [{ name: 'a' }, { name: 'a' }],
			fields: { text: 'name' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should support custom class', async () => {
		const { container, component } = render(Switch, {
			value: null,
			options: ['a', 'b'],
			class: 'custom'
		})
		let wrapper = container.querySelector('toggle-switch')
		expect(Array.from(wrapper.classList)).toContain('custom')

		setProperties(component, { class: 'other' })
		await tick()
		wrapper = container.querySelector('toggle-switch')
		expect(Array.from(wrapper.classList)).toContain('other')
	})
	it('should support custom icons', async () => {
		const { container, component } = render(Switch, {
			value: 'a',
			options: ['a', 'b']
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		setProperties(component, { icons: { remove: 'close' } })
		await tick()
		expect(container).toMatchSnapshot()
	})
	// it('should render items using custom component', () => {})
	// it('should handle item value changes', () => {})
	// it('should pass select and change events', () => {})
	// it('should render items using custom component', () => {})
	// it('should expand and collapse', () => {})
	// it('should pass select and change events', () => {})
})
