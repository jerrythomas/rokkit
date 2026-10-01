/* #164 rendered: a share paints each box from the ramp, a picker switches the measure, and a
 * legend row says what the shade means.
 */
import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render, fireEvent } from '@testing-library/svelte'
import Treemap from '../src/diagrams/Treemap.svelte'
import Sunburst from '../src/diagrams/Sunburst.svelte'
import { GraphState } from '../src/GraphState.svelte.js'
import { resolveShade } from '../src/preset.js'

const nodes = [
	{ id: 'a', label: 'a.ts', path: ['ui', 'a'], measures: { size: 30, tested: 1, documented: 0 } },
	{ id: 'b', label: 'b.ts', path: ['ui', 'b'], measures: { size: 10, tested: 0, documented: 1 } },
	{ id: 'c', label: 'c.ts', path: ['core', 'c'], measures: { size: 5 } },
	{ id: 'd', label: 'd.ts', path: ['core', 'd'], measures: { size: 5 } }
]
const props = { nodes, sizeBy: 'size', levels: 2 }
const world = (extra = {}) => new GraphState({ nodes, layout: 'world', sizeBy: 'size', levels: 2, ...extra })
const box = (s: GraphState, name: string) => s.boxes.find((c) => c.name === name)!

describe('GraphState — shade', () => {
	it('paints a shaded box from the ramp, and an unshaded one from its group', () => {
		const s = world({ shadeBy: 'tested' })
		const ui = box(s, 'ui')
		expect(s.boxStyleAttr(ui)).toContain(`--group-fill:${resolveShade(0.75, 'light')['--group-fill']}`)
		expect(world().boxStyleAttr(box(world(), 'ui'))).toBe(world().groupStyleAttr('ui'))
	})

	it('marks a shaded box, and one whose share is missing', () => {
		const s = world({ shadeBy: 'tested' })
		expect(s.boxAttrs(box(s, 'ui'))['data-graph-shaded']).toBe('')
		expect(s.boxAttrs(box(s, 'core'))).toMatchObject({ 'data-graph-missing': 'color', 'data-graph-shaded': undefined })
	})

	it('switches the shaded measure without re-normalising the model', () => {
		const s = world({ shadeBy: 'tested' })
		const before = s.model
		s.apply({ shadeBy: 'documented' })
		expect(s.model).toBe(before)
		expect(box(s, 'ui').shade).toBe(0.25)
	})

	it('describes the shade for a legend — only where a containment view is shading', () => {
		const legend = world({ shadeBy: 'tested' }).shadeLegend
		expect(legend).toMatchObject({ measure: 'tested', low: resolveShade(0, 'light')['--group-fill'], high: resolveShade(1, 'light')['--group-fill'] })
		expect(world().shadeLegend).toBeNull()
		expect(new GraphState({ nodes, layout: 'flow', shadeBy: 'tested' }).shadeLegend).toBeNull()
	})
})

describe('Treemap — shade', () => {
	it('paints its boxes by the share it is given', () => {
		const { container } = render(Treemap, { ...props, shadeBy: 'tested' })
		const shaded = container.querySelectorAll<HTMLElement>('[data-graph-cluster][data-graph-shaded]')
		expect(shaded.length).toBeGreaterThan(0)
		expect(shaded[0].getAttribute('style')).toContain('--group-fill')
	})

	it('switches the measure from its picker, and turns shading off with “none”', async () => {
		const { container } = render(Treemap, { ...props, shadeBy: 'tested', controls: true })
		const picker = container.querySelector<HTMLSelectElement>('select[data-graph-measure="color"]')!
		expect([...picker.options].map((o) => o.value)).toEqual(expect.arrayContaining(['', 'tested', 'documented']))
		const ui = () => container.querySelector<HTMLElement>('[data-graph-cluster][data-node-group="ui"]')!.getAttribute('style')
		const tested = ui()
		await fireEvent.change(picker, { target: { value: 'documented' } })
		await tick()
		expect(ui()).not.toBe(tested)
		await fireEvent.change(picker, { target: { value: '' } })
		await tick()
		expect(container.querySelector('[data-graph-shaded]')).toBeNull()
	})

	it('says what the shade means in its legend', () => {
		const { container } = render(Treemap, { ...props, shadeBy: 'tested', legend: true })
		expect(container.querySelector('[data-legend-shade]')?.textContent).toContain('tested')
	})
})

describe('Sunburst — shade', () => {
	it('paints its wedges by the share it is given', () => {
		const { container } = render(Sunburst, { ...props, shadeBy: 'tested' })
		expect(container.querySelectorAll('[data-graph-wedge][data-graph-shaded]').length).toBeGreaterThan(0)
	})
})
