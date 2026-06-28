import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { tooltip } from '../src/tooltip.svelte.js'

// ─── Setup ─────────────────────────────────────────────────────────

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild)
	}
})

function createTrigger() {
	const container = document.createElement('div')
	container.style.position = 'relative'
	const node = document.createElement('button')
	node.textContent = 'Hover me'
	container.appendChild(node)
	document.body.appendChild(container)
	return node
}

// ─── Tests ─────────────────────────────────────────────────────────

describe('tooltip action', () => {
	it('creates tooltip element in positioned ancestor', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Hello' }))
		flushSync()

		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el).toBeTruthy()
		expect(el.textContent).toBe('Hello')

		cleanup()
	})

	it('sets role="tooltip" and links via aria-describedby', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info' }))
		flushSync()

		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('role')).toBe('tooltip')
		expect(node.getAttribute('aria-describedby')).toBe(el.id)

		cleanup()
	})

	it('sets data-tooltip-trigger on the node', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info' }))
		flushSync()

		expect(node.hasAttribute('data-tooltip-trigger')).toBe(true)

		cleanup()
	})

	it('starts with data-tooltip-visible="false"', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info' }))
		flushSync()

		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-visible')).toBe('false')

		cleanup()
	})

	it('shows tooltip after delay on mouseenter', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info', delay: 300 }))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-visible')).toBe('false')

		vi.advanceTimersByTime(300)
		expect(el.getAttribute('data-tooltip-visible')).toBe('true')

		cleanup()
	})

	it('hides tooltip immediately on mouseleave', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info', delay: 0 }))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		vi.advanceTimersByTime(0)
		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-visible')).toBe('true')

		node.dispatchEvent(new MouseEvent('mouseleave'))
		expect(el.getAttribute('data-tooltip-visible')).toBe('false')

		cleanup()
	})

	it('shows tooltip immediately on focusin', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info' }))
		flushSync()

		node.dispatchEvent(new FocusEvent('focusin'))
		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-visible')).toBe('true')

		cleanup()
	})

	it('hides tooltip on focusout', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info' }))
		flushSync()

		node.dispatchEvent(new FocusEvent('focusin'))
		node.dispatchEvent(new FocusEvent('focusout'))
		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-visible')).toBe('false')

		cleanup()
	})

	it('hides tooltip on Escape key', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info' }))
		flushSync()

		node.dispatchEvent(new FocusEvent('focusin'))
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-visible')).toBe('false')

		cleanup()
	})

	it('cancels pending show when mouseleave fires before delay', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info', delay: 500 }))
		flushSync()

		node.dispatchEvent(new MouseEvent('mouseenter'))
		vi.advanceTimersByTime(200)
		node.dispatchEvent(new MouseEvent('mouseleave'))
		vi.advanceTimersByTime(300)

		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-visible')).toBe('false')

		cleanup()
	})

	it('removes tooltip element and attributes on cleanup', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info' }))
		flushSync()

		cleanup()
		flushSync()

		expect(node.parentElement.querySelector('[data-tooltip-content]')).toBeNull()
		expect(node.hasAttribute('data-tooltip-trigger')).toBe(false)
		expect(node.hasAttribute('aria-describedby')).toBe(false)
	})

	it('uses preferred position as data-tooltip-position', () => {
		const node = createTrigger()
		const cleanup = $effect.root(() => tooltip(node, { content: 'Info', position: 'right' }))
		flushSync()

		const el = node.parentElement.querySelector('[data-tooltip-content]')
		expect(el.getAttribute('data-tooltip-position')).toBe('right')

		cleanup()
	})

	// ─── Positioned-ancestor resolution ────────────────────────────

	it('walks up to document.body when no ancestor is positioned', () => {
		// Trigger with no positioned ancestor — chain of plain divs under body.
		const outer = document.createElement('div')
		const inner = document.createElement('div')
		const node = document.createElement('button')
		inner.appendChild(node)
		outer.appendChild(inner)
		document.body.appendChild(outer)

		const cleanup = $effect.root(() => tooltip(node, { content: 'Body' }))
		flushSync()

		// Tooltip is mounted on document.body, not on the unpositioned parent.
		expect(document.body.querySelector('[data-tooltip-content]')).toBeTruthy()
		expect(node.parentElement.querySelector('[data-tooltip-content]')).toBeNull()

		cleanup()
	})

	it('uses the nearest positioned ancestor several levels up', () => {
		const positioned = document.createElement('div')
		positioned.style.position = 'absolute'
		const middle = document.createElement('div') // unpositioned — forces the walk-up
		const node = document.createElement('button')
		middle.appendChild(node)
		positioned.appendChild(middle)
		document.body.appendChild(positioned)

		const cleanup = $effect.root(() => tooltip(node, { content: 'Ancestor' }))
		flushSync()

		expect(positioned.querySelector('[data-tooltip-content]')).toBeTruthy()
		cleanup()
	})

	// ─── Flip fallback ─────────────────────────────────────────────

	it('falls back to the first fitting side when neither preferred nor its flip fit', () => {
		const node = createTrigger()
		// Window so small that top/bottom cannot fit, but left/right can.
		window.innerWidth = 1000
		window.innerHeight = 50

		// Trigger spans the full (tiny) viewport height so top & bottom overflow.
		node.getBoundingClientRect = () => ({
			top: 0,
			bottom: 50,
			left: 400,
			right: 460,
			width: 60,
			height: 50
		})

		const cleanup = $effect.root(() => tooltip(node, { content: 'Flip', position: 'top' }))
		flushSync()

		const el = node.parentElement.querySelector('[data-tooltip-content]')
		// A non-zero-size tooltip is needed so left/right are the only fitting sides.
		el.getBoundingClientRect = () => ({ width: 80, height: 40, top: 0, left: 0, right: 0, bottom: 0 })

		node.dispatchEvent(new FocusEvent('focusin'))

		// preferred 'top' overflows, flip 'bottom' overflows → falls through to a fitting side.
		expect(['left', 'right']).toContain(el.getAttribute('data-tooltip-position'))

		cleanup()
		window.innerWidth = 1024
		window.innerHeight = 768
	})
})
