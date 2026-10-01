import { describe, it, expect, vi } from 'vitest'
import { flushSync } from 'svelte'
import { GraphState } from '../../src/GraphState.svelte.js'

const FIELDS = { id: 'id', label: 'name', source: 'source', target: 'target', edgeWeight: 'w' }
const NODES = [
	{ id: 'api', name: 'api' },
	{ id: 'db', name: 'db' },
	{ id: 'scc', name: '3 in a cycle', members: ['tasks', 'indexer', 'watcher'], collapsed: true },
	{ id: 'tasks', name: 'tasks' },
	{ id: 'indexer', name: 'indexer' },
	{ id: 'watcher', name: 'watcher' }
]
const EDGES = [
	{ source: 'api', target: 'tasks', w: 300 },
	{ source: 'indexer', target: 'db', w: 1840 },
	{ source: 'tasks', target: 'indexer', w: 1840 },
	{ source: 'indexer', target: 'watcher', w: 96 },
	{ source: 'watcher', target: 'tasks', w: 4, weakest: true }
]
const make = (config = {}) => new GraphState({ nodes: NODES, edges: EDGES, fields: FIELDS, layout: 'flow', ...config })
const cardIds = (s: GraphState) => Object.keys(s.cards).sort()

describe('GraphState — groups (#166)', () => {
	it('draws a collapsed group in place of its members, with their edges aggregated', () => {
		const s = make()
		expect(cardIds(s)).toEqual(['api', 'db', 'scc'])
		expect([s.isGroup('scc'), s.isCollapsed('scc'), s.memberCount('scc')]).toEqual([true, true, 3])
		expect(s.routedEdges.map((e) => `${e.fromKey}>${e.toKey}`).sort()).toEqual(['api>scc', 'scc>db'])
	})

	it('expands to the members and their internal edges, and collapses back', () => {
		const s = make()
		s.toggleGroup('scc')
		flushSync()
		expect(cardIds(s)).toEqual(['api', 'db', 'indexer', 'tasks', 'watcher'])
		expect(s.routedEdges.find((e) => e.weakest)?.fromKey).toBe('watcher')
		expect(s.groupOf('tasks')).toBe('scc')
		s.toggleGroup('scc')
		flushSync()
		expect(cardIds(s)).toEqual(['api', 'db', 'scc'])
	})

	it('starts a group expanded when it says collapsed: false', () => {
		const s = make({ nodes: NODES.map((n) => (n.id === 'scc' ? { ...n, collapsed: false } : n)) })
		expect(s.isCollapsed('scc')).toBe(false)
		expect(cardIds(s)).toContain('tasks')
	})

	it('tells the host on each toggle, with the group node', () => {
		const onexpand = vi.fn()
		const oncollapse = vi.fn()
		const s = make({ onexpand, oncollapse })
		s.toggleGroup('scc')
		s.toggleGroup('scc')
		expect(onexpand).toHaveBeenCalledWith('scc', expect.objectContaining({ id: 'scc' }))
		expect(oncollapse).toHaveBeenCalledWith('scc', expect.objectContaining({ id: 'scc' }))
	})

	it('moves the selection onto the group when a selected member is collapsed into it', () => {
		const onselect = vi.fn()
		const s = make({ onselect })
		s.toggleGroup('scc')
		s.select('tasks')
		s.toggleGroup('scc')
		expect(s.value).toBe('scc')
		expect(onselect).toHaveBeenLastCalledWith('scc')
	})

	it('offers the selection’s group action: expand a collapsed group, collapse a member’s group', () => {
		const s = make()
		expect(s.groupAction).toBeNull()
		s.select('scc')
		expect(s.groupAction).toEqual({ kind: 'expand', group: 'scc', label: '3 in a cycle' })
		s.toggleGroup('scc')
		s.select('watcher')
		expect(s.groupAction).toEqual({ kind: 'collapse', group: 'scc', label: '3 in a cycle' })
		s.select('api')
		expect(s.groupAction).toBeNull()
	})

	it('ignores a toggle for a node that is not a group', () => {
		const onexpand = vi.fn()
		const s = make({ onexpand })
		expect(s.toggleGroup('api')).toBe(false)
		expect(onexpand).not.toHaveBeenCalled()
	})
})
