import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'

import ListItem from '../src/ListItem.svelte'

describe('ListItem.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(ListItem)
		expect(container).toBeTruthy()
	})
})
