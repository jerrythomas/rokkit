import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Tooltip from '../../src/elements/Tooltip.svelte'

describe('Tooltip.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Tooltip)
		expect(container).toMatchSnapshot()
	})
})
