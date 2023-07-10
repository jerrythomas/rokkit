import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'
import ItemWrapper from '../src/ItemWrapper.svelte'
import Custom from './mocks/Custom.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('ItemWrapper.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render', () => {
		const { container } = render(ItemWrapper, { value: 'hello' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should handle value change', async () => {
		const { container, component } = render(ItemWrapper, { value: 'hello' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle value change
		component.$set({ value: 'hello' })
		await tick()
		let text = container.querySelector('p')
		expect(text).toBeTruthy()
		expect(text.textContent).toBe('hello')
	})

	// it('Should handle change for removable property', async () => {
	// 	const { container, component } = render(ItemWrapper, { value: 'hello' })
	// 	expect(container).toMatchSnapshot()

	// 	component.$set({ removable: true })
	// 	await tick()
	// 	expect(container).toMatchSnapshot()
	// })

	it('Should handle class change', async () => {
		const { container, component } = render(ItemWrapper, { value: 'hello' })
		let wrapper = container.querySelector('wrap-item')
		expect(wrapper).toBeTruthy()
		expect(Array.from(wrapper.classList)).not.toContain('item')

		component.$set({ class: 'item' })
		await tick()
		wrapper = container.querySelector('wrap-item')
		expect(wrapper).toBeTruthy()
		expect(Array.from(wrapper.classList)).toContain('item')
	})

	it('Should render using field mapping', () => {
		const { container } = render(ItemWrapper, {
			value: {
				alt: 'hello',
				profile: 'https://example.com/img.png',
				ico: 'info'
			},
			fields: { text: 'alt', image: 'profile', icon: 'ico' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render with removable prop', async () => {
		const { component, container, getByRole } = render(ItemWrapper, {
			value: 'Test',
			removable: true
		})
		const removeEvent = vi.fn()
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const removeIcon = getByRole('button', { name: 'Remove' })
		component.$on('remove', removeEvent)
		await fireEvent.click(removeIcon)
		expect(removeEvent).toHaveBeenDispatchedWith('Test')
	})

	it('Should render with selected prop', () => {
		const { container } = render(ItemWrapper, { value: 'Test', selected: true })

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render with custom class', () => {
		let { container } = render(ItemWrapper, { value: 'Test', class: 'pill' })

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render removable with custom class', () => {
		let { container } = render(ItemWrapper, {
			value: 'Test',
			class: 'pill',
			removable: true
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render custom component', () => {
		const { container } = render(ItemWrapper, {
			value: 'Test',
			using: { default: Custom }
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render object', () => {
		const { container } = render(ItemWrapper, { value: { text: 'Test' } })

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render removable with custom icon', () => {
		const { container } = render(ItemWrapper, {
			value: { text: 'Test' },
			icons: { remove: 'close' },
			removable: true
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render removable with default icon when null', async () => {
		const { container, component } = render(ItemWrapper, {
			value: { text: 'Test' },
			icons: null,
			removable: true
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ icons: { remove: 'close' } })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('Should render object configured component', () => {
		const { container } = render(ItemWrapper, {
			value: { text: 'Test', component: 'custom' },
			using: { custom: Custom }
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should update when value changes', async () => {
		const { container, component } = render(ItemWrapper, {
			value: {
				text: 'hello'
			}
		})
		expect(container).toBeTruthy()
		const text = container.querySelector('p')
		expect(container).toMatchSnapshot()
		expect(text.textContent).toBe('hello')

		component.$set({ value: { text: 'world', icon: 'world' } })
		await tick()
		expect(text.textContent).toBe('world')
	})
})
