import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Navigator } from '../src/navigator.js'

// ─── Mock Wrapper ──────────────────────────────────────────────────
//
// Navigator only depends on a handful of wrapper methods/getters:
//   movement/selection actions: next/prev/first/last/expand/collapse/
//                               select/extend/range/toggle/cancel
//   moveTo(path), findByText(buffer, startAfter), blur(), focusedKey
// A plain object with vi.fn() spies is sufficient and keeps the test isolated.

function createWrapper(overrides = {}) {
	return {
		focusedKey: null,
		next: vi.fn(),
		prev: vi.fn(),
		first: vi.fn(),
		last: vi.fn(),
		expand: vi.fn(),
		collapse: vi.fn(),
		select: vi.fn(),
		extend: vi.fn(),
		range: vi.fn(),
		toggle: vi.fn(),
		cancel: vi.fn(),
		moveTo: vi.fn(),
		findByText: vi.fn().mockReturnValue(null),
		blur: vi.fn(),
		...overrides
	}
}

// Build a root list with three focusable items carrying data-path.
function createList() {
	const root = document.createElement('ul')
	const items = ['0', '1', '2'].map((path) => {
		const li = document.createElement('li')
		li.setAttribute('data-path', path)
		li.tabIndex = 0
		li.textContent = `Item ${path}`
		root.appendChild(li)
		return li
	})
	document.body.appendChild(root)
	return { root, items }
}

function keydown(target, key, opts = {}) {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts })
	target.dispatchEvent(event)
	return event
}

