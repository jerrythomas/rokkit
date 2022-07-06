import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import Radio from '../../src/input/Radio.svelte'

describe('Radio.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation Radio', () => {
		const { container } = render(Radio)
		expect(container).toBeTruthy()
	})
})
