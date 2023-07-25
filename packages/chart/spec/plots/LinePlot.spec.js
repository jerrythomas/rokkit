import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import LinePlot from '../../src/plots/LinePlot.svelte'

describe('LinePlot.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(LinePlot)
		// expect(container).toMatchSnapshot()
	})
})
