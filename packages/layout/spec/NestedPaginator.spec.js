import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import NestedPaginator from '../src/NestedPaginator.svelte'

describe('NestedPaginator.svelte', () => {
	const items = [
		{ id: 1, text: 'Item 1' },
		{ id: 2, text: 'Item 2' }
	]
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(NestedPaginator, { items })
		expect(container).toBeTruthy()
	})
})