describe('Navigator', () => {
	let root
	let items
	let wrapper
	let nav

	beforeEach(() => {
		;({ root, items } = createList())
		wrapper = createWrapper()
	})

	afterEach(() => {
		nav?.destroy()
		nav = null
		while (document.body.firstChild) document.body.removeChild(document.body.firstChild)
	})

	// ─── Keydown → movement ──────────────────────────────────────────

	it('maps ArrowDown to next and preventDefaults', () => {
		nav = new Navigator(root, wrapper)
		items[0].focus()
		const event = keydown(items[0], 'ArrowDown')

		expect(wrapper.next).toHaveBeenCalledOnce()
		expect(event.defaultPrevented).toBe(true)
	})

	it('maps ArrowUp to prev', () => {
		nav = new Navigator(root, wrapper)
		items[1].focus()
		keydown(items[1], 'ArrowUp')
		expect(wrapper.prev).toHaveBeenCalledOnce()
	})

	it('maps Home/End to first/last', () => {
		nav = new Navigator(root, wrapper)
		items[0].focus()
		keydown(items[0], 'Home')
		keydown(items[0], 'End')
		expect(wrapper.first).toHaveBeenCalledOnce()
		expect(wrapper.last).toHaveBeenCalledOnce()
	})

	it('passes the focused item path to selection actions', () => {
		nav = new Navigator(root, wrapper)
		items[2].focus()
		keydown(items[2], 'Enter')
		expect(wrapper.select).toHaveBeenCalledWith('2')
	})

	it('ignores keys that have no binding', () => {
		nav = new Navigator(root, wrapper)
		items[0].focus()
		const event = keydown(items[0], 'q')
		// 'q' is printable → typeahead; findByText returns null → not consumed
		expect(event.defaultPrevented).toBe(false)
		expect(wrapper.select).not.toHaveBeenCalled()
	})

	it('lets the browser handle Enter on a link (no action dispatched)', () => {
		const link = document.createElement('a')
		link.href = '#x'
		link.setAttribute('data-path', '3')
		link.tabIndex = 0
		root.appendChild(link)

		nav = new Navigator(root, wrapper)
		link.focus()
		const event = keydown(link, 'Enter')

		expect(wrapper.select).not.toHaveBeenCalled()
		expect(event.defaultPrevented).toBe(false)
	})

	it('supports collapsible nested arrows when collapsible: true', () => {
		nav = new Navigator(root, wrapper, { collapsible: true })
		items[0].focus()
		keydown(items[0], 'ArrowRight')
		keydown(items[0], 'ArrowLeft')
		expect(wrapper.expand).toHaveBeenCalledOnce()
		expect(wrapper.collapse).toHaveBeenCalledOnce()
	})

	// ─── Keydown → syncFocus after movement ──────────────────────────

	it('after a movement key, focuses + scrolls the new focusedKey item', () => {
		wrapper.focusedKey = '1'
		const scrollSpy = vi.spyOn(items[1], 'focus')
		nav = new Navigator(root, wrapper)
		items[0].focus()
		keydown(items[0], 'ArrowDown')
		// syncFocus moves DOM focus to the wrapper's focusedKey item
		expect(scrollSpy).toHaveBeenCalledWith({ preventScroll: true })
	})

	it('syncFocus is a no-op when wrapper has no focusedKey', () => {
		wrapper.focusedKey = null
		nav = new Navigator(root, wrapper)
		items[0].focus()
		expect(() => keydown(items[0], 'ArrowDown')).not.toThrow()
	})

	it('syncFocus does nothing when focusedKey item is not in the DOM', () => {
		wrapper.focusedKey = 'missing'
		nav = new Navigator(root, wrapper)
		items[0].focus()
		expect(() => keydown(items[0], 'ArrowDown')).not.toThrow()
	})

	// ─── Click ───────────────────────────────────────────────────────

	it('click selects the clicked item and preventDefaults', () => {
		nav = new Navigator(root, wrapper)
		const event = new MouseEvent('click', { bubbles: true, cancelable: true })
		items[1].dispatchEvent(event)
		expect(wrapper.select).toHaveBeenCalledWith('1')
		expect(event.defaultPrevented).toBe(true)
	})

	it('shift-click dispatches range', () => {
		nav = new Navigator(root, wrapper)
		items[1].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }))
		expect(wrapper.range).toHaveBeenCalledWith('1')
	})

	it('ctrl-click and meta-click dispatch extend', () => {
		nav = new Navigator(root, wrapper)
		items[1].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }))
		items[2].dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }))
		expect(wrapper.extend).toHaveBeenCalledWith('1')
		expect(wrapper.extend).toHaveBeenCalledWith('2')
	})

	it('click on an accordion trigger dispatches toggle', () => {
		const group = document.createElement('li')
		group.setAttribute('data-path', '9')
		const header = document.createElement('button')
		header.setAttribute('data-accordion-trigger', '')
		group.appendChild(header)
		root.appendChild(group)

		nav = new Navigator(root, wrapper)
		header.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(wrapper.toggle).toHaveBeenCalledWith('9')
	})

	it('click outside any data-path element is ignored', () => {
		nav = new Navigator(root, wrapper)
		root.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(wrapper.select).not.toHaveBeenCalled()
	})

	it('click on a link still updates state but does not preventDefault', () => {
		const link = document.createElement('a')
		link.href = '#y'
		link.setAttribute('data-path', '5')
		root.appendChild(link)

		nav = new Navigator(root, wrapper)
		const event = new MouseEvent('click', { bubbles: true, cancelable: true })
		link.dispatchEvent(event)
		expect(wrapper.select).toHaveBeenCalledWith('5')
		expect(event.defaultPrevented).toBe(false)
	})

	// ─── Focusin ─────────────────────────────────────────────────────

	it('focusin on an item calls moveTo with its path', () => {
		nav = new Navigator(root, wrapper)
		items[2].dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
		expect(wrapper.moveTo).toHaveBeenCalledWith('2')
	})

	it('focusin on the container redirects to the current focusedKey item', () => {
		wrapper.focusedKey = '1'
		const focusSpy = vi.spyOn(items[1], 'focus')
		nav = new Navigator(root, wrapper)
		root.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
		expect(focusSpy).toHaveBeenCalled()
	})

	it('focusin on the container with no focusedKey redirects to the first item', () => {
		wrapper.focusedKey = null
		const focusSpy = vi.spyOn(items[0], 'focus')
		nav = new Navigator(root, wrapper)
		root.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
		expect(focusSpy).toHaveBeenCalled()
	})

	it('focusin on the container is a no-op when there is no matching item', () => {
		while (root.firstChild) root.removeChild(root.firstChild)
		wrapper.focusedKey = null
		nav = new Navigator(root, wrapper)
		expect(() => root.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))).not.toThrow()
	})

	// ─── Focusout ────────────────────────────────────────────────────

	it('focusout to an element outside the root calls wrapper.blur', () => {
		const outside = document.createElement('button')
		document.body.appendChild(outside)
		nav = new Navigator(root, wrapper)

		const event = new FocusEvent('focusout', { bubbles: true })
		Object.defineProperty(event, 'relatedTarget', { value: outside })
		items[0].dispatchEvent(event)

		expect(wrapper.blur).toHaveBeenCalledOnce()
	})

	it('focusout with no relatedTarget calls wrapper.blur', () => {
		nav = new Navigator(root, wrapper)
		const event = new FocusEvent('focusout', { bubbles: true })
		Object.defineProperty(event, 'relatedTarget', { value: null })
		items[0].dispatchEvent(event)
		expect(wrapper.blur).toHaveBeenCalledOnce()
	})

	it('focusout to another item inside the root does not blur', () => {
		nav = new Navigator(root, wrapper)
		const event = new FocusEvent('focusout', { bubbles: true })
		Object.defineProperty(event, 'relatedTarget', { value: items[1] })
		items[0].dispatchEvent(event)
		expect(wrapper.blur).not.toHaveBeenCalled()
	})

	it('tolerates a wrapper without a blur method', () => {
		wrapper = createWrapper({ blur: undefined })
		nav = new Navigator(root, wrapper)
		const event = new FocusEvent('focusout', { bubbles: true })
		Object.defineProperty(event, 'relatedTarget', { value: null })
		expect(() => items[0].dispatchEvent(event)).not.toThrow()
	})

	// ─── Wheel / containScroll ───────────────────────────────────────

	it('does not listen for wheel by default', () => {
		nav = new Navigator(root, wrapper)
		const event = new WheelEvent('wheel', { bubbles: true, cancelable: true })
		const stop = vi.spyOn(event, 'stopPropagation')
		root.dispatchEvent(event)
		expect(stop).not.toHaveBeenCalled()
	})

	it('stops wheel propagation when containScroll is enabled', () => {
		nav = new Navigator(root, wrapper, { containScroll: true })
		const event = new WheelEvent('wheel', { bubbles: true, cancelable: true })
		const stop = vi.spyOn(event, 'stopPropagation')
		root.dispatchEvent(event)
		expect(stop).toHaveBeenCalledOnce()
	})

	// ─── Typeahead ───────────────────────────────────────────────────

	it('typeahead matches a printable key and moves to the match', () => {
		wrapper.findByText = vi.fn().mockReturnValue('1')
		wrapper.focusedKey = '0'
		nav = new Navigator(root, wrapper)
		items[0].focus()
		const event = keydown(items[0], 'i')

		expect(wrapper.findByText).toHaveBeenCalledWith('i', '0')
		expect(wrapper.moveTo).toHaveBeenCalledWith('1')
		expect(event.defaultPrevented).toBe(true)
	})

	it('typeahead accumulates characters into the buffer', () => {
		wrapper.findByText = vi.fn().mockReturnValue('2')
		nav = new Navigator(root, wrapper)
		items[0].focus()
		keydown(items[0], 'a')
		keydown(items[0], 'b')
		// second call: buffer is "ab", startAfter null (buffer was non-empty)
		expect(wrapper.findByText).toHaveBeenLastCalledWith('ab', null)
	})

	it('typeahead buffer resets after the inactivity timeout', () => {
		vi.useFakeTimers()
		wrapper.findByText = vi.fn().mockReturnValue('1')
		wrapper.focusedKey = '0'
		nav = new Navigator(root, wrapper)
		items[0].focus()

		keydown(items[0], 'a')
		// startAfter on first key is the focusedKey
		expect(wrapper.findByText).toHaveBeenLastCalledWith('a', '0')

		vi.advanceTimersByTime(500) // TYPEAHEAD_RESET_MS
		keydown(items[0], 'b')
		// buffer was cleared → fresh search with startAfter = focusedKey again
		expect(wrapper.findByText).toHaveBeenLastCalledWith('b', '0')

		vi.useRealTimers()
	})

	it('ignores printable keys combined with ctrl/meta/alt (not typeahead)', () => {
		wrapper.findByText = vi.fn().mockReturnValue('1')
		nav = new Navigator(root, wrapper)
		items[0].focus()
		keydown(items[0], 'a', { ctrlKey: true })
		keydown(items[0], 'a', { metaKey: true })
		keydown(items[0], 'a', { altKey: true })
		expect(wrapper.findByText).not.toHaveBeenCalled()
	})

	it('does not treat space as a typeahead character', () => {
		wrapper.findByText = vi.fn().mockReturnValue('1')
		nav = new Navigator(root, wrapper)
		items[0].focus()
		keydown(items[0], ' ')
		expect(wrapper.findByText).not.toHaveBeenCalled()
		// space resolves to the select action instead
		expect(wrapper.select).toHaveBeenCalled()
	})

	it('typeahead with no match does not consume the event', () => {
		wrapper.findByText = vi.fn().mockReturnValue(null)
		nav = new Navigator(root, wrapper)
		items[0].focus()
		wrapper.moveTo.mockClear() // discard the focusin-triggered moveTo
		const event = keydown(items[0], 'z')
		expect(wrapper.moveTo).not.toHaveBeenCalled()
		expect(event.defaultPrevented).toBe(false)
	})

	// ─── Scroll into view ────────────────────────────────────────────

	it('scrolls the focused item into view above the viewport', () => {
		wrapper.focusedKey = '0'
		nav = new Navigator(root, wrapper)
		// Geometry: item sits above the scrolled viewport → scrollTop snaps to item top.
		Object.defineProperty(items[0], 'offsetTop', { value: 10, configurable: true })
		Object.defineProperty(items[0], 'offsetHeight', { value: 20, configurable: true })
		Object.defineProperty(root, 'scrollTop', { value: 100, writable: true, configurable: true })
		Object.defineProperty(root, 'clientHeight', { value: 200, configurable: true })

		items[1].focus()
		keydown(items[1], 'ArrowUp')
		expect(root.scrollTop).toBe(10)
	})

	it('scrolls the focused item into view below the viewport', () => {
		wrapper.focusedKey = '2'
		nav = new Navigator(root, wrapper)
		Object.defineProperty(items[2], 'offsetTop', { value: 500, configurable: true })
		Object.defineProperty(items[2], 'offsetHeight', { value: 50, configurable: true })
		Object.defineProperty(root, 'scrollTop', { value: 0, writable: true, configurable: true })
		Object.defineProperty(root, 'clientHeight', { value: 200, configurable: true })

		items[0].focus()
		keydown(items[0], 'ArrowDown')
		// itemBottom (550) > visibleBottom (200) → scrollTop = 550 - 200 = 350
		expect(root.scrollTop).toBe(350)
	})

	it('leaves scrollTop alone when the item is already visible', () => {
		wrapper.focusedKey = '1'
		nav = new Navigator(root, wrapper)
		Object.defineProperty(items[1], 'offsetTop', { value: 50, configurable: true })
		Object.defineProperty(items[1], 'offsetHeight', { value: 20, configurable: true })
		Object.defineProperty(root, 'scrollTop', { value: 0, writable: true, configurable: true })
		Object.defineProperty(root, 'clientHeight', { value: 200, configurable: true })

		items[0].focus()
		keydown(items[0], 'ArrowDown')
		expect(root.scrollTop).toBe(0)
	})

	it('does not re-focus an item that already has focus', () => {
		wrapper.focusedKey = '1'
		nav = new Navigator(root, wrapper)
		items[1].focus()
		const focusSpy = vi.spyOn(items[1], 'focus')
		// keydown from the already-focused item; syncFocus should skip the focus() call
		keydown(items[1], 'ArrowDown')
		expect(focusSpy).not.toHaveBeenCalled()
	})

	// ─── Destroy ─────────────────────────────────────────────────────

	it('removes all listeners on destroy', () => {
		nav = new Navigator(root, wrapper)
		nav.destroy()
		nav = null

		items[0].focus()
		keydown(items[0], 'ArrowDown')
		items[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(wrapper.next).not.toHaveBeenCalled()
		expect(wrapper.select).not.toHaveBeenCalled()
	})

	it('removes the wheel listener on destroy when containScroll is enabled', () => {
		nav = new Navigator(root, wrapper, { containScroll: true })
		nav.destroy()
		nav = null

		const event = new WheelEvent('wheel', { bubbles: true })
		const stop = vi.spyOn(event, 'stopPropagation')
		root.dispatchEvent(event)
		expect(stop).not.toHaveBeenCalled()
	})

	it('clears a pending typeahead timer on destroy', () => {
		vi.useFakeTimers()
		wrapper.findByText = vi.fn().mockReturnValue('1')
		nav = new Navigator(root, wrapper)
		items[0].focus()
		keydown(items[0], 'a') // schedules the reset timer
		nav.destroy()
		nav = null
		// Advancing past the reset window must not throw (timer was cleared)
		expect(() => vi.advanceTimersByTime(1000)).not.toThrow()
		vi.useRealTimers()
	})
})
