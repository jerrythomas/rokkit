import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { ripple } from '../src/ripple.svelte.js'

// ─── Setup / Teardown ──────────────────────────────────────────────

beforeEach(() => {
	vi.stubGlobal(
		'matchMedia',
		vi.fn().mockReturnValue({ matches: false })
	)
})

afterEach(() => {
	vi.unstubAllGlobals()
	// Clean up injected keyframes
	document.querySelector('#rokkit-ripple-keyframes')?.remove()
})

// Helper to create a node with a mocked bounding rect
function createNodeWithRect(rect = { left: 0, top: 0, width: 200, height: 100 }) {
	const node = document.createElement('div')
	node.getBoundingClientRect = vi.fn().mockReturnValue(rect)
	return node
}

describe('ripple', () => {
	// ─── Setup ─────────────────────────────────────────────────────

	it('sets overflow hidden on mount', () => {
		const node = createNodeWithRect()
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		expect(node.style.overflow).toBe('hidden')
		cleanup()
	})

	it('sets position relative when element is static', () => {
		const node = createNodeWithRect()
		// JSDOM getComputedStyle returns '' for position (treated as static)
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		expect(node.style.position).toBe('relative')
		cleanup()
	})

	it('injects keyframes stylesheet', () => {
		const node = createNodeWithRect()
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		const style = document.querySelector('#rokkit-ripple-keyframes')
		expect(style).toBeTruthy()
		expect(style.textContent).toContain('rokkit-ripple')
		cleanup()
	})

	it('only injects keyframes once', () => {
		const node1 = createNodeWithRect()
		const node2 = createNodeWithRect()
		const cleanup1 = $effect.root(() => ripple(node1))
		flushSync()
		const cleanup2 = $effect.root(() => ripple(node2))
		flushSync()

		const styles = document.querySelectorAll('#rokkit-ripple-keyframes')
		expect(styles.length).toBe(1)
		cleanup1()
		cleanup2()
	})

	// ─── Click Behavior ────────────────────────────────────────────

	it('creates a ripple span on click', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 200, height: 100 })
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 50 }))

		const spans = node.querySelectorAll('span')
		expect(spans.length).toBe(1)
		cleanup()
	})

	it('positions ripple at click coordinates', () => {
		const node = createNodeWithRect({ left: 10, top: 20, width: 200, height: 100 })
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('click', { clientX: 110, clientY: 70 }))

		const span = node.querySelector('span')
		// size = max(200, 100) * 2 = 400
		// x = 110 - 10 - 200 = -100, y = 70 - 20 - 200 = -150
		expect(span.style.position).toBe('absolute')
		expect(span.style.borderRadius).toBe('50%')
		expect(span.style.left).toBe('-100px')
		expect(span.style.top).toBe('-150px')
		cleanup()
	})

	it('uses default color and opacity', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }))

		const span = node.querySelector('span')
		expect(span.style.background.toLowerCase()).toBe('currentcolor')
		expect(span.style.opacity).toBe('0.15')
		cleanup()
	})

	it('uses custom options', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => ripple(node, { color: 'red', opacity: 0.3, duration: 800 }))
		flushSync()

		node.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }))

		const span = node.querySelector('span')
		expect(span.style.background).toBe('red')
		expect(span.style.opacity).toBe('0.3')
		expect(span.style.animation).toContain('800ms')
		cleanup()
	})

	it('removes ripple span after timeout', () => {
		vi.useFakeTimers()

		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }))
		expect(node.querySelectorAll('span').length).toBe(1)

		vi.advanceTimersByTime(700) // 500 + 100 fallback
		expect(node.querySelectorAll('span').length).toBe(0)

		vi.useRealTimers()
		cleanup()
	})

	it('supports multiple ripples', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('click', { clientX: 30, clientY: 30 }))
		node.dispatchEvent(new MouseEvent('click', { clientX: 70, clientY: 70 }))

		expect(node.querySelectorAll('span').length).toBe(2)
		cleanup()
	})

	// ─── prefers-reduced-motion ────────────────────────────────────

	it('does nothing when prefers-reduced-motion is set', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({ matches: true })
		)

		const node = createNodeWithRect()
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		expect(node.style.overflow).toBe('')
		node.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }))
		expect(node.querySelectorAll('span').length).toBe(0)
		cleanup()
	})

	// ─── Cleanup ───────────────────────────────────────────────────

	it('restores original styles on cleanup', () => {
		const node = createNodeWithRect()
		node.style.overflow = 'auto'
		node.style.position = 'absolute'

		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		cleanup()
		expect(node.style.overflow).toBe('auto')
		expect(node.style.position).toBe('absolute')
	})

	it('removes click listener on cleanup', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => ripple(node))
		flushSync()

		cleanup()

		node.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50 }))
		expect(node.querySelectorAll('span').length).toBe(0)
	})
})
