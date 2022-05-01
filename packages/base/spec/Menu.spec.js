import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import Menu from '../src/Menu.svelte'

describe('Menu.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation menu', () => {
		const { container } = render(Menu, {
			items: [{ name: 'Alpha' }, { name: 'Beta' }]
		})
		expect(container).toBeTruthy()
	})
})
