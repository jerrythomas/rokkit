import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { reveal } from '../src/reveal.svelte.js'

// ─── IntersectionObserver Mock ──────────────────────────────────────

let intersectCallback = null
let mockObserverInstance = null

function createMockIO() {
	return vi.fn((callback) => {
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
	vi.stubGlobal(
		'matchMedia',
		vi.fn().mockReturnValue({ matches: false })
	)
	intersectCallback = null
	mockObserverInstance = null
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('reveal', () => {
	// ─── Attributes ────────────────────────────────────────────────

	it('sets data-reveal attribute with default direction', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.getAttribute('data-reveal')).toBe('up')
		cleanup()
	})

	it('sets data-reveal attribute with custom direction', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { direction: 'left' }))
		flushSync()

		expect(node.getAttribute('data-reveal')).toBe('left')
		cleanup()
	})

	it('sets data-reveal to none when direction is none', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { direction: 'none' }))
		flushSync()

		expect(node.getAttribute('data-reveal')).toBe('none')
		cleanup()
	})

	// ─── CSS Custom Properties ─────────────────────────────────────

	it('sets --reveal-duration CSS custom property', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.style.getPropertyValue('--reveal-duration')).toBe('600ms')
		cleanup()
	})

	it('sets custom duration', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { duration: 1000 }))
		flushSync()

		expect(node.style.getPropertyValue('--reveal-duration')).toBe('1000ms')
		cleanup()
	})

	it('sets --reveal-distance CSS custom property', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.style.getPropertyValue('--reveal-distance')).toBe('1.5rem')
		cleanup()
	})

	it('sets custom distance', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { distance: '3rem' }))
		flushSync()

		expect(node.style.getPropertyValue('--reveal-distance')).toBe('3rem')
		cleanup()
	})

	it('sets --reveal-easing CSS custom property', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.style.getPropertyValue('--reveal-easing')).toBe(
			'cubic-bezier(0.4, 0, 0.2, 1)'
		)
		cleanup()
	})

	it('sets transition-delay when delay > 0', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { delay: 200 }))
		flushSync()

		expect(node.style.transitionDelay).toBe('200ms')
		cleanup()
	})

	it('does not set transition-delay when delay is 0', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.style.transitionDelay).toBe('')
		cleanup()
	})

	// ─── IntersectionObserver ──────────────────────────────────────

	it('creates IntersectionObserver on mount', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(IntersectionObserver).toHaveBeenCalledOnce()
		expect(mockObserverInstance.observe).toHaveBeenCalledWith(node)
		cleanup()
	})

	it('passes threshold to IntersectionObserver', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { threshold: 0.5 }))
		flushSync()

		expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
			threshold: 0.5
		})
		cleanup()
	})

	it('adds data-reveal-visible when entry is intersecting', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		intersectCallback([{ isIntersecting: true, target: node }])
		expect(node.hasAttribute('data-reveal-visible')).toBe(true)
		cleanup()
	})

	it('dispatches reveal event with visible: true on intersection', () => {
		const node = document.createElement('div')
		const handler = vi.fn()
		node.addEventListener('reveal', handler)

		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		intersectCallback([{ isIntersecting: true, target: node }])
		expect(handler).toHaveBeenCalledOnce()
		expect(handler.mock.calls[0][0].detail).toEqual({ visible: true })

		node.removeEventListener('reveal', handler)
		cleanup()
	})

	it('unobserves after first intersection when once is true', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { once: true }))
		flushSync()

		intersectCallback([{ isIntersecting: true, target: node }])
		expect(mockObserverInstance.unobserve).toHaveBeenCalledWith(node)
		cleanup()
	})

	it('does not unobserve after first intersection when once is false', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { once: false }))
		flushSync()

		intersectCallback([{ isIntersecting: true, target: node }])
		expect(mockObserverInstance.unobserve).not.toHaveBeenCalled()
		cleanup()
	})

	it('removes data-reveal-visible when entry leaves viewport (once: false)', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { once: false }))
		flushSync()

		intersectCallback([{ isIntersecting: true, target: node }])
		expect(node.hasAttribute('data-reveal-visible')).toBe(true)

		intersectCallback([{ isIntersecting: false, target: node }])
		expect(node.hasAttribute('data-reveal-visible')).toBe(false)
		cleanup()
	})

	it('dispatches reveal event with visible: false on exit (once: false)', () => {
		const node = document.createElement('div')
		const handler = vi.fn()
		node.addEventListener('reveal', handler)

		const cleanup = $effect.root(() => reveal(node, { once: false }))
		flushSync()

		intersectCallback([{ isIntersecting: true, target: node }])
		intersectCallback([{ isIntersecting: false, target: node }])

		expect(handler).toHaveBeenCalledTimes(2)
		expect(handler.mock.calls[1][0].detail).toEqual({ visible: false })

		node.removeEventListener('reveal', handler)
		cleanup()
	})

	// ─── prefers-reduced-motion ────────────────────────────────────

	it('sets data-reveal-visible immediately when prefers-reduced-motion', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({ matches: true })
		)

		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.hasAttribute('data-reveal-visible')).toBe(true)
		cleanup()
	})

	it('does not create IntersectionObserver when prefers-reduced-motion', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({ matches: true })
		)

		const MockIO = createMockIO()
		vi.stubGlobal('IntersectionObserver', MockIO)

		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(MockIO).not.toHaveBeenCalled()
		cleanup()
	})

	// ─── Cleanup ───────────────────────────────────────────────────

	it('removes data-reveal on cleanup', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.hasAttribute('data-reveal')).toBe(true)
		cleanup()
		expect(node.hasAttribute('data-reveal')).toBe(false)
	})

	it('removes CSS custom properties on cleanup', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		expect(node.style.getPropertyValue('--reveal-duration')).toBe('600ms')
		cleanup()
		expect(node.style.getPropertyValue('--reveal-duration')).toBe('')
		expect(node.style.getPropertyValue('--reveal-distance')).toBe('')
		expect(node.style.getPropertyValue('--reveal-easing')).toBe('')
	})

	it('disconnects IntersectionObserver on cleanup', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node))
		flushSync()

		cleanup()
		expect(mockObserverInstance.disconnect).toHaveBeenCalledOnce()
	})

	it('removes transition-delay on cleanup when delay was set', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => reveal(node, { delay: 300 }))
		flushSync()

		expect(node.style.transitionDelay).toBe('300ms')
		cleanup()
		expect(node.style.transitionDelay).toBe('')
	})
})
