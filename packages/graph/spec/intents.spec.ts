/* What a press or a double-click on the canvas MEANS is decided by the state and written onto
 * the element as an intent; one action reads it back and calls `act`. Here: the intents each
 * element gets, and what `act` does with each.
 */
import { describe, it, expect, vi } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'
import { INTENTS } from '../src/state/intents.js'

const files = [
	{ id: 'ui', label: 'ui', path: ['ui'] },
	{ id: 'list', label: 'List.svelte', path: ['ui', 'List.svelte'] },
	{ id: 'tree', label: 'Tree.svelte', path: ['ui', 'Tree.svelte'] }
]
const world = () => new GraphState({ nodes: files, edges: [], layout: 'world', levels: 2 })
const box = (s: GraphState, name: string) => s.boxes.find((c) => c.name === name)!

describe('intents on a containment box', () => {
	it('a leaf selects on press and drills on open', () => {
		const s = world()
		const attrs = s.boxAttrs(box(s, 'List.svelte'))
		expect(attrs).toMatchObject({ 'data-graph-press': 'select', 'data-graph-open': 'drill', 'data-graph-key': 'list' })
	})

	it('a container that can be opened drills on press, and is labelled for it', () => {
		const s = world()
		const ui = box(s, 'ui')
		expect(s.canDrill(ui)).toBe(true)
		const attrs = s.boxAttrs(ui)
		expect(attrs['data-graph-press']).toBe('drill')
		expect(attrs['data-graph-key']).toBe(s.clusterKey(ui))
		expect(attrs['aria-label']).toBe(`Open ${s.caption(ui)}`)
		expect(s.interactive(ui)).toBe(true)
	})

	it('a region with nothing to do carries no intent and is not interactive', () => {
		const s = new GraphState({ nodes: [{ id: 'a', label: 'a', group: 'g' }, { id: 'b', label: 'b', group: 'g' }], edges: [], layout: 'cluster' })
		const region = s.clusters[0]
		expect(s.boxAttrs(region)['data-graph-press']).toBeUndefined()
		expect(s.interactive(region)).toBe(false)
	})

	it('captions a box by its name and count, or the caption the layout gave', () => {
		const s = world()
		expect(s.caption(box(s, 'ui'))).toBe(`ui · ${box(s, 'ui').caption ?? box(s, 'ui').count}`)
	})
})

describe('intents on a node card', () => {
	it('selects on press, and folds its group on open', () => {
		const s = new GraphState({ nodes: [{ id: 'a', label: 'a' }], edges: [] })
		expect(s.cardAttrs('a')).toMatchObject({ 'data-graph-press': 'select', 'data-graph-open': 'group', 'data-graph-key': 'a' })
	})
})

describe('act', () => {
	it('performs each intent on the state', () => {
		const s = world()
		s.act('select', 'list')
		expect(s.value).toBe('list')
		s.act('drill', s.clusterKey(box(s, 'ui')))
		expect(s.drillPath).toEqual(['ui'])
		s.act('crumb', '0')
		expect(s.drillPath).toEqual([])
		s.act('clear', null)
		expect(s.value).toBeNull()
	})

	it('drills into the selected box, and toggles the selected group', () => {
		const s = world()
		s.act('select', 'ui')
		const into = vi.spyOn(s, 'drillInto')
		s.act('open-selected', null)
		expect(into).toHaveBeenCalledTimes(s.drillTarget ? 1 : 0)
		const g = new GraphState({
			nodes: [{ id: 'x' }, { id: 'y' }, { id: 'cycle', members: ['x', 'y'], collapsed: true }],
			edges: []
		})
		g.act('select', 'cycle')
		expect(g.isCollapsed('cycle')).toBe(true)
		g.act('group-selected', null)
		expect(g.isCollapsed('cycle')).toBe(false)
	})

	it('folds a member’s group from the member, and expands a card’s rows', () => {
		const g = new GraphState({
			nodes: [{ id: 'x', rows: [{ name: 'a' }, { name: 'b' }] }, { id: 'y' }, { id: 'cycle', members: ['x', 'y'], collapsed: false }],
			edges: [],
			density: 'names'
		})
		g.act('group', 'x')
		expect(g.isCollapsed('cycle')).toBe(true)
		g.act('group', 'cycle')
		g.act('expand', 'x')
		expect(g.isExpanded('x')).toBe(true)
	})

	it('drills into a leaf by the node id it carries', () => {
		const s = world()
		const into = vi.spyOn(s, 'drillInto')
		s.act('drill', 'list')
		expect(into).toHaveBeenCalledWith(box(s, 'List.svelte'))
	})

	it('ignores an intent it does not know, and a key that names nothing', () => {
		const s = world()
		expect(() => s.act('nonsense' as never, 'x')).not.toThrow()
		expect(() => s.act('drill', 'no-such-box')).not.toThrow()
		expect(s.drillPath).toEqual([])
	})

	it('has one handler per intent in the vocabulary', () => {
		expect(Object.keys(INTENTS).sort()).toEqual(['clear', 'crumb', 'drill', 'expand', 'group', 'group-selected', 'open-selected', 'select'])
	})
})
