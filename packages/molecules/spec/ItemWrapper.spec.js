import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { toHaveBeenDispatchedWith } from 'validators'
import { tick } from 'svelte'
import ItemWrapper from '../src/ItemWrapper.svelte'
import Custom from './mocks/Custom.svelte'

expect.extend({ toHaveBeenDispatchedWith })

describe('ItemWrapper.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(ItemWrapper, { props: { value: 'hello' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should handle value change', async () => {
		const { container, component } = render(ItemWrapper, { props: { value: 'hello' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle value change
		//   setProperties(component, { props: { value: 'hello' } })
		// await tick()
		// const text = container.querySelector('p')
		// expect(text).toBeTruthy()
		// expect(text.textContent).toBe('hello')
	})

	// it('should handle change for removable property', async () => {
	// 	const { container, component } = render(ItemWrapper, { value: 'hello' })
	// 	expect(container).toMatchSnapshot()

	// 	setProperties(component,{ removable: true })
	// 	await tick()
	// 	expect(container).toMatchSnapshot()
	// })

	it('should handle class change', async () => {
		const { container, component } = render(ItemWrapper, { props: { value: 'hello' } })
		let wrapper = container.querySelector('wrap-item')
		expect(wrapper).toBeTruthy()
		expect(Array.from(wrapper.classList)).not.toContain('item')

		// setProperties(component, { class: 'item' })
		// await tick()
		// wrapper = container.querySelector('wrap-item')
		// expect(wrapper).toBeTruthy()
		// expect(Array.from(wrapper.classList)).toContain('item')
	})

	it('should render using field mapping', () => {
		const { container } = render(ItemWrapper, {
			props: {
				value: {
					alt: 'hello',
					profile: 'https://example.com/img.png',
					ico: 'info'
				},
				fields: { text: 'alt', image: 'profile', icon: 'ico' }
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with removable prop', async () => {
		const removeEvent = vi.fn()

		const { component, container, getByRole } = render(ItemWrapper, {
			props: {
				value: 'Test',
				removable: true
			},
			events: { remove: removeEvent }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const removeIcon = getByRole('button', { name: 'Remove' })
		// component.$on('remove', removeEvent)
		await fireEvent.click(removeIcon)
		expect(removeEvent).toHaveBeenDispatchedWith('Test')
	})

	it('should render with selected prop', () => {
		const { container } = render(ItemWrapper, { props: { value: 'Test', selected: true } })

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom class', () => {
		const { container } = render(ItemWrapper, { props: { value: 'Test', class: 'pill' } })

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render removable with custom class', () => {
		const { container } = render(ItemWrapper, {
			props: {
				value: 'Test',
				class: 'pill',
				removable: true
			}
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render custom component', () => {
		const { container } = render(ItemWrapper, {
			props: {
				value: 'Test',
				using: { default: Custom }
			}
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render object', () => {
		const { container } = render(ItemWrapper, { props: { value: { text: 'Test' } } })

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render removable with custom icon', () => {
		const { container } = render(ItemWrapper, {
			props: {
				value: { text: 'Test' },
				icons: { remove: 'close' },
				removable: true
			}
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render removable with default icon when null', async () => {
		const { container, component } = render(ItemWrapper, {
			props: {
				value: { text: 'Test' },
				icons: null,
				removable: true
			}
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// setProperties(component, { icons: { remove: 'close' } })
		// await tick()
		// expect(container).toMatchSnapshot()
	})

	it('should render object configured component', () => {
		const { container } = render(ItemWrapper, {
			props: {
				value: { text: 'Test', component: 'custom' },
				using: { custom: Custom }
			}
		})

		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should update when value changes', async () => {
		const { container, component } = render(ItemWrapper, {
			props: {
				value: {
					text: 'hello'
				}
			}
		})
		expect(container).toBeTruthy()
		const text = container.querySelector('p')
		expect(container).toMatchSnapshot()
		expect(text.textContent).toBe('hello')

		// setProperties(component, { value: { text: 'world', icon: 'world' } })
		// await tick()
		// expect(text.textContent).toBe('world')
	})
})
