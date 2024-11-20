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
		const props = $state({ type: 'horizontal' })
		const { container, component } = render(Wrapper, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle type changes
		props.type = 'section'
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', async () => {
		const props = $state({ class: 'custom-class' })
		const { container, component } = render(Wrapper, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle class changes

		props.class = 'custom-class-2'
		await tick()
		expect(container).toMatchSnapshot()
	})
})
