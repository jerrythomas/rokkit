import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Bar from '../../src/elements/Bar.svelte'

describe('Bar.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		// const { container } = render(Bar)
		// expect(container).toMatchSnapshot ()
	})
})
