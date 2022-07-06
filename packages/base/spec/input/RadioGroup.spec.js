import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import RadioGroup from '../../src/input/RadioGroup.svelte'

describe('RadioGroup.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation RadioGroup', () => {
		const { container } = render(RadioGroup)
		expect(container).toBeTruthy()
	})
})
