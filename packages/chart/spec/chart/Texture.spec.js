import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Texture from '../../src/chart/Texture.svelte'

describe('Texture.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(Texture)
		// expect(container).toMatchSnapshot()
	})
})
