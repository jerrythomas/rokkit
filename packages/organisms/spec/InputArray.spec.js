import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Register from './mocks/Register.svelte'
import InputArray from '../src/InputArray.svelte'

describe('InputArray.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default field mapping', () => {
		const { container } = render(Register, { render: InputArray })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
