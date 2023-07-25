import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import TexturedShape from '../../src/chart/TexturedShape.svelte'

describe('TexturedShape.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(TexturedShape)
		// expect(container).toMatchSnapshot()
	})
})
