import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import RangeTick from '../src/RangeTick.svelte'

describe('RangeTick.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(RangeTick, { value: 10, label: 10 })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
