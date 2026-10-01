/* The legend's words come from the locale, and its rows from the state. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { messages } from '@rokkit/states'
import GraphLegend from '../src/GraphLegend.svelte'
import { GraphState } from '../src/GraphState.svelte.js'

afterEach(() => messages.reset())

describe('GraphLegend text', () => {
	it('labels the key, the hidden stroke and a channel’s cap from the locale', () => {
		messages.register('de', { graph: { legend: 'Legende', legendHidden: 'Verdeckte Kopplung', legendCap: 'voll bei {cap}', width: 'Breite' } })
		messages.setLocale('de')
		const state = new GraphState({ nodes: [{ id: 'f', parent: 'd', measures: { fns: 4 } }], edges: [], layout: 'polymetric', widthBy: 'fns' })
		const { container } = render(GraphLegend, { state, hidden: true, channels: true })
		expect(container.querySelector('[data-graph-legend]')?.getAttribute('aria-label')).toBe('Legende')
		expect(container.querySelector('[data-legend-hidden]')?.textContent).toContain('Verdeckte Kopplung')
		expect(container.querySelector('[data-legend-channel="width"]')?.textContent).toContain('Breite')
		expect(container.querySelector('[data-legend-channel="width"] [data-legend-cap]')?.textContent).toBe('voll bei 4')
	})

	it('names an arc diagram’s sides from the state, unless it is given names', () => {
		const state = new GraphState({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ source: 'a', target: 'b', overlay: true }], layout: 'arcs' })
		const names = (c: HTMLElement) => [...c.querySelectorAll('[data-legend-side]')].map((e) => e.textContent?.trim())
		expect(names(render(GraphLegend, { state, sides: true }).container)).toEqual(['← Declared', 'Observed →'])
		expect(names(render(GraphLegend, { state, sides: ['Calls', 'Edits'] }).container)).toEqual(['← Calls', 'Edits →'])
	})

	it('reports a picked entry with its section, through one delegated listener', async () => {
		const onpick = vi.fn()
		const state = new GraphState({ nodes: [{ id: 'a', kind: 'materialized_view' }], edges: [] })
		const { container } = render(GraphLegend, { state, kinds: true, onpick })
		const entry = container.querySelector<HTMLElement>('[data-legend-kind="materialized_view"]')!
		expect(entry.textContent).toContain('materialized view')
		await fireEvent.click(entry)
		expect(onpick).toHaveBeenCalledWith('kind', 'materialized_view')
	})
})
