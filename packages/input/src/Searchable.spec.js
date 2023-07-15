import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Searchable from './Searchable.svelte'

describe('Searchable.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Searchable)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
