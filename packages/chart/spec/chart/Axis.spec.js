import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Axis from '../../src/chart/Axis.svelte'

describe('Axis.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(Axis)
		// expect(container).toMatchSnapshot()
	})
})
