import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
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
		const { container } = render(Wrapper, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		// handle type changes
		props.type = 'section'
		flushSync()
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', async () => {
		const props = $state({ class: 'custom-class' })
		const { container } = render(Wrapper, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'custom-class-2'
		flushSync()
		await tick()
		expect(container).toMatchSnapshot()
	})
})
