import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import List from './List.svelte'

const fields = {
	children: 'children',
	expanded: 'expanded',
	text: 'text'
}

function makeTreeData() {
	return [
		{
			text: 'Root 1',
			expanded: true,
			children: [
				{ text: 'Child 1.1', expanded: false, children: [] },
				{ text: 'Child 1.2', expanded: false, children: [] }
			]
		},
		{
			text: 'Root 2',
			expanded: false,
			children: [{ text: 'Child 2.1', expanded: false, children: [] }]
		}
	]
}

describe('List.svelte', () => {
	beforeEach(() => cleanup())

	it('renders all root nodes', () => {
		const items = makeTreeData()
		const { container, getByText } = render(List, { props: { items, fields } })
		expect(getByText('Root 1')).toBeTruthy()
		expect(getByText('Root 2')).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('renders children when expanded', () => {
		const items = makeTreeData()
		const { container, getByText } = render(List, { props: { items, fields } })
		expect(getByText('Child 1.1')).toBeTruthy()
		expect(getByText('Child 1.2')).toBeTruthy()
		// Child 2.1 should not be rendered because Root 2 is not expanded
		expect(() => getByText('Child 2.1')).toThrow()
		expect(container).toMatchSnapshot()
	})

	it('renders leaf and branch data attributes', () => {
		const items = makeTreeData()
		const { container } = render(List, { props: { items, fields } })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBeGreaterThan(0)
		// At least one branch and one leaf
		const branch = container.querySelector('[data-tree-branch]')
		const leaf = container.querySelector('[data-tree-leaf]')
		expect(branch).toBeTruthy()
		expect(leaf).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('passes focused and selected props', () => {
		const items = makeTreeData()
		const selectedKeys = new Set(['0'])
		const { container } = render(List, {
			props: { items, fields, focusedKey: '0', selectedKeys }
		})
		const focusedNode = container.querySelector('[data-tree-node][aria-current="true"]')
		const selectedNode = container.querySelector('[data-tree-node][aria-selected="true"]')
		expect(focusedNode).toBeTruthy()
		expect(selectedNode).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('renders nested lists recursively', () => {
		const items = makeTreeData()
		const { container } = render(List, { props: { items, fields } })
		// Should have nested data-tree-list elements
		const lists = container.querySelectorAll('[data-tree-list]')
		expect(lists.length).toBeGreaterThan(1)
		expect(container).toMatchSnapshot()
	})
})
