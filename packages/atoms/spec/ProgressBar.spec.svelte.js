import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import ProgressBar from '../src/ProgressBar.svelte'

describe('ProgressBar.svelte', () => {
	beforeEach(() => cleanup())

	it('should render indeterminate progress', () => {
		const { container } = render(ProgressBar)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render progress with custom height, indicator width', () => {
		const props = $state({ height: '3px', width: 50 })
		const { container } = render(ProgressBar, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render progress bar with value', () => {
		const props = $state({ value: 50, max: 100 })
		const { container } = render(ProgressBar, {
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.value = 100
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render progress bar with class', () => {
		const props = $state({ class: 'my-class' })
		const { container } = render(ProgressBar, {
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'my-class-2'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
