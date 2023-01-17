import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import CheckBox from './CheckBox.svelte'

describe('CheckBox.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation CheckBox', () => {
		const { container } = render(CheckBox, { name: 'test' })
		expect(container).toBeTruthy()
	})
})
