import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Navigator, navigator } from './navigator.js'

// ─── Mock Wrapper ─────────────────────────────────────────────────────────────
// Records every call as { action, path }.
// findByText result is controllable per test.

class MockWrapper {
	focusedKey = null
	calls = []
	findByTextResult = null // set in tests to control typeahead match

	_record(action, path) {
		this.calls.push({ action, path })
	}

	// Selection actions — use path, fall back to focusedKey
	select(path) { this._record('select', path) }
	extend(path) { this._record('extend', path) }
	range(path)  { this._record('range',  path) }
	toggle(path) { this._record('toggle', path) }
	cancel(path) { this._record('cancel', path) }
	moveTo(path) { this._record('moveTo', path); this.focusedKey = path }
	blur()       { this._record('blur',   null)  }

	// Movement actions — path is passed through but ignored
	next(path)     { this._record('next',     path) }
	prev(path)     { this._record('prev',     path) }
	first(path)    { this._record('first',    path) }
	last(path)     { this._record('last',     path) }
	expand(path)   { this._record('expand',   path) }
	collapse(path) { this._record('collapse', path) }

	findByText(query, startAfter) {
		this._record('findByText', null)
		return this.findByTextResult
	}

	lastCall() { return this.calls[this.calls.length - 1] }
	reset()    { this.calls = [] }
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────
// Structure:
//   nav (container, tabindex=-1)
//     button[data-path="0"][data-accordion-trigger]  "Elements"     (group)
//     a[href="/list"][data-path="0-0"]               "List"         (link child)
//     a[href="/menu"][data-path="0-1"]               "Menu"         (link child)
//     button[data-path="1"]                          "Introduction" (leaf)
//     button[data-path="2"]                          "Log out"      (leaf)

function buildDOM() {
	const root = document.createElement('nav')
	root.tabIndex = -1

	const group = document.createElement('button')
	group.dataset.path = '0'
	group.setAttribute('data-accordion-trigger', '')
	group.textContent = 'Elements'

	const link1 = document.createElement('a')
	link1.href = '/list'
	link1.dataset.path = '0-0'
	link1.textContent = 'List'

	const link2 = document.createElement('a')
	link2.href = '/menu'
	link2.dataset.path = '0-1'
	link2.textContent = 'Menu'

	const btn1 = document.createElement('button')
	btn1.dataset.path = '1'
	btn1.textContent = 'Introduction'

	const btn2 = document.createElement('button')
	btn2.dataset.path = '2'
	btn2.textContent = 'Log out'

	root.append(group, link1, link2, btn1, btn2)
	document.body.appendChild(root)

	return { root, group, link1, link2, btn1, btn2 }
}

function keydown(target, key, modifiers = {}) {
	target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers }))
}

function click(target, modifiers = {}) {
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...modifiers }))
}

function focusin(target, relatedTarget = null) {
	target.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget }))
}

function focusout(target, relatedTarget = null) {
	target.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }))
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

let dom, wrapper, nav
let scrollSpy

beforeEach(() => {
	// jsdom doesn't implement scrollIntoView — define it so we can spy on it
	Element.prototype.scrollIntoView ??= () => {}
	scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})

	dom = buildDOM()
	wrapper = new MockWrapper()
	nav = new Navigator(dom.root, wrapper, { collapsible: true })
})

afterEach(() => {
	nav.destroy()
	dom.root.remove()
	vi.restoreAllMocks()
})

// ─── Keyboard: movement keys ──────────────────────────────────────────────────

describe('keyboard — movement', () => {
	it('ArrowDown calls next with current path', () => {
		dom.btn1.focus()
		keydown(dom.btn1, 'ArrowDown')
		expect(wrapper.lastCall()).toEqual({ action: 'next', path: '1' })
	})

	it('ArrowUp calls prev with current path', () => {
		dom.btn1.focus()
		keydown(dom.btn1, 'ArrowUp')
		expect(wrapper.lastCall()).toEqual({ action: 'prev', path: '1' })
	})

	it('Home calls first with current path', () => {
		dom.btn1.focus()
		keydown(dom.btn1, 'Home')
		expect(wrapper.lastCall()).toEqual({ action: 'first', path: '1' })
	})

	it('End calls last with current path', () => {
		dom.btn1.focus()
		keydown(dom.btn1, 'End')
		expect(wrapper.lastCall()).toEqual({ action: 'last', path: '1' })
	})

	it('path is null when no item is focused', () => {
		// No .focus() call — document.activeElement is document.body (not inside root)
		// so getPath returns null
		wrapper.reset()
		keydown(dom.root, 'ArrowDown')
		expect(wrapper.lastCall()).toEqual({ action: 'next', path: null })
	})
})

