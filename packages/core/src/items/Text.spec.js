import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Text from './Text.svelte'

describe('Text.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render', () => {
		const { container } = render(Text, { content: 'hello' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('Should render object', () => {
		const { container } = render(Text, { content: { text: 'hello' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render icon', () => {
		const { container } = render(Text, {
			content: { text: 'hello', icon: 'info' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render image', () => {
		const { container } = render(Text, {
			content: { text: 'hello', image: 'https://example.com/img.png' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render image and icon', () => {
		const { container } = render(Text, {
			content: {
				text: 'hello',
				image: 'https://example.com/img.png',
				icon: 'info'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using field mapping', () => {
		const { container } = render(Text, {
			content: {
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
