import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import ColorRamp from '../../src/elements/ColorRamp.svelte'

describe('ColorRamp.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(ColorRamp)
		// expect(container).toMatchSnapshot()
	})
})
