import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Node from '../src/Node.svelte'
import { flushSync } from 'svelte'

describe('Node', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: 'Item 1' })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render as a sibling', () => {
		const props = $state({ value: 'Item 1', types: ['sibling'], path: [0] })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render having child', () => {
		const props = $state({ value: 'Item 1', types: ['sibling', 'child'], path: [0, 0] })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render as last sibling', () => {
		const props = $state({ value: 'Item 1', types: ['last'], path: [3] })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with icon', () => {
		const props = $state({
			value: 'Item 1',
			types: ['child', 'icon'],
			path: [0]
		})
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
