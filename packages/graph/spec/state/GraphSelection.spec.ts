import { describe, it, expect, vi } from 'vitest'
import { flushSync } from 'svelte'
import { normalizeGraph } from '../../src/model/normalize.js'
import { GraphSelection } from '../../src/state/GraphSelection.svelte.js'
import type { RoutedEdge } from '../../src/layout/types.js'

const fields = { id: 'id', label: 'label', group: 'group', source: 'source', target: 'target' }
const model = normalizeGraph(
	[
		{ id: 'a', label: 'A', group: 'g' },
		{ id: 'b', label: 'B' },
		{ id: 'c', label: 'C' }
	],
	[
		{ source: 'a', target: 'b' },
		{ source: 'c', target: 'b' }
	],
	fields
)

const make = (onselect?: (id: string | null) => void) =>
	new GraphSelection({ model: () => model, routedEdges: () => [], onselect: () => onselect })

describe('GraphSelection', () => {
	it('starts empty: no value, no related, no entity, no relationships, no node or edge state', () => {
		const s = make()
		expect([s.value, s.entity, s.relationships, s.related.size]).toEqual([null, null, [], 0])
		expect(s.nodeState('a')).toBeNull()
		expect(s.edgeState({ fromKey: 'a', toKey: 'b' } as RoutedEdge)).toBeNull()
	})

	it('selecting derives related, entity and relationships, and reports the id', () => {
		const onselect = vi.fn()
		const s = make(onselect)
		s.select('b')
		flushSync()
		expect(onselect).toHaveBeenCalledWith('b')
		expect([...s.related].sort()).toEqual(['a', 'c'])
		expect(s.entity?.label).toBe('B')
		expect(s.relationships.map((r) => r.id)).toEqual(['a', 'c'])
		expect([s.nodeState('b'), s.nodeState('a'), s.nodeState('x')]).toEqual(['selected', 'related', 'dim'])
		expect(s.edgeState({ fromKey: 'a', toKey: 'b' } as RoutedEdge)).toBe('highlight')
		expect(s.edgeState({ fromKey: 'a', toKey: 'c' } as RoutedEdge)).toBe('dim')
	})

	it('clear reports null once, and not again on an already-empty selection', () => {
		const onselect = vi.fn()
		const s = make(onselect)
		s.select('a')
		s.clear()
		s.clear()
		expect(onselect.mock.calls).toEqual([['a'], [null]])
		expect(s.value).toBeNull()
	})

	it('adopt sets the value without reporting it', () => {
		const onselect = vi.fn()
		const s = make(onselect)
		s.adopt('c')
		expect(s.value).toBe('c')
		expect(onselect).not.toHaveBeenCalled()
	})

	it('toggles a card expanded, per node', () => {
		const s = make()
		s.toggleExpanded('a')
		expect([s.isExpanded('a'), s.isExpanded('b')]).toEqual([true, false])
		s.toggleExpanded('a')
		expect(s.isExpanded('a')).toBe(false)
	})
})
