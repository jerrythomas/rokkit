import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Slider from '../src/Slider.svelte'

describe('Slider.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const { container } = render(Slider)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
