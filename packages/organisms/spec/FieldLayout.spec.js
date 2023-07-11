import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import FieldLayout from '../src/FieldLayout.svelte'

describe('FieldLayout.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render using default field mapping', () => {
		const { container } = render(FieldLayout)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using field mappings', () => {})
	it('Should render items using custom component', () => {})
	it('Should expand and collapse', () => {})
	it('Should autoclose others', () => {})
	it('Should pass select and change events', () => {})
})
