import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Trigger } from '../src/trigger.js'

function makeElements() {
	const trigger = document.createElement('button')
	const container = document.createElement('div')
	container.appendChild(trigger)
	document.body.appendChild(container)
	return { trigger, container }
}

function makeTrigger(overrides = {}) {
	const { trigger, container } = makeElements()
	let open = false
	const callbacks = {
		onopen: vi.fn(() => { open = true }),
		onclose: vi.fn(() => { open = false }),
		onlast: vi.fn(),
		isOpen: () => open,
		...overrides
	}
	const t = new Trigger(trigger, container, callbacks)
	return { t, trigger, container, callbacks, isOpen: () => open }
}

describe('Trigger', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
	})

	describe('open() / close()', () => {
		it('open() calls onopen when closed', () => {
			const { t, callbacks } = makeTrigger()
			t.open()
			expect(callbacks.onopen).toHaveBeenCalledOnce()
		})

		it('open() is a no-op when already open', () => {
			const { t, callbacks } = makeTrigger()
			t.open()
			t.open()
			expect(callbacks.onopen).toHaveBeenCalledOnce()
		})

		it('close() calls onclose when open', () => {
			const { t, callbacks, trigger } = makeTrigger()
			trigger.focus = vi.fn()
			t.open()
			t.close()
			expect(callbacks.onclose).toHaveBeenCalledOnce()
		})

		it('close() returns focus to trigger button', () => {
			const { t, trigger } = makeTrigger()
			trigger.focus = vi.fn()
			t.open()
			t.close()
			expect(trigger.focus).toHaveBeenCalledOnce()
		})

		it('close() is a no-op when already closed', () => {
			const { t, callbacks } = makeTrigger()
			t.close()
			expect(callbacks.onclose).not.toHaveBeenCalled()
		})

		it('isOpen reflects current state', () => {
			const { t } = makeTrigger()
			expect(t.isOpen).toBe(false)
			t.open()
			expect(t.isOpen).toBe(true)
		})
	})

	describe('click on trigger', () => {
		it('opens on click when closed', () => {
			const { t, trigger, callbacks } = makeTrigger()
			trigger.click()
			expect(callbacks.onopen).toHaveBeenCalledOnce()
		})

		it('closes on click when open', () => {
			const { t, trigger, callbacks } = makeTrigger()
			trigger.focus = vi.fn()
			t.open()
			trigger.click()
			expect(callbacks.onclose).toHaveBeenCalledOnce()
		})

		it('ignores clicks from child interactive elements', () => {
			const { t, trigger, container, callbacks } = makeTrigger()
			const inner = document.createElement('button')
			trigger.appendChild(inner)
			inner.click()
			expect(callbacks.onopen).not.toHaveBeenCalled()
		})
	})

	describe('keyboard: trigger element', () => {
		function fireKey(el, key) {
			el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
		}

		it('Enter toggles open when closed', () => {
			const { trigger, callbacks } = makeTrigger()
			fireKey(trigger, 'Enter')
			expect(callbacks.onopen).toHaveBeenCalledOnce()
		})

		it('Space toggles open when closed', () => {
			const { trigger, callbacks } = makeTrigger()
			fireKey(trigger, ' ')
			expect(callbacks.onopen).toHaveBeenCalledOnce()
		})

		it('Enter closes when open', () => {
			const { t, trigger, callbacks } = makeTrigger()
			trigger.focus = vi.fn()
			t.open()
			fireKey(trigger, 'Enter')
			expect(callbacks.onclose).toHaveBeenCalledOnce()
		})

		it('ArrowDown opens when closed', () => {
			const { trigger, callbacks } = makeTrigger()
			fireKey(trigger, 'ArrowDown')
			expect(callbacks.onopen).toHaveBeenCalledOnce()
		})

		it('ArrowUp opens and calls onlast', () => {
			const { trigger, callbacks } = makeTrigger()
			fireKey(trigger, 'ArrowUp')
			expect(callbacks.onopen).toHaveBeenCalledOnce()
			expect(callbacks.onlast).toHaveBeenCalledOnce()
		})

		it('ArrowUp does not call onlast when onlast is not provided', () => {
			const { trigger, container } = makeElements()
			let open = false
			const onopen = vi.fn(() => { open = true })
			const onclose = vi.fn(() => { open = false })
			const t = new Trigger(trigger, container, { onopen, onclose, isOpen: () => open })
			trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
			expect(onopen).toHaveBeenCalledOnce()
		})
	})

	describe('document-level: Escape', () => {
		function fireDocKey(key) {
			document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
		}

		it('Escape closes when open', () => {
			const { t, callbacks } = makeTrigger()
			const triggerEl = document.querySelector('button')
			if (triggerEl) triggerEl.focus = vi.fn()
			t.open()
			fireDocKey('Escape')
			expect(callbacks.onclose).toHaveBeenCalledOnce()
		})

		it('Escape is a no-op when already closed', () => {
			const { callbacks } = makeTrigger()
			fireDocKey('Escape')
			expect(callbacks.onclose).not.toHaveBeenCalled()
		})
	})

	describe('document-level: click outside', () => {
		it('closes when clicking outside the container', () => {
			const { t, callbacks } = makeTrigger()
			const outside = document.createElement('div')
			document.body.appendChild(outside)
			t.open()
			outside.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
			expect(callbacks.onclose).toHaveBeenCalledOnce()
		})

		it('stays open when clicking inside the container (not on trigger)', () => {
			const { t, container, callbacks } = makeTrigger()
			t.open()
			const inside = document.createElement('span')
			container.appendChild(inside)
			inside.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
			expect(callbacks.onclose).not.toHaveBeenCalled()
		})
	})

	describe('destroy()', () => {
		it('removes all event listeners after destroy', () => {
			const { t, trigger, callbacks } = makeTrigger()
			t.destroy()
			trigger.click()
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
			expect(callbacks.onopen).not.toHaveBeenCalled()
			expect(callbacks.onclose).not.toHaveBeenCalled()
		})
	})
})
