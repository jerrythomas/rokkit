import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import SplitPane from '../src/SplitPane.svelte'

describe('SplitPane.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation SplitPane', () => {
		const { container } = render(SplitPane)
		expect(container).toBeTruthy()
	})
})
