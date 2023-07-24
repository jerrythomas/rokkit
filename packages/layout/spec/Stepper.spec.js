import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Stepper from '../src/Stepper.svelte'

describe('Stepper.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Stepper, { data: [] })
		expect(container).toBeTruthy()
	})
})
