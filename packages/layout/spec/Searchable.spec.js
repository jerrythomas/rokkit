import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Searchable from '../src/Searchable.svelte'

describe('Searchable.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Searchable)
		expect(container).toMatchSnapshot()
	})
})
