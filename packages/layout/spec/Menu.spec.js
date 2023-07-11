import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Menu from '../src/Menu.svelte'

describe('Menu.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation menu', () => {
		const { container } = render(Menu, {
			items: [{ name: 'Alpha' }, { name: 'Beta' }]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render with icon', () => {
		const { container } = render(Menu, {
			items: [
				{ name: 'Alpha', icon: 'alpha' },
				{ name: 'Beta', icon: 'beta' }
			]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
