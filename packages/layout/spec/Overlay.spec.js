import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Overlay from '../src/Overlay.svelte'

describe('Overlay.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Overlay)
		expect(container).toMatchSnapshot()
	})
})
