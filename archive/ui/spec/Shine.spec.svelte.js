import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import '@rokkit/helpers/mocks'
import ShineDemo from './mocks/ShineDemo.svelte'
import { id } from '@rokkit/core'

vi.mock('@rokkit/core', () => ({
	id: vi.fn().mockReturnValue('filter-id-1')
}))

describe('Shine', () => {
	/*
	 * Shine functionality changes the user experience on mouse move.
	 * This test just checks the rendering only. Playwright test with snapshot would be better
	 */
	it('should render', () => {
		const props = $state({})
		const { container } = render(ShineDemo, { props })

		expect(container).toMatchSnapshot()
		expect(id).toHaveBeenCalledWith('filter')
		props.color = '#666666'
		flushSync()
		expect(container).toMatchSnapshot()

		props.radius = 100
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
