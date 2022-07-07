import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Radio from '../../src/input/Radio.svelte'

describe('Radio.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation Radio', () => {
		const { container } = render(Radio)
		expect(container).toBeTruthy()
	})
})
