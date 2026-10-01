/* A locale replaces every word graph shows — controls, the drill bar, the entity views. */
import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { messages } from '@rokkit/states'
import ZoomControl from '../src/controls/ZoomControl.svelte'
import DensityControl from '../src/controls/DensityControl.svelte'
import DepthControl from '../src/controls/DepthControl.svelte'
import ViolationsControl from '../src/controls/ViolationsControl.svelte'
import HiddenControl from '../src/controls/HiddenControl.svelte'
import BundleControl from '../src/controls/BundleControl.svelte'
import EdgeStyleControl from '../src/controls/EdgeStyleControl.svelte'
import MeasureControl from '../src/controls/MeasureControl.svelte'
import DrillBar from '../src/controls/DrillBar.svelte'
import EntityView from '../src/schema/EntityView.svelte'
import { GraphState } from '../src/GraphState.svelte.js'

afterEach(() => messages.reset())

const de = (graph: Record<string, string>) => {
	messages.register('de', { graph })
	messages.setLocale('de')
}
const text = (c: HTMLElement, sel: string, attr?: string) => {
	const el = c.querySelector(sel)
	return attr ? el?.getAttribute(attr) : el?.textContent?.trim()
}

describe('graph text in another locale', () => {
	it('words the zoom, density and depth controls', () => {
		de({ zoom: 'Zoomen', zoomIn: 'Vergrößern', densityKeys: 'Schlüssel', levelsShown: 'Ebenen', levelMany: '{n} Ebenen' })
		const zoom = render(ZoomControl, {}).container
		expect(text(zoom, '[data-graph-zoom-controls]', 'aria-label')).toBe('Zoomen')
		expect(text(zoom, '[data-graph-zoom="in"]', 'aria-label')).toBe('Vergrößern')
		expect(text(render(DensityControl, {}).container, '[data-graph-density="keys"]')).toBe('Schlüssel')
		const depth = render(DepthControl, { max: 3 }).container
		expect(text(depth, '[data-graph-depth-controls]', 'aria-label')).toBe('Ebenen')
		expect(text(depth, '[data-graph-depth="2"]', 'title')).toBe('2 Ebenen')
	})

	it('words every toggle', () => {
		de({ allEdges: 'Alle Kanten', allPairs: 'Alle Paare', bundled: 'Gebündelt', curved: 'Gebogen' })
		expect(text(render(ViolationsControl, {}).container, '[data-graph-control-label]')).toBe('Alle Kanten')
		expect(text(render(HiddenControl, {}).container, '[data-graph-control-label]')).toBe('Alle Paare')
		expect(text(render(BundleControl, {}).container, '[data-graph-control-label]')).toBe('Gebündelt')
		expect(text(render(EdgeStyleControl, {}).container, '[data-graph-control-label]')).toBe('Gebogen')
	})

	it('words the measure picker', () => {
		de({ width: 'Breite', measureNone: 'keine' })
		const c = render(MeasureControl, { channel: 'width', options: ['loc'], allowNone: true }).container
		expect(text(c, '[data-graph-control-label]')).toBe('Breite')
		expect(text(c, 'option[value=""]')).toBe('keine')
	})

	it('words the drill bar', () => {
		de({ drillPath: 'Pfad', drillRoot: 'Alles' })
		const state = new GraphState({ nodes: [{ id: 'f', path: ['ui', 'f'] }], edges: [], layout: 'world', focusPath: ['ui'] })
		const c = render(DrillBar, { state }).container
		expect(text(c, '[data-graph-drill]', 'aria-label')).toBe('Pfad')
		expect(text(c, 'button[data-graph-drill-crumb]')).toBe('Alles')
	})

	it('words the entity view', () => {
		de({ noEntity: 'Keine Entität gewählt.' })
		const state = new GraphState({ nodes: [], edges: [] })
		expect(render(EntityView, { state }).container.textContent).toContain('Keine Entität gewählt.')
	})
})
