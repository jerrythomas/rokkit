import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import Node from './Node.svelte'

describe('Node.svelte', () => {
	const fields = {
		text: 'label',
		children: 'children',
		expanded: 'expanded',
		snippet: 'snippet'
	}

	const baseNode = {
		label: 'Root Node',
		expanded: false,
		children: []
	}

	beforeEach(() => cleanup())

	it('renders node with label', () => {
		const { container, getByText } = render(Node, {
			props: {
				value: baseNode,
				fields,
				path: [0],
				focused: false,
				selected: false,
				expanded: false
			}
		})
		const contentEl = container.querySelector('[data-tree-content]')
		expect(contentEl).not.toBeNull()
		expect(contentEl.textContent).toContain('Root Node')
		expect(container).toMatchSnapshot()
	})

	it('sets data-tree-leaf for leaf node', () => {
		const { container } = render(Node, {
			props: {
				value: baseNode,
				fields,
				path: [0]
			}
		})
		const nodeDiv = container.querySelector('[data-tree-node]')
		expect(nodeDiv.getAttribute('data-tree-leaf')).toBe('true')
		expect(nodeDiv.getAttribute('data-tree-branch')).toBeNull()
		expect(container).toMatchSnapshot()
	})

	it('sets data-tree-branch for branch node', () => {
		const branchNode = {
			label: 'Branch Node',
			expanded: true,
			children: [{ label: 'Child', expanded: false, children: [] }]
		}
		const { container } = render(Node, {
			props: {
				value: branchNode,
				fields,
				path: [0]
			}
		})
		const nodeDiv = container.querySelector('[data-tree-node]')
		expect(nodeDiv.getAttribute('data-tree-branch')).toBe('true')
		expect(nodeDiv.getAttribute('data-tree-leaf')).toBeNull()
		expect(container).toMatchSnapshot()
	})

	it('sets aria attributes correctly', () => {
		const { container } = render(Node, {
			props: {
				value: baseNode,
				fields,
				path: [0],
				focused: true,
				selected: true,
				expanded: true
			}
		})
		const nodeDiv = container.querySelector('[data-tree-node]')
		expect(nodeDiv.getAttribute('aria-current')).toBe('true')
		expect(nodeDiv.getAttribute('aria-selected')).toBe('true')
		expect(nodeDiv.getAttribute('aria-expanded')).toBe('true')
		expect(container).toMatchSnapshot()
	})

	// it('renders custom snippet if provided', () => {
	// 	const snippet = (node) => `<span>Custom: ${node.label}</span>`
	// 	const { container, getByText } = render(Node, {
	// 		props: {
	// 			value: baseNode,
	// 			fields,
	// 			path: [0],
	// 			snippets: { [baseNode.snippet]: snippet }
	// 		}
	// 	})
	// 	const contentEl = container.querySelector('[data-tree-content]')
	// 	expect(contentEl).not.toBeNull()
	// 	expect(contentEl.textContent).toContain('Custom: Root Node')
	// 	expect(container).toMatchSnapshot()
	// })
})
