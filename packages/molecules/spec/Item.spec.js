import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
// import { tick } from 'svelte'
import Item from '../src/Item.svelte'

describe('Item.svelte', () => {
	beforeEach(() => cleanup())

	it('should render default', () => {
		const { container, component } = render(Item, { props: { value: null } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const text = container.querySelector('p')
		expect(text).toBeFalsy()

		// handle value change
		// setProperties(component, { value: 'hello' })
		// await tick()
		// text = container.querySelector('p')
		// expect(text).toBeTruthy()
		// expect(text.textContent).toBe('hello')
	})

	it('should render null', () => {
		const { container } = render(Item, { value: null })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with value', () => {
		const { container } = render(Item, { value: 'text' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render object', () => {
		const { container } = render(Item, { value: { text: 'hello' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render icon', () => {
		const { container } = render(Item, {
			value: { text: 'hello', icon: 'info' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render image', () => {
		const { container } = render(Item, {
			value: { text: 'hello', image: 'https://example.com/img.png' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render image and icon', () => {
		const { container } = render(Item, {
			value: {
				text: 'hello',
				image: 'https://example.com/img.png',
				icon: 'info'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render icon based on state', () => {
		const { container } = render(Item, {
			value: {
				text: 'hello',
				icon: { on: 'info', off: 'info-off' },
				state: 'on'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using field mapping', () => {
		const { container } = render(Item, {
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

	it('should render empty when field mapping is invalid', () => {
		const { container } = render(Item, {
			value: {
				alt: 'hello'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	// it('should update when value changes', async () => {
	// 	const { container, component } = render(Item, {
	// 		value: {
	// 			text: 'hello'
	// 		}
	// 	})
	// 	expect(container).toBeTruthy()
	// 	const text = container.querySelector('p')
	// 	expect(container).toMatchSnapshot()
	// 	expect(text.textContent).toBe('hello')

	// 	setProperties(component,{ value: { text: 'world' } })
	// 	await tick()
	// 	expect(text.textContent).toBe('world')
	// })
})
