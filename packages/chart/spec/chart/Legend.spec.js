import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Legend from '../../src/chart/Legend.svelte'

describe('Legend.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Legend)
		expect(container).toMatchSnapshot()
	})
})
