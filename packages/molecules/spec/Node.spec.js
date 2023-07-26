import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Node from '../src/Node.svelte'
import Item from '../src/Item.svelte'

describe('Node.svelte', () => {
	const using = { default: Item }
	beforeEach(() => cleanup())
	it('should render node', () => {
		const { container } = render(Node, { value: { text: 'Alpha' }, using })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render node with path', () => {
		const { container } = render(Node, {
			value: { text: 'Example', path: '/alpha' },
			using,
			path: [0]
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render node with collapsed icon', () => {
		const { container } = render(Node, {
			value: { text: 'Collapsed Node', children: ['A', 'B'], types: ['icon'] },
			using
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render node with expanded icon', () => {
		const { container } = render(Node, {
			value: {
				text: 'Expanded Node',
				children: ['A', 'B'],
				types: ['icon'],
				_open: true
			},
			using
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
	it('should render node sibling node', () => {
		const { container } = render(Node, {
			value: { text: 'Sibling Node', types: ['sibling'] },
			using
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render node when selected', () => {
		const { container } = render(Node, {
			value: { text: 'A Selected Node' },
			selected: true,
			using
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render node in rtl', () => {
		const { container } = render(Node, {
			value: { text: 'An RTL Node' },
			rtl: true,
			using
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render node when path changes', async () => {
		const { container, component } = render(Node, {
			value: { text: 'A Node' },
			path: [0],
			using
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
		component.$set({ path: [1] })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
