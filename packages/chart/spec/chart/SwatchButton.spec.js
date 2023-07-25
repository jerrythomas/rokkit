import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import SwatchButton from '../../src/chart/SwatchButton.svelte'

describe('SwatchButton.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(SwatchButton)
		// expect(container).toMatchSnapshot()
	})
})