// ─── Keyboard: expand / collapse ─────────────────────────────────────────────

describe('keyboard — expand / collapse (collapsible: true)', () => {
	it('ArrowRight calls expand with current path', () => {
		dom.group.focus()
		keydown(dom.group, 'ArrowRight')
		expect(wrapper.lastCall()).toEqual({ action: 'expand', path: '0' })
	})

	it('ArrowLeft calls collapse with current path', () => {
		dom.group.focus()
		keydown(dom.group, 'ArrowLeft')
		expect(wrapper.lastCall()).toEqual({ action: 'collapse', path: '0' })
	})

	it('ArrowRight does nothing when collapsible is false', () => {
		nav.destroy()
		nav = new Navigator(dom.root, wrapper, { collapsible: false })
		dom.group.focus()
		wrapper.reset() // reset AFTER focus fires focusin→moveTo
		keydown(dom.group, 'ArrowRight')
		expect(wrapper.calls).toHaveLength(0)
	})
})

// ─── Keyboard: selection ──────────────────────────────────────────────────────

describe('keyboard — selection', () => {
	it('Enter calls select with current path', () => {
		dom.btn1.focus()
		keydown(dom.btn1, 'Enter')
		expect(wrapper.lastCall()).toEqual({ action: 'select', path: '1' })
	})

	it('Space calls select with current path', () => {
		dom.btn1.focus()
		keydown(dom.btn1, ' ')
		expect(wrapper.lastCall()).toEqual({ action: 'select', path: '1' })
	})

	it('Enter on a link is NOT intercepted (browser handles it)', () => {
		dom.link1.focus()
		wrapper.reset() // reset AFTER focus fires focusin→moveTo
		keydown(dom.link1, 'Enter')
		expect(wrapper.calls).toHaveLength(0)
	})

	it('Space on a link is NOT intercepted', () => {
		dom.link1.focus()
		wrapper.reset() // reset AFTER focus fires focusin→moveTo
		keydown(dom.link1, ' ')
		expect(wrapper.calls).toHaveLength(0)
	})

	it('Shift+Space calls range', () => {
		dom.btn1.focus()
		keydown(dom.btn1, ' ', { shiftKey: true })
		expect(wrapper.lastCall()).toEqual({ action: 'range', path: '1' })
	})

	it('Ctrl+Space calls extend', () => {
		dom.btn1.focus()
		keydown(dom.btn1, ' ', { ctrlKey: true })
		expect(wrapper.lastCall()).toEqual({ action: 'extend', path: '1' })
	})

	it('Escape calls cancel with current path', () => {
		dom.btn1.focus()
		keydown(dom.btn1, 'Escape')
		expect(wrapper.lastCall()).toEqual({ action: 'cancel', path: '1' })
	})
})

// ─── Keyboard: scrollIntoView ─────────────────────────────────────────────────

describe('keyboard — scrollIntoView', () => {
	it('is called after a movement key', () => {
		wrapper.focusedKey = '2'
		dom.btn1.focus()
		keydown(dom.btn1, 'ArrowDown')
		expect(scrollSpy).toHaveBeenCalledOnce()
	})

	it('is called after Enter/select', () => {
		wrapper.focusedKey = '1'
		dom.btn1.focus()
		keydown(dom.btn1, 'Enter')
		expect(scrollSpy).toHaveBeenCalledOnce()
	})

	it('scrolls the element matching focusedKey', () => {
		wrapper.focusedKey = '2'
		dom.btn1.focus()
		keydown(dom.btn1, 'ArrowDown')
		// scrollIntoView should have been called on btn2 (data-path="2")
		expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
	})

	it('is NOT called when focusedKey is null', () => {
		dom.btn1.focus()
		wrapper.focusedKey = null // override AFTER focusin sets it via moveTo
		keydown(dom.btn1, 'ArrowDown')
		expect(scrollSpy).not.toHaveBeenCalled()
	})
})

