import { describe, it, expect, beforeEach, vi } from 'vitest'
import { focusItem, scrollWithin, entryItem } from '../../src/navigator/focus.js'

let root
beforeEach(() => {
	document.body.innerHTML = `
		<div id="root">
			<div data-path="0" tabindex="-1" id="a">A</div>
			<div data-path="1" tabindex="-1" id="b">B</div>
		</div>`
	root = document.getElementById('root')
})
const $ = (id) => document.getElementById(id)

/** Give an element the geometry JSDOM does not compute. */
function geometry(el, props) {
	for (const [key, value] of Object.entries(props)) {
		Object.defineProperty(el, key, { value, writable: true, configurable: true })
	}
}

describe('scrollWithin', () => {
	it('snaps scrollTop to an item above the visible window', () => {
		geometry(root, { scrollTop: 100, clientHeight: 200 })
		geometry($('a'), { offsetTop: 10, offsetHeight: 30 })
		scrollWithin(root, $('a'))
		expect(root.scrollTop).toBe(10)
	})

	it('brings an item below the window up to its bottom edge', () => {
		geometry(root, { scrollTop: 0, clientHeight: 200 })
		geometry($('b'), { offsetTop: 500, offsetHeight: 50 })
		scrollWithin(root, $('b'))
		expect(root.scrollTop).toBe(350)
	})

	it('leaves a visible item where it is, including one flush with either edge', () => {
		geometry(root, { scrollTop: 100, clientHeight: 200 })
		geometry($('a'), { offsetTop: 100, offsetHeight: 200 })
		scrollWithin(root, $('a'))
		expect(root.scrollTop).toBe(100)
	})
})

describe('focusItem', () => {
	it('focuses the item at the key without scrolling ancestors, then scrolls within the root', () => {
		const focus = vi.spyOn($('b'), 'focus')
		geometry(root, { scrollTop: 0, clientHeight: 20 })
		geometry($('b'), { offsetTop: 40, offsetHeight: 10 })
		focusItem(root, '1')
		expect(focus).toHaveBeenCalledWith({ preventScroll: true })
		expect(document.activeElement).toBe($('b'))
		expect(root.scrollTop).toBe(30)
	})

	it('does not re-focus an item that already has focus, but still scrolls it into view', () => {
		$('a').focus()
		const focus = vi.spyOn($('a'), 'focus')
		geometry(root, { scrollTop: 50, clientHeight: 20 })
		geometry($('a'), { offsetTop: 0, offsetHeight: 10 })
		focusItem(root, '0')
		expect(focus).not.toHaveBeenCalled()
		expect(root.scrollTop).toBe(0)
	})

	it('does nothing without a key or without an item for it', () => {
		const before = document.activeElement
		focusItem(root, null)
		focusItem(root, '')
		focusItem(root, '7')
		expect(document.activeElement).toBe(before)
	})

	it('finds only items inside the root', () => {
		document.body.insertAdjacentHTML('beforeend', '<div data-path="2" tabindex="-1" id="out"></div>')
		focusItem(root, '2')
		expect(document.activeElement).not.toBe($('out'))
	})
})

describe('entryItem', () => {
	it('is the item at the focused key', () => {
		expect(entryItem(root, '1')).toBe($('b'))
	})
	it('is the first enabled item when there is no key', () => {
		document.body.innerHTML = `<div id="r"><button data-path="0" disabled></button><div data-path="1" id="first"></div></div>`
		expect(entryItem(document.getElementById('r'), null)).toBe(document.getElementById('first'))
	})
	it('is null when the key has no item', () => {
		expect(entryItem(root, '9')).toBeNull()
	})
})
