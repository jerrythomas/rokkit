import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Separator from '../src/Separator.svelte'

describe('Separator.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Separator)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
