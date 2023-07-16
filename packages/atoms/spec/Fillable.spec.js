import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Fillable from '../src/Fillable.svelte'

describe('Fillable.svelte', () => {
	beforeEach(() => cleanup())

	it('should render fillable', () => {
		const { container } = render(Fillable, { text: 'fill the blanks ~~?~~' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