// ─── Click events ─────────────────────────────────────────────────────────────

describe('click', () => {
	it('plain click calls select with path', () => {
		click(dom.btn1)
		expect(wrapper.lastCall()).toEqual({ action: 'select', path: '1' })
	})

	it('Ctrl+click calls extend', () => {
		click(dom.btn1, { ctrlKey: true })
		expect(wrapper.lastCall()).toEqual({ action: 'extend', path: '1' })
	})

	it('Meta+click calls extend', () => {
		click(dom.btn1, { metaKey: true })
		expect(wrapper.lastCall()).toEqual({ action: 'extend', path: '1' })
	})

	it('Shift+click calls range', () => {
		click(dom.btn1, { shiftKey: true })
		expect(wrapper.lastCall()).toEqual({ action: 'range', path: '1' })
	})

	it('click on accordion-trigger calls toggle', () => {
		click(dom.group)
		expect(wrapper.lastCall()).toEqual({ action: 'toggle', path: '0' })
	})

	it('click on link calls select', () => {
		click(dom.link1)
		expect(wrapper.lastCall()).toEqual({ action: 'select', path: '0-0' })
	})

	it('click on element with no data-path is ignored', () => {
		click(dom.root)
		expect(wrapper.calls).toHaveLength(0)
	})

	it('does NOT call scrollIntoView', () => {
		click(dom.btn1)
		expect(scrollSpy).not.toHaveBeenCalled()
	})

	it('resolves path from nested child inside data-path element', () => {
		// Span inside a button that has data-path — click on span bubbles up
		const span = document.createElement('span')
		span.textContent = 'label'
		dom.btn1.appendChild(span)
		click(span)
		expect(wrapper.lastCall()).toEqual({ action: 'select', path: '1' })
	})
})

// ─── focusin ──────────────────────────────────────────────────────────────────

describe('focusin', () => {
	it('focusin on an item calls moveTo with its path', () => {
		dom.btn1.focus() // fires real focusin
		expect(wrapper.lastCall()).toEqual({ action: 'moveTo', path: '1' })
	})

	it('focusin on a link calls moveTo with its path', () => {
		dom.link1.focus()
		expect(wrapper.lastCall()).toEqual({ action: 'moveTo', path: '0-0' })
	})

	it('focusin on container with no focusedKey focuses first data-path item', () => {
		const focusSpy = vi.spyOn(dom.group, 'focus')
		wrapper.focusedKey = null
		focusin(dom.root)
		expect(focusSpy).toHaveBeenCalled()
	})

	it('focusin on container with focusedKey focuses that item', () => {
		const focusSpy = vi.spyOn(dom.btn1, 'focus')
		wrapper.focusedKey = '1'
		focusin(dom.root)
		expect(focusSpy).toHaveBeenCalled()
	})

	it('does NOT call scrollIntoView', () => {
		dom.btn1.focus()
		expect(scrollSpy).not.toHaveBeenCalled()
	})
})

// ─── focusout ─────────────────────────────────────────────────────────────────

describe('focusout', () => {
	it('calls blur when focus moves outside the list', () => {
		const outsideEl = document.createElement('button')
		document.body.appendChild(outsideEl)
		focusout(dom.btn1, outsideEl)
		expect(wrapper.lastCall()).toEqual({ action: 'blur', path: null })
		outsideEl.remove()
	})

	it('calls blur when relatedTarget is null (focus left page)', () => {
		focusout(dom.btn1, null)
		expect(wrapper.lastCall()).toEqual({ action: 'blur', path: null })
	})

	it('does NOT call blur when focus moves to another item in the list', () => {
		focusout(dom.btn1, dom.btn2)
		expect(wrapper.calls.find((c) => c.action === 'blur')).toBeUndefined()
	})
})

// ─── Typeahead ────────────────────────────────────────────────────────────────

