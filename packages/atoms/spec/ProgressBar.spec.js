import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import ProgressBar from '../src/ProgressBar.svelte'

describe('ProgressBar.svelte', () => {
	beforeEach(() => cleanup())

	it('should render indeterminate progress', () => {
		const { container } = render(ProgressBar)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render progress with custom height, indicator width', () => {
		const { container } = render(ProgressBar, { height: '3px', width: 50 })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render progress bar with value', async () => {
		const { container, component } = render(ProgressBar, {
			value: 50,
			max: 100
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ value: 100 })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
