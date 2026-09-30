/* Drilling in the rendered diagrams (#165) — the gestures, the trail, pending and failure.
 *
 * Shaped like the issue's own example: crates containing modules. `senseid` is a DECLARED
 * container (a real node with an id); `cli` is synthesised from its members' paths.
 */
import { describe, it, expect, vi } from 'vitest'
import { tick } from 'svelte'
import { render, fireEvent } from '@testing-library/svelte'
import Treemap from '../src/diagrams/Treemap.svelte'
import Sunburst from '../src/diagrams/Sunburst.svelte'
import { GraphState } from '../src/GraphState.svelte.js'

const LEVEL = [
	{ id: 'crate', label: 'senseid', path: ['senseid'], weight: 0 },
	{ id: 'm1', label: 'indexer', path: ['senseid', 'indexer'], weight: 5 },
	{ id: 'm2', label: 'tasks', path: ['senseid', 'tasks'], weight: 3 },
	{ id: 'm3', label: 'main', path: ['cli', 'main'], weight: 2 },
	{ id: 'm4', label: 'args', path: ['cli', 'args'], weight: 1 }
]
const settle = () => new Promise((r) => setTimeout(r, 0))
const box = (c: HTMLElement, name: string) =>
	[...c.querySelectorAll<HTMLElement>('[data-graph-cluster]')].find((el) =>
		el.querySelector('[data-graph-cluster-label]')?.textContent?.startsWith(`${name} ·`)
	)
const names = (c: HTMLElement) =>
	[...c.querySelectorAll('[data-graph-cluster-label]')].map((el) => el.textContent?.split(' ·')[0])

describe('drilling into a container', () => {
	it('a container is a button that opens it; the host hears the path and the declared node', async () => {
		const ondrill = vi.fn()
		const onselect = vi.fn()
		const { container } = render(Treemap, { nodes: LEVEL, edges: [], levels: 2, ondrill, onselect })
		const senseid = box(container, 'senseid')!
		expect(senseid.tagName).toBe('BUTTON')
		expect(senseid.getAttribute('aria-label')).toContain('Open senseid')
		await fireEvent.click(senseid)
		await tick()
		expect(ondrill).toHaveBeenCalledWith(['senseid'], expect.objectContaining({ id: 'crate' }))
		expect(onselect).not.toHaveBeenCalled()
		expect(names(container).sort()).toEqual(['indexer', 'tasks'])
	})

	it('is keyboard-reachable: a real, focusable <button> — Enter and Space are its native click', async () => {
		// jsdom does not synthesise a button's native activation; the real key press is covered
		// in the learn e2e (graph drill). Here: it is a button, in the tab order, and a click
		// with no pointer detail — what the browser fires for Enter — opens it.
		const ondrill = vi.fn()
		const { container } = render(Treemap, { nodes: LEVEL, edges: [], levels: 2, ondrill })
		const cli = box(container, 'cli')!
		expect(cli.tagName).toBe('BUTTON')
		expect(cli.getAttribute('tabindex')).not.toBe('-1')
		await fireEvent.click(cli, { detail: 0 })
		expect(ondrill).toHaveBeenCalledWith(['cli'], null)
	})
})

describe('drilling into a leaf', () => {
	it('is off without a loader — there is nothing below it', async () => {
		const { container } = render(Treemap, { nodes: LEVEL, edges: [], levels: 2 })
		const before = names(container)
		await fireEvent.dblClick(box(container, 'indexer')!)
		await tick()
		expect(names(container)).toEqual(before)
	})

	it('double-click opens it when the host loads levels, and a click still selects', async () => {
		const ondrill = vi.fn()
		const onselect = vi.fn()
		const { container } = render(Treemap, { nodes: LEVEL, edges: [], levels: 2, ondrill, onselect })
		await fireEvent.click(box(container, 'indexer')!)
		expect(onselect).toHaveBeenCalledWith('m1')
		await fireEvent.dblClick(box(container, 'indexer')!)
		expect(ondrill).toHaveBeenCalledWith(['senseid', 'indexer'], expect.objectContaining({ id: 'm1' }))
	})

	it('the drill bar offers to open the selected leaf — the keyboard path to it', async () => {
		const ondrill = vi.fn()
		const { container } = render(Treemap, { nodes: LEVEL, edges: [], levels: 2, ondrill })
		await fireEvent.click(box(container, 'tasks')!)
		await tick()
		const open = container.querySelector<HTMLElement>('[data-graph-drill-open]')
		expect(open?.textContent).toContain('tasks')
		await fireEvent.click(open!)
		expect(ondrill).toHaveBeenCalledWith(['senseid', 'tasks'], expect.objectContaining({ id: 'm2' }))
	})
})

