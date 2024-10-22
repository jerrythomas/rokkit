import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
// import { tick } from 'svelte'
import Link from '../src/Link.svelte'

describe('Link.svelte', () => {
	beforeEach(() => cleanup())

	it('should render null', () => {
		const { container } = render(Link, { props: { value: null } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render object', async () => {
		const { container, component } = render(Link, { props: { value: { text: '#', url: '#' } } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const anchor = container.querySelector('a')
		expect(anchor).toBeTruthy()
		expect(anchor.href).toEqual('http://localhost:3000/#')
		const text = container.querySelector('p')
		expect(text.textContent).toEqual('#')

		// // handle value change
		// setProperties(component, { value: { text: 'hello', url: '/' } })
		// await tick()
		// text = container.querySelector('p')
		// expect(text).toBeTruthy()
		// expect(text.textContent).toBe('hello')
	})

	it('should render icon', () => {
		const { container } = render(Link, {
			props: {
				value: { text: 'hello', icon: 'info', url: '/' }
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		const anchor = container.querySelector('a')
		expect(anchor).toBeTruthy()
		expect(anchor.href).toEqual('http://localhost:3000/')
	})
	it('should render image', () => {
		const { container } = render(Link, {
			props: {
				value: { text: 'hello', image: 'https://example.com/img.png', url: 'https://example.com' }
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render image and icon', () => {
		const { container } = render(Link, {
			props: {
				value: {
					text: 'hello',
					image: 'https://example.com/img.png',
					icon: 'info',
					href: 'https://example.com'
				}
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render icon based on state', () => {
		const { container } = render(Link, {
			props: {
				value: {
					text: 'hello',
					icon: { on: 'info', off: 'info-off' },
					state: 'on',
					href: 'https://example.com'
				}
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render using field mapping', () => {
		const { container } = render(Link, {
			props: {
				value: {
					alt: 'hello',
					profile: 'https://example.com/img.png',
					ico: 'info',
					route: 'https://example.com'
				},
				fields: { text: 'alt', image: 'profile', icon: 'ico', url: 'route' }
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render empty when field mapping is invalid', () => {
		const { container } = render(Link, {
			props: {
				value: {
					alt: 'hello'
				}
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

	// 	setProperties(component,{ value: { text: 'world' } })
	// 	await tick()
	// 	expect(text.textContent).toBe('world')
	// })
})
