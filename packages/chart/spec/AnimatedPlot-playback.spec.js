import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import AnimatedPlot from '../src/AnimatedPlot.svelte'

/**
 * The existing AnimatedPlot specs render a frame and inspect the markup. Nothing
 * ever pressed play — so the whole playback engine (the rAF frame timer, the
 * reduced-motion interval fallback, scrub and speed, and the end-of-timeline
 * clamp) had no coverage.
 *
 * rAF is driven manually rather than by real time: the component schedules the
 * next frame from inside its own callback, so holding the callback lets each
 * frame advance be stepped deliberately.
 */

const data = [
	{ year: 2000, cat: 'a', v: 1 },
	{ year: 2000, cat: 'b', v: 2 },
	{ year: 2001, cat: 'a', v: 3 },
	{ year: 2001, cat: 'b', v: 4 },
	{ year: 2002, cat: 'a', v: 5 },
	{ year: 2002, cat: 'b', v: 6 }
]

const props = (animate = {}) => ({
	data,
	animate: { by: 'year', duration: 100, ...animate },
	x: 'cat',
	y: 'v',
	geoms: [{ type: 'bar', stat: 'sum' }],
	width: 400,
	height: 300
})

/**
 * Queue of pending rAF callbacks so frames can be stepped by hand.
 *
 * Assigned directly rather than through vi.stubGlobal: the component cancels its
 * frame in onDestroy, which runs during testing-library's cleanup — after
 * unstubAllGlobals would have removed cancelAnimationFrame, throwing there.
 * Svelte's own scheduler also uses rAF, so this queue is NOT only the component's
 * and its length proves nothing; every assertion below is behavioural.
 */
let pending = []
const realRaf = globalThis.requestAnimationFrame
const realCancel = globalThis.cancelAnimationFrame

beforeEach(() => {
	pending = []
	globalThis.requestAnimationFrame = (cb) => pending.push(cb)
	globalThis.cancelAnimationFrame = () => {}
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

afterAll(() => {
	globalThis.requestAnimationFrame = realRaf
	globalThis.cancelAnimationFrame = realCancel
})

/** Run every queued callback once, at `time`. */
async function step(time) {
	const due = pending
	pending = []
	for (const cb of due) cb(time)
	await tick()
}

const playPause = (c) => c.querySelector('[data-plot-timeline-playpause]')
const frameLabel = (c) => c.querySelector('[data-plot-timeline-label]')?.textContent
const scrub = (c) => c.querySelector('[data-plot-timeline-scrub]')

describe('AnimatedPlot — playback', () => {
	it('starts on the first frame and paused', async () => {
		const { container } = render(AnimatedPlot, { props: props() })

		expect(frameLabel(container)).toBe('2000')

		// Not playing: driving the clock forward must not advance the frame.
		await step(10_000)
		expect(frameLabel(container)).toBe('2000')
	})

	it('advances only after play is pressed', async () => {
		const { container } = render(AnimatedPlot, { props: props() })

		await step(500)
		expect(frameLabel(container)).toBe('2000')

		await fireEvent.click(playPause(container))
		await step(500)

		expect(frameLabel(container)).toBe('2001')
	})

	it('advances a frame once the per-frame interval has elapsed', async () => {
		const { container } = render(AnimatedPlot, { props: props() })
		await fireEvent.click(playPause(container))

		// Below msPerFrame: no advance.
		await step(50)
		expect(frameLabel(container)).toBe('2000')

		// Past it: one frame forward.
		await step(200)
		expect(frameLabel(container)).toBe('2001')
	})

	it('stops at the final frame when loop is off', async () => {
		const { container } = render(AnimatedPlot, { props: props({ loop: false }) })
		await fireEvent.click(playPause(container))

		await step(200)
		await step(400)
		await step(600)
		await step(800)

		expect(frameLabel(container)).toBe('2002')

		// Stopped: further frames must not wrap around.
		await step(1000)
		await step(1200)
		expect(frameLabel(container)).toBe('2002')
	})

	it('wraps back to the first frame when loop is on', async () => {
		const { container } = render(AnimatedPlot, { props: props({ loop: true }) })
		await fireEvent.click(playPause(container))

		await step(200)
		await step(400)
		await step(600)

		expect(frameLabel(container)).toBe('2000')
	})

	it('pauses when the button is pressed again', async () => {
		const { container } = render(AnimatedPlot, { props: props() })
		await fireEvent.click(playPause(container))
		await fireEvent.click(playPause(container))

		await step(999)
		await step(1999)

		expect(frameLabel(container)).toBe('2000')
	})
})

describe('AnimatedPlot — scrub and speed', () => {
	it('jumps to a scrubbed frame and pauses', async () => {
		const { container } = render(AnimatedPlot, { props: props() })
		await fireEvent.click(playPause(container))

		const slider = scrub(container)
		slider.value = '2'
		await fireEvent.input(slider)
		await tick()

		expect(frameLabel(container)).toBe('2002')

		// Scrubbing is a manual action — it takes over from playback.
		await step(999)
		await step(1999)
		expect(frameLabel(container)).toBe('2002')
	})

	it('changing speed reschedules the frame timer', async () => {
		const { container } = render(AnimatedPlot, { props: props() })
		await fireEvent.click(playPause(container))

		const speed = container.querySelector('[data-plot-timeline-speed]')
		expect(speed).toBeTruthy()

		speed.value = '2'
		await fireEvent.change(speed)
		await tick()

		// Doubling speed halves msPerFrame, so the same elapsed time advances.
		await step(200)
		expect(frameLabel(container)).not.toBe('2000')
	})
})

describe('AnimatedPlot — reduced motion', () => {
	it('steps frames on an interval instead of rAF', async () => {
		vi.useFakeTimers()
		vi.stubGlobal('matchMedia', () => ({
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))

		const { container } = render(AnimatedPlot, { props: props() })
		await fireEvent.click(playPause(container))

		await vi.advanceTimersByTimeAsync(100)
		await tick()
		expect(frameLabel(container)).toBe('2001')

		await vi.advanceTimersByTimeAsync(100)
		await tick()
		expect(frameLabel(container)).toBe('2002')
	})

	it('stops at the end without looping', async () => {
		vi.useFakeTimers()
		vi.stubGlobal('matchMedia', () => ({
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))

		const { container } = render(AnimatedPlot, { props: props({ loop: false }) })
		await fireEvent.click(playPause(container))

		await vi.advanceTimersByTimeAsync(500)
		await tick()

		expect(frameLabel(container)).toBe('2002')
	})

	it('tolerates an environment with no matchMedia', () => {
		vi.stubGlobal('matchMedia', undefined)

		expect(() => render(AnimatedPlot, { props: props() })).not.toThrow()
	})
})

describe('AnimatedPlot — empty input', () => {
	it('renders with no data and no frames', () => {
		const { container } = render(AnimatedPlot, {
			props: { ...props(), data: [] }
		})

		expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
	})
})
