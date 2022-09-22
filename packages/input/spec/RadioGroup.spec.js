import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import RadioGroup from './RadioGroup.svelte'

describe('RadioGroup.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation RadioGroup', () => {
		const { container } = render(RadioGroup)
		expect(container).toBeTruthy()
	})
})
