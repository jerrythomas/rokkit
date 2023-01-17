import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import SplitPane from './SplitPane.svelte'

describe('SplitPane.svelte', () => {
	beforeEach(() => cleanup())

	it('should render the navigation SplitPane', () => {
		const { container } = render(SplitPane)
		expect(container).toBeTruthy()
	})
})
