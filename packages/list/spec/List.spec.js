import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import List from '../src/List.svelte'

describe('List.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render using default field mapping', () => {
		const { container } = render(List)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using field mappings', () => {})
	it('Should render items using custom component', () => {})
	it('Should emit select event', () => {})
	it('Should pass change event', () => {})
})
