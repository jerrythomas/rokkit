import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import SplitView from '../src/SplitView.svelte'

describe('SplitView.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(SplitView)
		expect(container).toBeTruthy()
	})
})
