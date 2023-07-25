import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Label from '../../src/elements/Label.svelte'

describe('Label.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Label)
		expect(container).toMatchSnapshot()
	})
})
