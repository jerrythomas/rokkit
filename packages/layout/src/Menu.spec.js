import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Menu from './Menu.svelte'

describe('Menu.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation menu', () => {
		const { container } = render(Menu, {
			items: [{ name: 'Alpha' }, { name: 'Beta' }]
		})
		expect(container).toBeTruthy()
	})
})
