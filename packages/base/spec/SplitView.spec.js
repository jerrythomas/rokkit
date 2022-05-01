import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import SplitView from '../src/SplitView.svelte'

describe('SplitView.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation SplitView', () => {
		const { container } = render(SplitView)
		expect(container).toBeTruthy()
	})
})
