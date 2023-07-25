import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Timer from '../../src/chart/Timer.svelte'

describe('Timer.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Timer)
		expect(container).toMatchSnapshot()
	})
})
