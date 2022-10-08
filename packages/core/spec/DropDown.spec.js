import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import DropDown from '../src/DropDown.svelte'

describe('DropDown.svelte', () => {
	beforeEach(() => cleanup())

	it('Should render', () => {
		// const { container } = render(DropDown)
		// expect(container).toBeTruthy()
		// expect(container).toMatchSnapshot()
	})
})
