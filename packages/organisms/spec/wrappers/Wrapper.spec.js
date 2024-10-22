import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { Wrapper } from '../../src/wrappers'

describe('Wrapper.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default props', () => {
		const { container } = render(Wrapper)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified type', async () => {
		const { container, component } = render(Wrapper, { type: 'horizontal' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle type changes
		setProperties(component, { type: 'section' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', async () => {
		const { container, component } = render(Wrapper, { class: 'custom-class' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle class changes
		setProperties(component, { class: 'custom-class-2' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
