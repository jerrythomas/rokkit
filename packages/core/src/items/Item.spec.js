import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Item from './Item.svelte'

describe('Item.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render', () => {
		const { container } = render(Item, { value: 'hello' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render object', () => {
		const { container } = render(Item, { value: { text: 'hello' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render icon', () => {
		const { container } = render(Item, {
			value: { text: 'hello', icon: 'info' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render image', () => {
		const { container } = render(Item, {
			value: { text: 'hello', image: 'https://example.com/img.png' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render image and icon', () => {
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
	it('Should render icon based on state', () => {
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
	it('Should render using field mapping', () => {
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
})
