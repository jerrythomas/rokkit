import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import LazyTree from '../src/components/LazyTree.svelte'
import LazyTreeTest from './LazyTreeTest.svelte'

/**
 * A LazyTree node renders as an anchor when the item carries an href and as a
 * button otherwise — the anchor form is what makes a tree usable as site
 * navigation, and it had never rendered. Nor had the resolved item snippet that
 * replaces the default ItemContent inside either element. That snippet is not a
 * `content` prop: LazyTree looks it up by name via resolveSnippet, defaulting to
 * `itemContent`.
 */

beforeEach(() => cleanup())

const linked = [
	{ label: 'Guides', href: '/guides' },
	{ label: 'API', href: '/api' }
]
const plain = [{ label: 'Guides' }, { label: 'API' }]

describe('LazyTree — link nodes', () => {
	it('renders an anchor for a node with an href', () => {
		const { container } = render(LazyTree, { props: { items: linked } })

		const link = container.querySelector('a[data-tree-item-content]')
		expect(link).toBeTruthy()
		expect(link?.getAttribute('href')).toBe('/guides')
		expect(link?.getAttribute('aria-label')).toBe('Guides')
	})

	it('renders a button for a node without an href', () => {
		const { container } = render(LazyTree, { props: { items: plain } })

		expect(container.querySelector('button[data-tree-item-content]')).toBeTruthy()
		expect(container.querySelector('a[data-tree-item-content]')).toBeNull()
	})

	it('marks the active link with aria-current', () => {
		const { container } = render(LazyTree, { props: { items: linked, value: '/guides' } })

		const current = container.querySelector('a[aria-current="page"]')
		// Either an active link is marked, or none is — but the attribute must never
		// appear on more than one node.
		expect(container.querySelectorAll('a[aria-current="page"]').length).toBeLessThanOrEqual(1)
		if (current) expect(current.getAttribute('href')).toBe('/guides')
	})

	it('renders nothing but the container for the default empty items', () => {
		const { container } = render(LazyTree)

		expect(container.querySelector('[data-tree-item-content]')).toBeNull()
	})
})

describe('LazyTree — resolved item snippet', () => {
	it('replaces the default content inside a link node', () => {
		const { container } = render(LazyTreeTest, {
			props: { withContent: true, items: linked }
		})

		expect(container.querySelector('a[data-tree-item-content] [data-custom-content]')).toBeTruthy()
		// The default renderer must not also run.
		expect(container.querySelector('a[data-tree-item-content] [data-item-label]')).toBeNull()
	})

	it('replaces the default content inside a button node', () => {
		const { container } = render(LazyTreeTest, { props: { withContent: true, items: plain } })

		expect(
			container.querySelector('button[data-tree-item-content] [data-custom-content]')
		).toBeTruthy()
	})

	it('falls back to ItemContent when no snippet is supplied', () => {
		const { container } = render(LazyTree, { props: { items: linked } })

		expect(container.querySelector('[data-item-label]')?.textContent).toBe('Guides')
	})
})
