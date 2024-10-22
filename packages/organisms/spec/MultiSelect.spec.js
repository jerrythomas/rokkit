import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { getPropertyValue } from 'validators'
import MultiSelect from '../src/MultiSelect.svelte'
import MockItem from './mocks/MockItem.svelte'

describe('MultiSelect.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default field mapping', async () => {
		const { container, component } = render(MultiSelect, {
			props: {
				name: 'test',
				options: ['One', 'Two', 'Three'],
				value: ['One']
			}
		})
		expect(container).toBeTruthy()
		const wrapper = container.querySelector('input-select')
		expect(wrapper).toMatchSnapshot()
		const select = wrapper.querySelector('selected-item')
		await fireEvent.click(select)
		await tick()
		expect(wrapper).toMatchSnapshot()

		setProperties(component, { value: ['One', 'Two'] })
		await tick()
		expect(wrapper).toMatchSnapshot()
	})

	it('should render using field mappings', async () => {
		const options = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]
		const { container, component } = render(MultiSelect, {
			props: {
				options,
				name: 'test',
				value: [options[1]],
				fields: { text: 'name' }
			}
		})
		expect(container).toBeTruthy()
		const wrapper = container.querySelector('input-select')
		expect(wrapper).toMatchSnapshot()
		const select = wrapper.querySelector('selected-item')
		await fireEvent.click(select)
		await tick()
		expect(wrapper).toMatchSnapshot()

		setProperties(component, { value: [options[3], options[1]] })
		await tick()
		expect(wrapper).toMatchSnapshot()
	})

	it('should render items using custom component', async () => {
		const options = [{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Charlie' }]
		const { container } = render(MultiSelect, {
			props: {
				options,
				name: 'test',
				value: [options[0]],
				fields: { text: 'name' },
				using: { default: MockItem }
			}
		})
		expect(container).toBeTruthy()
		const wrapper = container.querySelector('input-select')
		const select = wrapper.querySelector('selected-item')
		await fireEvent.click(select)
		await tick()
		// wrapper = container.querySelector('input-select')
		expect(wrapper).toMatchSnapshot()
	})

	it('should add a selected item', async () => {
		const { container, component } = render(MultiSelect, {
			props: {
				name: 'test',
				options: ['One', 'Two', 'Three'],
				value: ['One']
			}
		})
		const wrapper = container.querySelector('input-select')
		const select = wrapper.querySelector('selected-item')

		const selectedItems = select.querySelectorAll('wrap-item')
		expect(selectedItems.length).toBe(1)
		await fireEvent.click(select)
		await tick()

		const items = wrapper.querySelectorAll('scroll item')
		expect(items.length).toBe(2)
		await fireEvent.click(items[1])
		await tick()

		expect(getPropertyValue(component, 'value')).toEqual(['One', 'Three'])
		await fireEvent.click(select)
		await tick()
		expect(wrapper).toMatchSnapshot()
	})
	it('should remove a selected item', async () => {
		const { container, component } = render(MultiSelect, {
			props: {
				name: 'test',
				options: ['One', 'Two', 'Three'],
				value: ['One', 'Two']
			}
		})
		const wrapper = container.querySelector('input-select')
		const select = wrapper.querySelector('selected-item')

		const items = select.querySelectorAll('wrap-item')
		expect(items.length).toBe(2)
		await fireEvent.click(items[0].querySelector('icon'))
		await tick()
		expect(getPropertyValue(component, 'value')).toEqual(['Two'])
		await fireEvent.click(select)
		await tick()
		expect(wrapper).toMatchSnapshot()
	})

	it('should render with custom class', async () => {
		const { container, component } = render(MultiSelect, {
			props: {
				name: 'test',
				options: ['One', 'Two', 'Three'],
				value: ['One'],
				class: 'custom-class'
			}
		})
		expect(container).toBeTruthy()
		let classes = Array.from(container.querySelector('input-select').classList)
		expect(classes).toContain('custom-class')
		setProperties(component, { class: 'custom-class-2' })
		await tick()
		classes = Array.from(container.querySelector('input-select').classList)
		expect(classes).not.toContain('custom-class')
		expect(classes).toContain('custom-class-2')
	})
})
