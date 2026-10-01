/* Every word the state and the layouts produce comes from `messages.graph`, so a locale
 * replaces it — the canvas has no English of its own.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { messages } from '@rokkit/states'
import { GraphState } from '../src/GraphState.svelte.js'

afterEach(() => messages.reset())

const de = (graph: Record<string, string>) => {
	messages.register('de', { graph })
	messages.setLocale('de')
}

describe('GraphState text', () => {
	const table = { id: 't', label: 't', rows: Array.from({ length: 12 }, (_, i) => ({ name: `c${i}`, type: 'int' })) }

	it('names the diagram from the locale when no label is given', () => {
		const s = new GraphState({ nodes: [{ id: 'a' }], edges: [] })
		expect(s.label).toBe('Diagram of 1 node and 0 relationships')
		de({ diagram: '{nodes}, {edges}', nodeOne: '{n} Knoten', relationshipMany: '{n} Beziehungen' })
		expect(s.label).toBe('1 Knoten, 0 Beziehungen')
	})

	it('words the “more rows” control from the locale', () => {
		const s = new GraphState({ nodes: [table], edges: [], density: 'names' })
		const more = s.moreLabel('t')
		expect(more).toMatch(/^\+ \d+ more$/)
		de({ more: 'noch {n}' })
		expect(s.moreLabel('t')).toMatch(/^noch \d+$/)
	})

	it('names unlabelled layers from the locale', () => {
		const nodes = [{ id: 'a', layer: 0 }, { id: 'b' }]
		de({ layer: 'Ebene {n}', layerUnassigned: 'Ohne Ebene' })
		const s = new GraphState({ nodes, edges: [], layout: 'layers' })
		expect(s.clusters.map((c) => c.name)).toEqual(['Ebene 0', 'Ohne Ebene'])
	})
})

describe('GraphState.channelRows', () => {
	it('is one row per polymetric channel, labelled from the locale', () => {
		const nodes = [{ id: 'f', parent: 'd', measures: { fns: 3, loc: 40, churn: 2 } }]
		const s = new GraphState({ nodes, edges: [], layout: 'polymetric', widthBy: 'fns', heightBy: 'loc', colorBy: 'churn' })
		expect(s.channelRows.map((r) => [r.key, r.label, r.scale.measure])).toEqual([
			['width', 'Width', 'fns'],
			['height', 'Height', 'loc'],
			['color', 'Shade', 'churn']
		])
		de({ shade: 'Tönung' })
		expect(s.channelRows[2].label).toBe('Tönung')
	})

	it('has no shade row without a colour channel, and no rows off polymetric', () => {
		const nodes = [{ id: 'f', parent: 'd', measures: { fns: 3 } }]
		expect(new GraphState({ nodes, edges: [], layout: 'polymetric' }).channelRows.map((r) => r.key)).toEqual(['width', 'height'])
		expect(new GraphState({ nodes, edges: [], layout: 'flow' }).channelRows).toEqual([])
	})
})

describe('GraphState.sideNames', () => {
	const nodes = [{ id: 'a' }, { id: 'b' }]

	it('names each side of an arc diagram by the relations drawn there', () => {
		const edges = [
			{ source: 'a', target: 'b', set: 'imports' },
			{ source: 'a', target: 'b', set: 'cochange' }
		]
		const s = new GraphState({ nodes, edges, fields: { relation: 'set' }, layout: 'arcs', above: 'cochange' })
		expect(s.sideNames).toEqual({ below: 'imports', above: 'cochange' })
	})

	it('falls back to Declared / Observed from the locale when a side has no relation', () => {
		const s = new GraphState({ nodes, edges: [{ source: 'a', target: 'b' }, { source: 'a', target: 'b', overlay: true }], layout: 'arcs' })
		expect(s.sideNames).toEqual({ below: 'Declared', above: 'Observed' })
		de({ sideAbove: 'Beobachtet' })
		expect(s.sideNames.above).toBe('Beobachtet')
	})
})

describe('drillErrorText', () => {
	it('words a failed drill from the error, or says nothing when there is none', async () => {
		const { drillErrorText } = await import('../src/state/text.js')
		expect(drillErrorText(null)).toBeNull()
		expect(drillErrorText(new Error('offline'))).toBe('Could not open: offline')
		expect(drillErrorText('timeout')).toBe('Could not open: timeout')
		de({ drillError: 'Fehler: {message}' })
		expect(drillErrorText('timeout')).toBe('Fehler: timeout')
	})
})
