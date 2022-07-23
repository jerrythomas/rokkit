import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Searchable from '../src/Searchable.svelte'

describe('Searchable.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render', () => {
		const { container } = render(Searchable)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
