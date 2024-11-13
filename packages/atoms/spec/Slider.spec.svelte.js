import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import Slider from '../src/Slider.svelte'
import { tick } from 'svelte'

describe('Slider.svelte', () => {
	beforeEach(() => cleanup())

	it('should render', async () => {
		const props = $state({ class: 'foo' })
		const { container } = render(Slider, { props })
		expect(container).toBeTruthy()
		await tick()
		expect(container).toMatchSnapshot()
		props.class = 'bar'
		await tick()
		expect(container).toMatchSnapshot()
	})
})
