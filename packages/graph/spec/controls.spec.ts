/* The controls, as components a caller places rather than chrome the canvas ships.
 *
 * `Graph` used to render its own density and zoom bars, so a consumer who wanted neither got
 * both and a consumer who wanted them somewhere else got them twice. Each control is now its
 * own component taking the value it drives — which is also what makes a named diagram able to
 * offer exactly the controls that mean something for it.
 */

import { describe, it, expect } from 'vitest'
import { tick } from 'svelte'
import { render } from '@testing-library/svelte'
import DensityControl from '../src/controls/DensityControl.svelte'
import EdgeStyleControl from '../src/controls/EdgeStyleControl.svelte'
import ZoomControl from '../src/controls/ZoomControl.svelte'
import DepthControl from '../src/controls/DepthControl.svelte'
import { ZOOM_MAX, ZOOM_MIN } from '../src/controls/zoom.js'

describe('DensityControl', () => {
	it('marks the active option, so the control says what is on', () => {
		const { container } = render(DensityControl, { density: 'keys' })

		expect(container.querySelector('[data-graph-density="keys"]')?.getAttribute('aria-pressed')).toBe(
			'true'
		)
		expect(
			container.querySelector('[data-graph-density="full"]')?.getAttribute('aria-pressed')
		).toBe('false')
	})

	it('reports the value a click chose', async () => {
		let picked: string | undefined
		const { container } = render(DensityControl, {
			density: 'keys',
			onchange: (v: string) => (picked = v)
		})

		;(container.querySelector('[data-graph-density="full"]') as HTMLElement).click()
		await tick()
		expect(picked).toBe('full')
	})

	it('names itself for assistive tech — three unlabelled buttons say nothing', () => {
		const { container } = render(DensityControl, { density: 'keys' })

		expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBeTruthy()
	})
})

describe('EdgeStyleControl', () => {
	it('is a TOGGLE, not a three-state picker — there are two edge styles', () => {
		const { container } = render(EdgeStyleControl, { edgeStyle: 'curved' })
		const button = container.querySelector('[data-graph-edge-style]')

		expect(button?.getAttribute('aria-pressed')).toBe('false')
	})

	it('reads pressed when the non-default style is active', () => {
		const { container } = render(EdgeStyleControl, { edgeStyle: 'orthogonal' })

		expect(container.querySelector('[data-graph-edge-style]')?.getAttribute('aria-pressed')).toBe(
			'true'
		)
	})

	it('flips to the other style on click', async () => {
		let picked: string | undefined
		const { container } = render(EdgeStyleControl, {
			edgeStyle: 'curved',
			onchange: (v: string) => (picked = v)
		})

		;(container.querySelector('[data-graph-edge-style]') as HTMLElement).click()
		await tick()
		expect(picked).toBe('orthogonal')
	})
})

describe('ZoomControl', () => {
	it('shows the current zoom as a percentage a reader can act on', () => {
		const { container } = render(ZoomControl, { zoom: 1.5 })

		expect(container.querySelector('[data-graph-zoom="reset"]')?.textContent).toContain('150')
	})

	it('disables the end it cannot go past, rather than silently doing nothing', () => {
		const { container } = render(ZoomControl, { zoom: ZOOM_MAX })

		expect((container.querySelector('[data-graph-zoom="in"]') as HTMLButtonElement).disabled).toBe(
			true
		)
		expect((container.querySelector('[data-graph-zoom="out"]') as HTMLButtonElement).disabled).toBe(
			false
		)
	})

	it('steps in and out from the middle of the range', async () => {
		let picked: number | undefined
		const { container } = render(ZoomControl, {
			zoom: 1,
			onchange: (v: number) => (picked = v)
		})

		;(container.querySelector('[data-graph-zoom="in"]') as HTMLElement).click()
		await tick()
		expect(picked).toBeGreaterThan(1)

		;(container.querySelector('[data-graph-zoom="out"]') as HTMLElement).click()
		await tick()
		expect(picked).toBeLessThan(1)
	})

	it('clamps rather than reporting a value outside the range', async () => {
		// A caller can hand this control any value; reporting one past a limit would push the
		// canvas past a bound it has already agreed to.
		let picked: number | undefined
		const { container } = render(ZoomControl, {
			zoom: ZOOM_MIN * 1.05,
			onchange: (v: number) => (picked = v)
		})

		;(container.querySelector('[data-graph-zoom="out"]') as HTMLElement).click()
		await tick()
		expect(picked).toBe(ZOOM_MIN)
	})

	it('resets to fit, which is 100% — not to the largest zoom', async () => {
		let picked: number | undefined
		const { container } = render(ZoomControl, {
			zoom: 3,
			onchange: (v: number) => (picked = v)
		})

		;(container.querySelector('[data-graph-zoom="reset"]') as HTMLElement).click()
		await tick()
		expect(picked).toBe(1)
	})
})

describe('DepthControl', () => {
	/* The dendrogram was unreadable because everything was materialised at once. Depth is the
	 * control that makes a big tree legible: show the crates, then drill. */

	it('offers each level up to the max it is given', () => {
		const { container } = render(DepthControl, { levels: 2, max: 4 })

		expect(container.querySelectorAll('[data-graph-depth]')).toHaveLength(4)
	})

	it('marks the active level', () => {
		const { container } = render(DepthControl, { levels: 2, max: 4 })

		expect(container.querySelector('[data-graph-depth="2"]')?.getAttribute('aria-pressed')).toBe(
			'true'
		)
	})

	it('reports the level a click chose', async () => {
		let picked: number | undefined
		const { container } = render(DepthControl, {
			levels: 2,
			max: 4,
			onchange: (v: number) => (picked = v)
		})

		;(container.querySelector('[data-graph-depth="3"]') as HTMLElement).click()
		await tick()
		expect(picked).toBe(3)
	})

	it('never offers depth 0, which renders nothing', () => {
		const { container } = render(DepthControl, { levels: 1, max: 3 })

		expect(container.querySelector('[data-graph-depth="0"]')).toBeNull()
	})
})
