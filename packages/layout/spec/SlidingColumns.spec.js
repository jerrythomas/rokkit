import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import SlidingColumns from '../src/SlidingColumns.svelte'

describe('SlidingColumns.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render', () => {
		const { container } = render(SlidingColumns, { columns: ['one', 'two'] })
		expect(container).toMatchSnapshot()
	})
})
