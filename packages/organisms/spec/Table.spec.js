import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Table from '../src/Table.svelte'

describe('Table.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default field mapping', () => {
		const { container } = render(Table, {
			props: { data: [{ id: 1, name: 'test' }], columns: [{ name: 'id' }, { name: 'name' }] }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	// it('should render using field mappings', () => {})
	// it('should render items using custom component', () => {})
	// it('should expand and collapse', () => {})
	// it('should autoclose others', () => {})
	// it('should pass select and change events', () => {})
})
