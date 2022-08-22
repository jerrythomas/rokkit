import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import SplitView from './SplitView.svelte'

describe('SplitView.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation SplitView', () => {
		const { container } = render(SplitView)
		expect(container).toBeTruthy()
	})
})
