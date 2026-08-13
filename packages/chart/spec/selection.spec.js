import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Plot from '../src/Plot.svelte'

const line = [ { day: 0, v: 5 }, { day: 1, v: 9 }, { day: 2, v: 3 } ]
const clickFirst = (container, sel) => {
	const el = container.querySelector(sel)
	if (!el) throw new Error(`no element for ${sel}`)
	el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
	return el
}

describe('chart selection', () => {
	it('clicking a line point fires onselect with a rich detail', () => {
		const onselect = vi.fn()
		const spec = { data: line, x: 'day', y: 'v', geoms: [{ type: 'line' }] }
		const { container } = render(Plot, { props: { spec, onselect, grid: false, width: 400, height: 300 } })
		clickFirst(container, '[data-plot-element="line-hover"]')
		expect(onselect).toHaveBeenCalledTimes(1)
		const d = onselect.mock.calls[0][0]
		expect(d).toMatchObject({ geom: 'line', index: 0, value: 5, x: 0, y: 5 })
		// datum is the reactive row proxy — content matches the source row
		expect(d.datum).toMatchObject(line[0])
	})

	it('respects an initial selected prop (external control → highlighted)', async () => {
		const spec = { data: line, x: 'day', y: 'v', geoms: [{ type: 'line' }] }
		const { container } = render(Plot, {
			props: { spec, selected: [line[1]], grid: false, width: 400, height: 300 }
		})
		await tick()
		expect(container.querySelectorAll('[data-plot-highlight][data-plot-selected="true"]')).toHaveLength(1)
	})

	it('fires onselect for point / bar / area geoms', () => {
		const cases = [
			{ geom: 'point', spec: { data: line, x: 'day', y: 'v', geoms: [{ type: 'point' }] }, sel: '[data-plot-element="point"]', datum: line[0], value: 5 },
			{ geom: 'area', spec: { data: line, x: 'day', y: 'v', geoms: [{ type: 'area' }] }, sel: '[data-plot-element="area-hover"]', datum: line[0], value: 5 },
			{ geom: 'bar', spec: { data: [{ q: 'Q1', v: 5 }, { q: 'Q2', v: 9 }], x: 'q', y: 'v', geoms: [{ type: 'bar' }] }, sel: '[data-plot-element="bar"]', value: 5 }
		]
		for (const c of cases) {
			const onselect = vi.fn()
			const { container } = render(Plot, { props: { spec: c.spec, onselect, grid: false, width: 400, height: 300 } })
			clickFirst(container, c.sel)
			expect(onselect, c.geom).toHaveBeenCalledTimes(1)
			expect(onselect.mock.calls[0][0]).toMatchObject({ geom: c.geom, value: c.value })
		}
	})

	it('selectable toggles a highlighted selection (multi)', async () => {
		const spec = { data: line, x: 'day', y: 'v', geoms: [{ type: 'line' }] }
		const { container } = render(Plot, { props: { spec, selectable: true, grid: false, width: 400, height: 300 } })
		const hit = clickFirst(container, '[data-plot-element="line-hover"]')
		await tick()
		expect(container.querySelectorAll('[data-plot-highlight][data-plot-selected="true"]')).toHaveLength(1)
		hit.dispatchEvent(new MouseEvent('click', { bubbles: true })) // toggle off
		await tick()
		expect(container.querySelectorAll('[data-plot-highlight][data-plot-selected="true"]')).toHaveLength(0)
	})

	it('selecting a statically-highlighted point tags it selected (dedup prefers selected)', async () => {
		const spec = { data: line, x: 'day', y: 'v', geoms: [{ type: 'line' }] }
		const { container } = render(Plot, {
			props: { spec, highlight: 'last', selectable: true, grid: false, width: 400, height: 300 }
		})
		const hits = container.querySelectorAll('[data-plot-element="line-hover"]')
		hits[hits.length - 1].dispatchEvent(new MouseEvent('click', { bubbles: true })) // click the 'last' (highlighted) point
		await tick()
		expect(container.querySelectorAll('[data-plot-highlight][data-plot-selected="true"]')).toHaveLength(1)
	})

	it('LineChart wrapper forwards onselect', async () => {
		const { default: LineChart } = await import('../src/charts/LineChart.svelte')
		const onselect = vi.fn()
		const { container } = render(LineChart, {
			props: { data: line, x: 'day', y: 'v', onselect, grid: false, width: 400, height: 300 }
		})
		clickFirst(container, '[data-plot-element="line-hover"]')
		expect(onselect).toHaveBeenCalledTimes(1)
		expect(onselect.mock.calls[0][0]).toMatchObject({ geom: 'line', index: 0, value: 5 })
	})

	it('AreaChart wrapper forwards selectable (click highlights)', async () => {
		const { default: AreaChart } = await import('../src/charts/AreaChart.svelte')
		const { container } = render(AreaChart, {
			props: { data: line, x: 'day', y: 'v', selectable: true, grid: false, width: 400, height: 300 }
		})
		clickFirst(container, '[data-plot-element="area-hover"]')
		await tick()
		expect(container.querySelectorAll('[data-plot-highlight][data-plot-selected="true"]')).toHaveLength(1)
	})
})
