import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import DataList from '../../src/components/DataList.svelte'

describe('DataList.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render', () => {
		const { container } = render(DataList, { id: 'items', items: ['alpha'] })
		expect(container).toMatchSnapshot()
	})
})
