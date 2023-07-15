import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Item from '../src/Test.svelte'

describe('Test.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Item, { value: 'hello' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render empty content', () => {
		const { container } = render(Item, { value: null })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render object', () => {
		const { container } = render(Item, { value: { text: 'hello' } })
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
})
