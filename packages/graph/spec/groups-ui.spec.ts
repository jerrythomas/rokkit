/* #166 in the rendered diagram: a collapsed group node, its expansion, and the weakest edge. */
import { describe, it, expect, vi } from 'vitest'
import { tick } from 'svelte'
import { render, fireEvent } from '@testing-library/svelte'
import DependencyDiagram from '../src/diagrams/DependencyDiagram.svelte'

const NODES = [
	{ id: 'api', label: 'api' },
	{ id: 'db', label: 'db' },
	{ id: 'scc', label: '3 in a cycle', members: ['tasks', 'indexer', 'watcher'], collapsed: true },
	{ id: 'tasks', label: 'tasks' },
	{ id: 'indexer', label: 'indexer' },
	{ id: 'watcher', label: 'watcher' }
]
const EDGES = [
	{ source: 'api', target: 'tasks', weight: 300 },
	{ source: 'api', target: 'indexer', weight: 20 },
	{ source: 'indexer', target: 'db', weight: 1840 },
	{ source: 'tasks', target: 'indexer', weight: 1840 },
	{ source: 'indexer', target: 'watcher', weight: 96 },
	{ source: 'watcher', target: 'tasks', weight: 4, weakest: true }
]
const card = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`[data-graph-node="${id}"]`)
const view = (props = {}) => render(DependencyDiagram, { nodes: NODES, edges: EDGES, ...props })

describe('a collapsed group node', () => {
	it('renders distinctly and shows how many members it stands for', () => {
		const { container } = view()
		const g = card(container, 'scc')!
		expect(g.hasAttribute('data-graph-collapsed')).toBe(true)
		expect(g.hasAttribute('data-graph-group')).toBe(true)
		expect(g.querySelector('[data-graph-node-count]')?.textContent).toBe('3')
		expect(card(container, 'tasks')).toBeNull()
	})

	it('aggregates its members’ edges — one edge in, one out, counting what it stands for', () => {
		const { container } = view()
		const into = container.querySelector('[data-edge-from="api"][data-edge-to="scc"]')
		expect(into?.getAttribute('data-edge-count')).toBe('2')
		expect(container.querySelector('[data-edge-from="scc"][data-edge-to="db"]')).not.toBeNull()
	})

	it('expands from its inline control — click or Enter — without selecting it', async () => {
		const onselect = vi.fn()
		const onexpand = vi.fn()
		const { container } = view({ onselect, onexpand })
		const toggle = card(container, 'scc')!.querySelector<HTMLElement>('[data-graph-group-toggle]')!
		expect(toggle.getAttribute('role')).toBe('button')
		expect(toggle.getAttribute('aria-label')).toBe('Expand 3 in a cycle')
		await fireEvent.keyDown(toggle, { key: 'Enter' })
		await tick()
		expect(onexpand).toHaveBeenCalledWith('scc', expect.objectContaining({ id: 'scc' }))
		expect(onselect).not.toHaveBeenCalled()
		expect(card(container, 'scc')).toBeNull()
		expect(card(container, 'tasks')?.getAttribute('data-graph-member-of')).toBe('scc')
	})
})

describe('an expanded group', () => {
	it('shows the members and the edges among them, the weakest one marked', async () => {
		const { container } = view()
		await fireEvent.click(card(container, 'scc')!.querySelector('[data-graph-group-toggle]')!)
		await tick()
		const weakest = container.querySelector('[data-edge-weakest]')
		expect(weakest?.getAttribute('data-edge-from')).toBe('watcher')
		expect(weakest?.getAttribute('data-edge-to')).toBe('tasks')
		expect(container.querySelectorAll('[data-edge-weakest]')).toHaveLength(1)
	})

	it('collapses back on a member’s double-click', async () => {
		const oncollapse = vi.fn()
		const { container } = view({ oncollapse })
		await fireEvent.click(card(container, 'scc')!.querySelector('[data-graph-group-toggle]')!)
		await tick()
		await fireEvent.dblClick(card(container, 'indexer')!)
		await tick()
		expect(oncollapse).toHaveBeenCalledWith('scc', expect.objectContaining({ id: 'scc' }))
		expect(card(container, 'scc')).not.toBeNull()
	})

	it('the drill bar offers Collapse for a selected member — the keyboard route back', async () => {
		const { container } = view()
		await fireEvent.click(card(container, 'scc')!.querySelector('[data-graph-group-toggle]')!)
		await tick()
		await fireEvent.click(card(container, 'watcher')!)
		await tick()
		const action = container.querySelector<HTMLElement>('[data-graph-group-action]')
		expect(action?.textContent).toContain('Collapse 3 in a cycle')
		await fireEvent.click(action!)
		await tick()
		expect(card(container, 'scc')).not.toBeNull()
		expect(card(container, 'scc')?.getAttribute('data-node-state')).toBe('selected')
	})
})
