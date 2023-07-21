import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import DropSearch from '../src/DropSearch.svelte'

describe('DropSearch.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const options = [{ text: 1 }, { text: 2 }, { text: 3 }]
		const { container } = render(DropSearch, { options })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
