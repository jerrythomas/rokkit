import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Link from '../src/Link.svelte'

describe('Link.svelte', () => {
	beforeEach(() => cleanup())

	it('should render null', () => {
		const { container } = render(Link, { value: null })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render object', async () => {
		const { container, component } = render(Link, { value: { text: '#', href: '#' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		let anchor = container.querySelector('a')
		expect(anchor).toBeTruthy()
		expect(anchor.href).toEqual('#')
		let text = container.querySelector('p')
		expect(text.textContent).toEqual('#')

		// handle value change
		component.$set({ text: 'hello' })
		await tick()
		text = container.querySelector('p')
		expect(text).toBeTruthy()
		expect(text.textContent).toBe('hello')
	})

	it('should render icon', () => {
		const { container } = render(Link, {
			value: { text: 'hello', icon: 'info', href: '/' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		let anchor = container.querySelector('a')
		expect(anchor).toBeTruthy()
		expect(anchor.href).toEqual('/')
	})
	it('should render image', () => {
		const { container } = render(Link, {
			value: { text: 'hello', image: 'https://example.com/img.png', href: 'https://example.com' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render image and icon', () => {
		const { container } = render(Link, {
			value: {
				text: 'hello',
				image: 'https://example.com/img.png',
				icon: 'info'
				href: 'https://example.com'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render icon based on state', () => {
		const { container } = render(Link, {
			value: {
				text: 'hello',
				icon: { on: 'info', off: 'info-off' },
				state: 'on',
				href: 'https://example.com'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using field mapping', () => {
		const { container } = render(Link, {
			value: {
				alt: 'hello',
				profile: 'https://example.com/img.png',
				ico: 'info'
				url: 'https://example.com'
			},
			fields: { text: 'alt', image: 'profile', icon: 'ico', href: 'url' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render empty when field mapping is invalid', () => {
		const { container } = render(Link, {
			value: {
				alt: 'hello'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	// it('should update when value changes', async () => {
	// 	const { container, component } = render(Link, {
	// 		value: {
	// 			text: 'hello'
	// 		}
	// 	})
	// 	expect(container).toBeTruthy()
	// 	const text = container.querySelector('p')
	// 	expect(container).toMatchSnapshot()
	// 	expect(text.textContent).toBe('hello')

	// 	component.$set({ value: { text: 'world' } })
	// 	await tick()
	// 	expect(text.textContent).toBe('world')
	// })
})
