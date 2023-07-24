import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Scrollable from '../src/Scrollable.svelte'

describe('Scrollable.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Scrollable)
		expect(container).toMatchSnapshot()
	})
})
