import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Node from '../src/Node.svelte'
import { flushSync } from 'svelte'
import { NodeProxy } from '@rokkit/states'

describe('Node', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const proxy = new NodeProxy({ text: 'Item 1' }, [0])
		const props = $state({ value: proxy })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render as a sibling', () => {
		const proxy = new NodeProxy({ text: 'Item 1' }, [0])
		const props = $state({ value: proxy, types: ['sibling'] })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render having child', () => {
		const child = new NodeProxy({ text: 'Item 2' }, [0, 0])
		const props = $state({ value: child, types: ['sibling', 'child'] })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render as last sibling', () => {
		const proxy = new NodeProxy({ text: 'Item 1' }, [3])
		const props = $state({ value: proxy, types: ['last'] })
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with icon', () => {
		const proxy = new NodeProxy({ text: 'Item 1' }, [0])
		const props = $state({
			value: proxy,
			types: ['child', 'icon']
		})
		const { container } = render(Node, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
