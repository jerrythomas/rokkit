import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import RangeHarness from './fixtures/RangeHarness.svelte'

/**
 * What this covers that the jsdom suite cannot:
 *
 * Range derives every value from `trackWidth`, bound via `bind:clientWidth` on
 * [data-range-bar]. JSDOM reports 0 for that, so the jsdom spec stubs the getter
 * — which proves the pixel→value arithmetic but never that the component measures
 * the right element, nor that a real mouse drag reaches it through the `pannable`
 * action's window-level mousemove/mouseup listeners.
 *
 * Here the track is genuinely 200px wide and the drag is real mouse input.
 */
const TRACK = 200

const thumb = (container: Element, which: 'value' | 'lower' | 'upper') =>
	container.querySelector(`[data-thumb="${which}"]`) as HTMLElement

/** Drag an element by `dx` px using real mouse events through `pannable`. */
async function dragBy(el: HTMLElement, dx: number) {
	const box = el.getBoundingClientRect()
	const startX = box.left + box.width / 2
	const y = box.top + box.height / 2

	el.dispatchEvent(new MouseEvent('mousedown', { clientX: startX, clientY: y, bubbles: true }))
	// pannable attaches move/up to window once panning starts.
	window.dispatchEvent(new MouseEvent('mousemove', { clientX: startX + dx, clientY: y }))
	window.dispatchEvent(new MouseEvent('mouseup', { clientX: startX + dx, clientY: y }))
	await new Promise((r) => requestAnimationFrame(() => r(null)))
}

describe('Range — real layout', () => {
	it('measures a non-zero track width from the DOM', () => {
		const { container } = render(RangeHarness, { value: 0, min: 0, max: 100 })
		const bar = container.querySelector('[data-range-bar]') as HTMLElement
		// The premise of every test below — and exactly what JSDOM cannot give.
		expect(bar.clientWidth).toBe(TRACK)
	})

	it('converts a real pixel drag into a proportional value', async () => {
		const onchange = vi.fn()
		const { container } = render(RangeHarness, { value: 0, min: 0, max: 100, onchange })

		await dragBy(thumb(container, 'value'), TRACK / 2)

		// Half the track → about half the domain. Real geometry, so this is a real ratio.
		const latest = Number(onchange.mock.calls.at(-1)![0])
		expect(latest).toBeGreaterThan(40)
		expect(latest).toBeLessThan(60)
	})

	it('clamps a drag past the end to the maximum', async () => {
		const onchange = vi.fn()
		const { container } = render(RangeHarness, { value: 0, min: 0, max: 100, onchange })

		await dragBy(thumb(container, 'value'), TRACK * 3)

		expect(Number(onchange.mock.calls.at(-1)![0])).toBe(100)
	})

	it('honours step when snapping a dragged value', async () => {
		const onchange = vi.fn()
		const { container } = render(RangeHarness, {
			value: 0,
			min: 0,
			max: 100,
			step: 25,
			onchange
		})

		await dragBy(thumb(container, 'value'), TRACK / 2)

		expect(Number(onchange.mock.calls.at(-1)![0]) % 25).toBe(0)
	})
})

describe('Range — disabled is inert across a whole real gesture', () => {
	// Regression guard: handleUpperPanEnd/handleLowerPanEnd used to fire onchange
	// with no `disabled` check, so a disabled control still emitted on mouseup.
	it('emits nothing when a disabled single thumb is dragged', async () => {
		const onchange = vi.fn()
		const { container } = render(RangeHarness, {
			value: 20,
			min: 0,
			max: 100,
			disabled: true,
			onchange
		})

		await dragBy(thumb(container, 'value'), TRACK / 2)

		expect(onchange).not.toHaveBeenCalled()
		expect(thumb(container, 'value').getAttribute('aria-valuenow')).toBe('20')
	})

	it('emits nothing when a disabled range thumb is dragged', async () => {
		const onchange = vi.fn()
		const { container } = render(RangeHarness, {
			lower: 20,
			upper: 80,
			min: 0,
			max: 100,
			range: true,
			disabled: true,
			onchange
		})

		await dragBy(thumb(container, 'lower'), TRACK / 4)

		expect(onchange).not.toHaveBeenCalled()
		expect(thumb(container, 'lower').getAttribute('aria-valuenow')).toBe('20')
	})
})

describe('Range — two-thumb interaction with real geometry', () => {
	it('keeps the lower thumb from crossing the upper one', async () => {
		const onchange = vi.fn()
		const { container } = render(RangeHarness, {
			lower: 10,
			upper: 40,
			min: 0,
			max: 100,
			range: true,
			onchange
		})

		await dragBy(thumb(container, 'lower'), TRACK)

		const [lower, upper] = onchange.mock.calls.at(-1)![0] as [number, number]
		expect(lower).toBeLessThanOrEqual(upper)
		expect(lower).toBeLessThanOrEqual(40)
	})

	it('positions each thumb at the pixel offset its value implies', () => {
		const { container } = render(RangeHarness, {
			lower: 25,
			upper: 75,
			min: 0,
			max: 100,
			range: true
		})

		// left is set as a percentage; with a real 200px track that resolves to
		// actual pixels, which JSDOM would leave unresolved.
		const lowerLeft = thumb(container, 'lower').getBoundingClientRect().left
		const upperLeft = thumb(container, 'upper').getBoundingClientRect().left
		const barLeft = (container.querySelector('[data-range-bar]') as HTMLElement)
			.getBoundingClientRect()
			.left

		expect(lowerLeft - barLeft).toBeCloseTo(TRACK * 0.25, 0)
		expect(upperLeft - barLeft).toBeCloseTo(TRACK * 0.75, 0)
	})
})
