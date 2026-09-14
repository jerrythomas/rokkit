import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import CarouselTest from './CarouselTest.svelte'

/**
 * The `slide` snippet is the primary way to use Carousel — it renders one panel
 * per index with the a11y wiring — and it had never been supplied, so neither the
 * per-slide markup nor the autoplay timer nor the hover-pause ran.
 */

beforeEach(() => cleanup())
afterEach(() => vi.useRealTimers())

const slides = (c: Element) => [...c.querySelectorAll('[data-carousel-slide]')]
const activeIndex = (c: Element) => slides(c).findIndex((s) => s.hasAttribute('data-active'))

describe('Carousel — slide snippet', () => {
	it('renders one panel per slide with a11y wiring', () => {
		const { container } = render(CarouselTest, { props: { withSlides: true, count: 3 } })

		const panels = slides(container)
		expect(panels).toHaveLength(3)
		expect(panels[0].getAttribute('role')).toBe('tabpanel')
		expect(panels[0].getAttribute('aria-label')).toBe('Slide 1 of 3')
		expect(panels[0].getAttribute('aria-hidden')).toBe('false')
		expect(panels[1].getAttribute('aria-hidden')).toBe('true')
	})

	it('passes the index and the current index into the snippet', () => {
		const { container } = render(CarouselTest, { props: { withSlides: true, count: 3 } })

		const marked = container.querySelectorAll('[data-slide-current]')
		expect(marked).toHaveLength(1)
		expect(marked[0].getAttribute('data-slide-index')).toBe('0')
	})

	it('starts on the first slide', () => {
		const { container } = render(CarouselTest, { props: { withSlides: true, count: 3 } })

		expect(activeIndex(container)).toBe(0)
	})
})

describe('Carousel — autoplay', () => {
	it('advances on the interval', async () => {
		vi.useFakeTimers()
		const { container } = render(CarouselTest, {
			props: { withSlides: true, count: 3, autoplay: true, interval: 100 }
		})

		await vi.advanceTimersByTimeAsync(100)
		await tick()
		expect(activeIndex(container)).toBe(1)

		await vi.advanceTimersByTimeAsync(100)
		await tick()
		expect(activeIndex(container)).toBe(2)
	})

	it('does not autoplay with a single slide', async () => {
		vi.useFakeTimers()
		const { container } = render(CarouselTest, {
			props: { withSlides: true, count: 1, autoplay: true, interval: 100 }
		})

		await vi.advanceTimersByTimeAsync(500)
		await tick()

		expect(activeIndex(container)).toBe(0)
	})

	it('pauses while the pointer is over it and resumes on leave', async () => {
		vi.useFakeTimers()
		const { container } = render(CarouselTest, {
			props: { withSlides: true, count: 3, autoplay: true, interval: 100 }
		})
		const root = container.querySelector('[data-carousel]')!

		await fireEvent.mouseEnter(root)
		await vi.advanceTimersByTimeAsync(500)
		await tick()
		expect(activeIndex(container)).toBe(0)

		await fireEvent.mouseLeave(root)
		await vi.advanceTimersByTimeAsync(100)
		await tick()
		expect(activeIndex(container)).toBe(1)
	})

	it('stays put when autoplay is off', async () => {
		vi.useFakeTimers()
		const { container } = render(CarouselTest, {
			props: { withSlides: true, count: 3, interval: 100 }
		})

		await vi.advanceTimersByTimeAsync(500)
		await tick()

		expect(activeIndex(container)).toBe(0)
	})
})
