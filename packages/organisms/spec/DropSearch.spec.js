import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import DropSearch from '../src/DropSearch.svelte'

describe('DropSearch.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(DropSearch)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
