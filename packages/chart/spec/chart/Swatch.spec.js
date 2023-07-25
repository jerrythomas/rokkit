import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Swatch from '../../src/chart/Swatch.svelte'

describe('Swatch.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(Swatch)
		// expect(container).toMatchSnapshot()
	})
})
