import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { hoverLift } from '../src/hover-lift.svelte.js'

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

describe('hoverLift', () => {
	// ─── Transition Setup ──────────────────────────────────────────

	it('sets transition on mount', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		expect(node.style.transition).toContain('transform')
		expect(node.style.transition).toContain('box-shadow')
		expect(node.style.transition).toContain('200ms')
		cleanup()
	})

	it('uses custom duration for transition', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node, { duration: 400 }))
		flushSync()

		expect(node.style.transition).toContain('400ms')
		cleanup()
	})

	// ─── Hover Behavior ────────────────────────────────────────────

	it('applies transform on mouseenter', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		expect(node.style.transform).toBe('translateY(-0.25rem)')
		cleanup()
	})

	it('applies box-shadow on mouseenter', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		expect(node.style.boxShadow).toBe('0 10px 25px -5px rgba(0,0,0,0.1)')
		cleanup()
	})

	it('resets transform on mouseleave', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		node.dispatchEvent(new MouseEvent('mouseleave'))
		expect(node.style.transform).toBe('')
		cleanup()
	})

	it('resets box-shadow on mouseleave', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		node.dispatchEvent(new MouseEvent('mouseleave'))
		expect(node.style.boxShadow).toBe('')
		cleanup()
	})

	// ─── Custom Options ────────────────────────────────────────────

	it('supports custom distance', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node, { distance: '-0.5rem' }))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		expect(node.style.transform).toBe('translateY(-0.5rem)')
		cleanup()
	})

	it('supports custom shadow', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node, { shadow: '0 5px 15px rgba(0,0,0,0.2)' }))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		expect(node.style.boxShadow).toBe('0 5px 15px rgba(0,0,0,0.2)')
		cleanup()
	})

	// ─── prefers-reduced-motion ────────────────────────────────────

	it('does nothing when prefers-reduced-motion is set', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({ matches: true })
		)

		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		expect(node.style.transition).toBe('')
		node.dispatchEvent(new MouseEvent('mouseenter'))
		expect(node.style.transform).toBe('')
		cleanup()
	})

	// ─── Cleanup ───────────────────────────────────────────────────

	it('restores original styles on cleanup', () => {
		const node = document.createElement('div')
		node.style.transform = 'rotate(5deg)'
		node.style.boxShadow = '0 1px 2px black'
		node.style.transition = 'opacity 100ms'

		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		// Transition was overridden
		expect(node.style.transition).toContain('200ms')

		cleanup()
		expect(node.style.transform).toBe('rotate(5deg)')
		expect(node.style.boxShadow).toBe('0 1px 2px black')
		expect(node.style.transition).toBe('opacity 100ms')
	})

	it('removes event listeners on cleanup', () => {
		const node = document.createElement('div')
		const cleanup = $effect.root(() => hoverLift(node))
		flushSync()

		cleanup()

		// After cleanup, mouseenter should not change transform
		node.dispatchEvent(new MouseEvent('mouseenter'))
		expect(node.style.transform).toBe('')
	})
})
