import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Viewport from '../wrapped/Viewport.svelte'

describe('Tree.Viewport', () => {
	beforeEach(() => {
		cleanup()
	})
	it('should render with string content', () => {
		const props = $state({})
		const { container } = render(Viewport, { props })
		expect(container).toMatchSnapshot()

		props.class = 'flex items-center justify-center p-10'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom content', () => {
		const props = $state({ option: 2 })
		const { container } = render(Viewport, { props })
		expect(container).toMatchSnapshot()

		props.class = 'flex items-center justify-center p-10'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom props', () => {
		const props = $state({ 'data-label-x': '', 'data-tree-empty': 'xyz' })
		const { container } = render(Viewport, { props })
		expect(container).toMatchSnapshot()
	})
})
