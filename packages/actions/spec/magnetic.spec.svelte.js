import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { magnetic } from '../src/magnetic.svelte.js'

// ─── Setup / Teardown ──────────────────────────────────────────────

beforeEach(() => {
	vi.stubGlobal(
		'matchMedia',
		vi.fn().mockReturnValue({ matches: false })
	)
})

afterEach(() => {
	vi.unstubAllGlobals()
})

// Helper to create a node with a mocked bounding rect
function createNodeWithRect(rect = { left: 0, top: 0, width: 100, height: 100 }) {
	const node = document.createElement('div')
	node.getBoundingClientRect = vi.fn().mockReturnValue(rect)
	return node
}

describe('magnetic', () => {
	// ─── Transition Setup ──────────────────────────────────────────

	it('sets transition on mount', () => {
		const node = createNodeWithRect()
		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		expect(node.style.transition).toContain('transform')
		expect(node.style.transition).toContain('300ms')
		cleanup()
	})

	it('uses custom duration for transition', () => {
		const node = createNodeWithRect()
		const cleanup = $effect.root(() => magnetic(node, { duration: 500 }))
		flushSync()

		expect(node.style.transition).toContain('500ms')
		cleanup()
	})

	// ─── Mouse Move Behavior ───────────────────────────────────────

	it('translates toward cursor on mousemove', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		// Move cursor to right side of element (center is 50,50, cursor at 80,50)
		node.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 50 }))

		// offset = (80 - 50) * 0.3 = 9, Y offset = (50 - 50) * 0.3 = 0
		expect(node.style.transform).toBe('translate(9px, 0px)')
		cleanup()
	})

	it('removes transition during mousemove for responsiveness', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 50 }))
		expect(node.style.transition).toBe('none')
		cleanup()
	})

	it('supports custom strength', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => magnetic(node, { strength: 0.5 }))
		flushSync()

		// Move cursor: offset = (80 - 50) * 0.5 = 15
		node.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 50 }))
		expect(node.style.transform).toBe('translate(15px, 0px)')
		cleanup()
	})

	// ─── Mouse Leave ───────────────────────────────────────────────

	it('resets transform on mouseleave', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80 }))
		expect(node.style.transform).not.toBe('')

		node.dispatchEvent(new MouseEvent('mouseleave'))
		expect(node.style.transform).toBe('')
		cleanup()
	})

	it('restores transition on mouseleave', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 80 }))
		expect(node.style.transition).toBe('none')

		node.dispatchEvent(new MouseEvent('mouseleave'))
		expect(node.style.transition).toContain('300ms')
		cleanup()
	})

	// ─── prefers-reduced-motion ────────────────────────────────────

	it('does nothing when prefers-reduced-motion is set', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({ matches: true })
		)

		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		expect(node.style.transition).toBe('')
		node.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 50 }))
		expect(node.style.transform).toBe('')
		cleanup()
	})

	// ─── Cleanup ───────────────────────────────────────────────────

	it('restores original styles on cleanup', () => {
		const node = createNodeWithRect()
		node.style.transform = 'scale(1.1)'
		node.style.transition = 'opacity 100ms'

		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		cleanup()
		expect(node.style.transform).toBe('scale(1.1)')
		expect(node.style.transition).toBe('opacity 100ms')
	})

	it('removes event listeners on cleanup', () => {
		const node = createNodeWithRect({ left: 0, top: 0, width: 100, height: 100 })
		const cleanup = $effect.root(() => magnetic(node))
		flushSync()

		cleanup()

		// After cleanup, mousemove should not change transform
		node.dispatchEvent(new MouseEvent('mousemove', { clientX: 80, clientY: 50 }))
		expect(node.style.transform).toBe('')
	})
})
