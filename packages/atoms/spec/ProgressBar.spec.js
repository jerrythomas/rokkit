import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { setProperties } from 'validators'
import ProgressBar from '../src/ProgressBar.svelte'

describe('ProgressBar.svelte', () => {
	beforeEach(() => cleanup())

	it('should render indeterminate progress', () => {
		const { container } = render(ProgressBar)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render progress with custom height, indicator width', () => {
		const { container } = render(ProgressBar, { props: { height: '3px', width: 50 } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render progress bar with value', async () => {
		const { container, component } = render(ProgressBar, {
			props: {
				value: 50,
				max: 100
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		setProperties(component, { value: 100 })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render progress bar with class', async () => {
		const { container, component } = render(ProgressBar, {
			class: 'my-class'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		setProperties(component, { class: 'my-class-1' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
