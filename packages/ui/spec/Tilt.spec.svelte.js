import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import '@rokkit/helpers/mocks'
import TiltDemo from './mocks/TiltDemo.svelte'

describe('Tilt', () => {
	/*
	 * Tilt functionality changes the user experience on hover/mouse move.
	 * This test just checks the rendering only. Playwright test with snapshot would be better
	 */
	it('should render', () => {
		const props = $state({})
		const { container } = render(TiltDemo, { props })
		expect(container).toMatchSnapshot()

		props.maxRotation = 20
		flushSync()
		expect(container).toMatchSnapshot()

		props.setBrightness = true
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
