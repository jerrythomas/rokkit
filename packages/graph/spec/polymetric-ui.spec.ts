/* #168 rendered: boxes carrying three measures, the legend that names them, the pickers. */
import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render, fireEvent } from '@testing-library/svelte'
import PolymetricTree from '../src/diagrams/PolymetricTree.svelte'

const NODES = [
	{ id: 'crate', label: 'senseid' },
	{ id: 'indexer', label: 'indexer', parent: 'crate' },
	{ id: 'resolve', label: 'resolve.rs', parent: 'indexer', measures: { fns: 84, loc: 4460, churn: 37 } },
	{ id: 'fqn', label: 'fqn.rs', parent: 'indexer', measures: { fns: 12, loc: 380, churn: 2 } },
	{ id: 'routes', label: 'routes.rs', parent: 'indexer', measures: { fns: 5, loc: 100 } }
]
const leaf = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`[data-graph-cluster][data-graph-node-id="${id}"]`)!

describe('PolymetricTree', () => {
	it('draws with the polymetric layout, each leaf sized and shaded by its measures', () => {
		const { container } = render(PolymetricTree, { nodes: NODES, widthBy: 'fns', heightBy: 'loc', colorBy: 'churn' })
		expect(container.querySelector('[data-graph-world]')?.getAttribute('data-graph-layout')).toBe('polymetric')
		const resolve = leaf(container, 'resolve')
		const fqn = leaf(container, 'fqn')
		expect(parseFloat(resolve.style.width)).toBeGreaterThan(parseFloat(fqn.style.width))
		expect(resolve.style.getPropertyValue('--shade')).toBe('1')
		expect(parseFloat(fqn.style.getPropertyValue('--shade'))).toBeLessThan(1)
	})

	it('marks a box whose measure is missing, rather than showing it as zero', () => {
		const { container } = render(PolymetricTree, { nodes: NODES, widthBy: 'fns', heightBy: 'loc', colorBy: 'churn' })
		const routes = leaf(container, 'routes')
		expect(routes.getAttribute('data-graph-missing')).toBe('color')
		expect(routes.style.getPropertyValue('--shade')).toBe('')
	})

	it('names, in its legend, which measure is on which channel', () => {
		const { container } = render(PolymetricTree, { nodes: NODES, widthBy: 'fns', heightBy: 'loc', colorBy: 'churn' })
		const entries = [...container.querySelectorAll('[data-legend-channel]')].map((e) => [e.getAttribute('data-legend-channel'), e.textContent?.replace(/\s+/g, ' ').trim()])
		expect(entries).toEqual([
			['width', expect.stringContaining('Width fns')],
			['height', expect.stringContaining('Height loc')],
			['color', expect.stringContaining('Shade churn')]
		])
	})

	it('re-binds a channel from its picker, offering the measures the data has', async () => {
		const { container } = render(PolymetricTree, { nodes: NODES, widthBy: 'fns', heightBy: 'loc', colorBy: 'churn', controls: true })
		const width = container.querySelector<HTMLSelectElement>('[data-graph-measure="width"]')!
		const options = [...width.querySelectorAll('option')].map((o) => o.value)
		expect(options).toEqual(expect.arrayContaining(['fns', 'loc', 'churn', 'degree']))
		const before = parseFloat(leaf(container, 'fqn').style.width)
		await fireEvent.change(width, { target: { value: 'loc' } })
		await tick()
		expect(parseFloat(leaf(container, 'fqn').style.width)).not.toBe(before)
		expect(container.querySelector('[data-legend-channel="width"]')?.textContent).toContain('loc')
	})

	it('offers no colour at all — "none" — for a host with only two metrics yet', async () => {
		const { container } = render(PolymetricTree, { nodes: NODES, widthBy: 'fns', heightBy: 'loc', controls: true })
		expect(leaf(container, 'resolve').style.getPropertyValue('--shade')).toBe('')
		expect(container.querySelector('[data-legend-channel="color"]')).toBeNull()
		const color = container.querySelector<HTMLSelectElement>('[data-graph-measure="color"]')!
		expect(color.value).toBe('')
	})
})

describe('PolymetricTree — composition', () => {
	it('with the caller’s state, merges only its own channels and keeps the caller’s data', async () => {
		const { GraphState } = await import('../src/GraphState.svelte.js')
		const state = new GraphState({ nodes: NODES, layout: 'flow' })
		render(PolymetricTree, { state, widthBy: 'fns', heightBy: 'loc' })
		await tick()
		expect(state.layoutName).toBe('polymetric')
		expect(state.channels?.width.measure).toBe('fns')
		expect(state.model.nodes).toHaveLength(5)
	})

	it('re-binds height and shade from their pickers, and can turn the shade off', async () => {
		const { container } = render(PolymetricTree, { nodes: NODES, widthBy: 'fns', heightBy: 'loc', colorBy: 'churn', controls: true })
		await fireEvent.change(container.querySelector('[data-graph-measure="height"]')!, { target: { value: 'fns' } })
		await tick()
		expect(container.querySelector('[data-legend-channel="height"]')?.textContent).toContain('fns')
		await fireEvent.change(container.querySelector('[data-graph-measure="color"]')!, { target: { value: '' } })
		await tick()
		expect(container.querySelector('[data-legend-channel="color"]')).toBeNull()
		expect(leaf(container, 'resolve').style.getPropertyValue('--shade')).toBe('')
	})

	it('draws no legend when asked not to', () => {
		const { container } = render(PolymetricTree, { nodes: NODES, widthBy: 'fns', heightBy: 'loc', legend: false })
		expect(container.querySelector('[data-graph-legend]')).toBeNull()
	})
})
