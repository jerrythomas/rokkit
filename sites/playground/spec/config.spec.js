import { describe, beforeEach, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import HomePage from '../src/routes/index.svelte'

describe('SplitView.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the home page', () => {
		const { container } = render(HomePage)
		expect(container).toBeTruthy()
	})
})
