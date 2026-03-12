import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Reveal from '../src/components/Reveal.svelte'

// ─── IntersectionObserver Mock ──────────────────────────────────────

let intersectCallback: ((entries: any[]) => void) | null = null
let mockObserverInstance: any = null

function createMockIO() {
	return vi.fn((callback: any) => {
		intersectCallback = callback
		mockObserverInstance = {
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		}
		return mockObserverInstance
	})
}

// ─── Setup / Teardown ──────────────────────────────────────────────

beforeEach(() => {
	vi.stubGlobal('IntersectionObserver', createMockIO())
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
	intersectCallback = null
	mockObserverInstance = null
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('Reveal', () => {
	// ─── Rendering ─────────────────────────────────────────────────

	it('renders a container with data-reveal attribute', () => {
		const { container } = render(Reveal)
		expect(container.querySelector('[data-reveal]')).toBeTruthy()
	})

	it('sets data-reveal to up by default', () => {
		const { container } = render(Reveal)
		const el = container.querySelector('[data-reveal]')
		expect(el?.getAttribute('data-reveal')).toBe('up')
	})

	it('sets data-reveal to custom direction', () => {
		const { container } = render(Reveal, { direction: 'left' })
		const el = container.querySelector('[data-reveal]')
		expect(el?.getAttribute('data-reveal')).toBe('left')
	})

	it('sets data-reveal to none', () => {
		const { container } = render(Reveal, { direction: 'none' })
		const el = container.querySelector('[data-reveal]')
		expect(el?.getAttribute('data-reveal')).toBe('none')
	})

	// ─── CSS Custom Properties ─────────────────────────────────────

	it('sets --reveal-duration CSS custom property', () => {
		const { container } = render(Reveal)
		const el = container.querySelector('[data-reveal]') as HTMLElement
		expect(el.style.getPropertyValue('--reveal-duration')).toBe('600ms')
	})

	it('sets custom duration', () => {
		const { container } = render(Reveal, { duration: 1000 })
		const el = container.querySelector('[data-reveal]') as HTMLElement
		expect(el.style.getPropertyValue('--reveal-duration')).toBe('1000ms')
	})

	it('sets --reveal-distance CSS custom property', () => {
		const { container } = render(Reveal)
		const el = container.querySelector('[data-reveal]') as HTMLElement
		expect(el.style.getPropertyValue('--reveal-distance')).toBe('1.5rem')
	})

	it('sets --reveal-easing CSS custom property', () => {
		const { container } = render(Reveal)
		const el = container.querySelector('[data-reveal]') as HTMLElement
		expect(el.style.getPropertyValue('--reveal-easing')).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
	})

	// ─── IntersectionObserver ──────────────────────────────────────

	it('creates IntersectionObserver on mount', () => {
		render(Reveal)
		expect(IntersectionObserver).toHaveBeenCalledOnce()
	})

	it('adds data-reveal-visible when intersecting', () => {
		const { container } = render(Reveal)
		const el = container.querySelector('[data-reveal]') as HTMLElement

		intersectCallback?.([{ isIntersecting: true, target: el }])
		expect(el.hasAttribute('data-reveal-visible')).toBe(true)
	})

	// ─── Custom Class ──────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Reveal, { class: 'my-reveal' })
		const el = container.querySelector('[data-reveal]')
		expect(el?.classList.contains('my-reveal')).toBe(true)
	})

	it('does not set class attribute when class prop is empty', () => {
		const { container } = render(Reveal)
		const el = container.querySelector('[data-reveal]')
		expect(el?.hasAttribute('class')).toBe(false)
	})

	// ─── Stagger ───────────────────────────────────────────────────

	it('when stagger > 0, wrapper does not get data-reveal', () => {
		const { container } = render(Reveal, { stagger: 100 })
		const wrapper = container.firstElementChild as HTMLElement
		expect(wrapper.hasAttribute('data-reveal')).toBe(false)
	})

	it('when stagger > 0, adds data-reveal-visible to children with delays', () => {
		vi.useFakeTimers()

		const { container } = render(Reveal, { stagger: 100, delay: 50 })
		const wrapper = container.firstElementChild as HTMLElement

		const child1 = document.createElement('div')
		const child2 = document.createElement('div')
		const child3 = document.createElement('div')
		wrapper.appendChild(child1)
		wrapper.appendChild(child2)
		wrapper.appendChild(child3)

		intersectCallback?.([{ isIntersecting: true, target: wrapper }])
		expect(child1.hasAttribute('data-reveal-visible')).toBe(false)

		vi.advanceTimersByTime(50)
		expect(child1.hasAttribute('data-reveal-visible')).toBe(true)
		expect(child2.hasAttribute('data-reveal-visible')).toBe(false)

		vi.advanceTimersByTime(100)
		expect(child2.hasAttribute('data-reveal-visible')).toBe(true)
		expect(child3.hasAttribute('data-reveal-visible')).toBe(false)

		vi.advanceTimersByTime(100)
		expect(child3.hasAttribute('data-reveal-visible')).toBe(true)

		vi.useRealTimers()
	})

	it('passes delay to action when stagger is 0', () => {
		const { container } = render(Reveal, { delay: 200 })
		const el = container.querySelector('[data-reveal]') as HTMLElement
		expect(el.style.transitionDelay).toBe('200ms')
	})

	it('when stagger > 0, wrapper has no transitionDelay', () => {
		const { container } = render(Reveal, { delay: 200, stagger: 100 })
		const wrapper = container.firstElementChild as HTMLElement
		expect(wrapper.style.transitionDelay).toBe('')
	})
})
