import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Scrollable from '../src/Scrollable.svelte'

describe('Scrollable.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render', () => {
		const { container } = render(Scrollable)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
