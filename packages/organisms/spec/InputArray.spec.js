import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import InputArray from '../src/InputArray.svelte'

describe('InputArray.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render using default field mapping', () => {
		const { container } = render(InputArray)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('Should render using field mappings', () => {})
	it('Should render items using custom component', () => {})
	it('Should expand and collapse', () => {})
	it('Should autoclose others', () => {})
	it('Should pass select and change events', () => {})
})
