import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Fillable from '../src/Fillable.svelte'

describe('Fillable.svelte', () => {
	beforeEach(() => cleanup())

	it('should render svg with default properties and title', () => {
		const { container } = render(Fillable)
		expect(container).toBeTruthy()
	})
})