describe('the drill trail', () => {
	it('shows where the reader is and climbs back from a crumb', async () => {
		const ondrillup = vi.fn()
		const { container } = render(Treemap, { nodes: LEVEL, edges: [], levels: 2, ondrillup })
		expect(container.querySelector('[data-graph-drill]')).toBeNull()
		await fireEvent.click(box(container, 'senseid')!)
		await tick()
		const crumbs = [...container.querySelectorAll('[data-graph-drill-crumb]')].map((el) => el.textContent?.trim())
		expect(crumbs).toEqual(['All', 'senseid'])
		await fireEvent.click(container.querySelector('[data-graph-drill-crumb]')!)
		await tick()
		expect(ondrillup).toHaveBeenCalledWith([])
		expect(names(container)).toContain('cli')
	})
})

describe('a host that loads each level', () => {
	it('is pending until the level arrives, then renders the data the host swapped in', async () => {
		const loaded = [
			{ id: 'f1', label: 'walk.rs', path: ['senseid', 'indexer', 'walk.rs'], weight: 4 },
			{ id: 'f2', label: 'scan.rs', path: ['senseid', 'indexer', 'scan.rs'], weight: 2 }
		]
		let finish!: () => void
		const view = render(Treemap, {
			nodes: LEVEL,
			edges: [],
			levels: 1,
			focusPath: ['senseid'],
			// The host tracks the path it was told (as `bind:focusPath` would) and swaps in the
			// level it fetched for it.
			ondrill: (path: string[]) =>
				new Promise<void>((resolve) => {
					finish = () => {
						view.rerender({ nodes: loaded, focusPath: path })
						resolve()
					}
				})
		})
		await fireEvent.dblClick(box(view.container, 'indexer')!)
		await tick()
		const paper = view.container.querySelector('[data-graph-paper]')!
		expect(paper.hasAttribute('data-graph-pending')).toBe(true)
		expect(paper.getAttribute('aria-busy')).toBe('true')
		expect(view.container.querySelector('[data-graph-drill-status]')?.textContent).toContain('Loading')
		finish()
		await settle()
		await tick()
		expect(paper.hasAttribute('data-graph-pending')).toBe(false)
		expect(names(view.container).sort()).toEqual(['scan.rs', 'walk.rs'])
	})

	it('a failed load returns to the previous level and says why', async () => {
		const { container } = render(Treemap, {
			nodes: LEVEL,
			edges: [],
			levels: 2,
			ondrill: () => Promise.reject(new Error('fetch failed'))
		})
		await fireEvent.click(box(container, 'senseid')!)
		await settle()
		await tick()
		expect(container.querySelector('[role="alert"]')?.textContent).toContain('fetch failed')
		expect(names(container)).toContain('cli')
	})
})

describe('sunburst wedges drill too', () => {
	it('a container wedge is a button that opens it', async () => {
		const ondrill = vi.fn()
		const { container } = render(Sunburst, { nodes: LEVEL, edges: [], levels: 2, ondrill })
		const wedge = [...container.querySelectorAll<SVGElement>('[data-graph-wedge][role="button"]')].find((w) =>
			w.getAttribute('aria-label')?.includes('Open cli')
		)
		expect(wedge).toBeDefined()
		await fireEvent.click(wedge!)
		expect(ondrill).toHaveBeenCalledWith(['cli'], null)
	})
})

describe('a press on a box is the box’s, not a pan of the canvas', () => {
	// The canvas pans from any press that does not start on a node card — and captures the
	// pointer to do it, so the browser then delivers the CLICK to the canvas, which clears the
	// selection. A containment box is not a node card, so in a real browser a treemap box could
	// neither be opened nor selected by mouse. fireEvent.click alone never sees this.
	it.each(['senseid', 'indexer'])('pressing the %s box starts no pan', async (name) => {
		const { container } = render(Treemap, { nodes: LEVEL, edges: [], levels: 2, ondrill: () => {} })
		await fireEvent.pointerDown(box(container, name)!, { pointerId: 1 })
		expect(container.querySelector('[data-graph-paper]')?.hasAttribute('data-graph-panning')).toBe(false)
	})
})

describe('a diagram handed the caller’s state', () => {
	// The caller owns the state, so the drill path is the state's — the diagram must not push its
	// own `focusPath` prop back over it. It did: any prop change (a legend toggle) re-applied the
	// diagram's stale opening path and undid the reader's drill.
	it('does not undo a drill when one of its own props changes', async () => {
		const state = new GraphState({ nodes: LEVEL, edges: [], layout: 'world', levels: 2 })
		const view = render(Treemap, { state, focusPath: [], levels: 2, legend: false })
		await tick()
		state.drillInto(state.clusters.find((c) => c.path?.join('/') === 'senseid')!)
		await view.rerender({ state, focusPath: [], levels: 2, legend: true })
		await tick()
		expect(state.drillPath).toEqual(['senseid'])
	})
})