describe('typeahead', () => {
	it('single printable char calls findByText with that char', () => {
		dom.btn1.focus()
		wrapper.reset()
		keydown(dom.btn1, 'l')
		expect(wrapper.calls[0]).toEqual({ action: 'findByText', path: null })
	})

	it('calls moveTo when findByText returns a match', () => {
		wrapper.findByTextResult = '0-0'
		dom.btn1.focus()
		wrapper.reset()
		keydown(dom.btn1, 'l')
		expect(wrapper.calls.map((c) => c.action)).toContain('moveTo')
		const moveTo = wrapper.calls.find((c) => c.action === 'moveTo')
		expect(moveTo.path).toBe('0-0')
	})

	it('does NOT call moveTo when findByText returns null', () => {
		wrapper.findByTextResult = null
		dom.btn1.focus()
		wrapper.reset()
		keydown(dom.btn1, 'z')
		expect(wrapper.calls.find((c) => c.action === 'moveTo')).toBeUndefined()
	})

	it('accumulates chars into buffer across successive keypresses', () => {
		const calls = []
		wrapper.findByText = (query) => { calls.push(query); return null }
		dom.btn1.focus()
		wrapper.reset() // reset after focusin
		keydown(dom.btn1, 'l')
		keydown(dom.btn1, 'i')
		expect(calls).toEqual(['l', 'li'])
	})

	it('resets buffer after timeout so next char starts fresh', () => {
		vi.useFakeTimers()
		const calls = []
		wrapper.findByText = (query) => { calls.push(query); return null }
		dom.btn1.focus()
		wrapper.reset() // reset after focusin
		keydown(dom.btn1, 'l')
		vi.advanceTimersByTime(600) // past the 500ms reset
		keydown(dom.btn1, 'i')
		expect(calls).toEqual(['l', 'i']) // 'i' started fresh, not 'li'
		vi.useRealTimers()
	})

	it('Space is NOT treated as typeahead (it is a keymap action)', () => {
		wrapper.findByTextResult = '1'
		dom.btn1.focus()
		wrapper.reset()
		keydown(dom.btn1, ' ')
		expect(wrapper.calls.find((c) => c.action === 'findByText')).toBeUndefined()
		expect(wrapper.lastCall().action).toBe('select')
	})

	it('Ctrl+letter is NOT typeahead (modifier key)', () => {
		dom.btn1.focus()
		wrapper.reset()
		keydown(dom.btn1, 's', { ctrlKey: true })
		expect(wrapper.calls.find((c) => c.action === 'findByText')).toBeUndefined()
	})

	it('calls scrollIntoView after a typeahead match', () => {
		wrapper.findByTextResult = '0-0'
		wrapper.focusedKey = '0-0'
		dom.btn1.focus()
		keydown(dom.btn1, 'l')
		expect(scrollSpy).toHaveBeenCalled()
	})
})

// ─── Navigator lifecycle ──────────────────────────────────────────────────────

describe('destroy', () => {
	it('stops handling events after destroy', () => {
		nav.destroy()
		wrapper.reset()
		dom.btn1.focus()
		keydown(dom.btn1, 'ArrowDown')
		click(dom.btn1)
		expect(wrapper.calls).toHaveLength(0)
	})
})

// ─── navigator() Svelte action adapter ───────────────────────────────────────

describe('navigator() Svelte action adapter', () => {
	it('returns an object with a destroy method', () => {
		const result = navigator(dom.root, { wrapper })
		expect(result).toHaveProperty('destroy')
		expect(typeof result.destroy).toBe('function')
		result.destroy()
	})

	it('wires events so keydown dispatches to wrapper', () => {
		nav.destroy() // remove existing Navigator from root
		const result = navigator(dom.root, { wrapper })
		wrapper.reset()
		dom.btn1.focus()
		keydown(dom.btn1, 'ArrowDown')
		expect(wrapper.lastCall()).toEqual({ action: 'next', path: '1' })
		result.destroy()
	})

	it('destroy() removes event listeners', () => {
		nav.destroy()
		const result = navigator(dom.root, { wrapper })
		result.destroy()
		wrapper.reset()
		dom.btn1.focus()
		keydown(dom.btn1, 'ArrowDown')
		expect(wrapper.calls).toHaveLength(0)
	})

	it('passes orientation and collapsible options through', () => {
		nav.destroy()
		const result = navigator(dom.root, {
			wrapper,
			orientation: 'horizontal',
			dir: 'ltr',
			collapsible: true
		})
		wrapper.reset()
		dom.btn1.focus()
		// horizontal ltr: ArrowRight = next
		keydown(dom.btn1, 'ArrowRight')
		expect(wrapper.lastCall()).toEqual({ action: 'next', path: '1' })
		result.destroy()
	})
})
