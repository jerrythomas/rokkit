import { describe, it, expect } from 'vitest'
import { flushSync } from 'svelte'
import { GraphState } from '../../src/GraphState.svelte.js'

/* Re-applying the same inputs must not re-normalise the model: a shade or layout switch is a
 * layout re-run over an unchanged model (24-world-view.md, Decision 4). Each input stays its own
 * signal, so an unchanged nodes / edges / fields reference must not fire it. */
describe('GraphState — an unchanged input is not re-normalised', () => {
	it('keeps the same model across apply() and update() with the same data', () => {
		const nodes = [{ id: 'a', path: ['p', 'a'] }, { id: 'b', path: ['p', 'b'] }]
		const s = new GraphState({ nodes, layout: 'world' })
		const before = s.model
		s.apply({ levels: 3 })
		expect(s.model).toBe(before)
		s.update({ nodes, layout: 'world', levels: 1 })
		expect(s.model).toBe(before)
	})

	it('re-normalises when the data does change', () => {
		const s = new GraphState({ nodes: [{ id: 'a' }] })
		const before = s.model
		s.update({ nodes: [{ id: 'a' }, { id: 'b' }] })
		expect(s.model).not.toBe(before)
		expect(s.model.nodes).toHaveLength(2)
	})

	it('follows a consumer’s own $state array as it grows in place', () => {
		const nodes = $state([{ id: 'a' }])
		let s!: GraphState
		const cleanup = $effect.root(() => {
			s = new GraphState({ nodes })
		})
		nodes.push({ id: 'b' })
		flushSync()
		expect(s.model.nodes.map((n) => n.id)).toEqual(['a', 'b'])
		cleanup()
	})
})
