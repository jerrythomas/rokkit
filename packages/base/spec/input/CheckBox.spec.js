import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import CheckBox from '../../src/input/CheckBox.svelte'

describe('CheckBox.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation CheckBox', () => {
		const { container } = render(CheckBox)
		expect(container).toBeTruthy()
	})
})
