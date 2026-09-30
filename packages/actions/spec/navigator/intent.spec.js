import { describe, it, expect, beforeEach } from 'vitest'
import { keyAction, clickIntent, focusLeft } from '../../src/navigator/intent.js'
import { buildKeymap } from '../../src/keymap.js'

let root
beforeEach(() => {
	document.body.innerHTML = `
		<div id="root">
			<div data-path="0" tabindex="-1" id="item"><span id="label">One</span></div>
			<a data-path="1" href="/x" id="link">Two</a>
			<div data-path="2" tabindex="-1" data-disabled id="disabled"><span id="disabled-label">x</span></div>
			<div data-path="3" id="with-switch"><span role="switch" id="switch">s</span></div>
			<div id="no-path"><span id="orphan">o</span></div>
		</div>
		<button id="outside">b</button>`
	root = document.getElementById('root')
})
const $ = (id) => document.getElementById(id)
const keymap = buildKeymap()
const key = (k, target, opts = {}) => ({ key: k, target, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...opts })

describe('keyAction', () => {
	it('is the keymap action for the key', () => {
		expect(keyAction(key('ArrowDown', $('item')), root, keymap, $('item'))).toBe('next')
		expect(keyAction(key('Enter', $('item')), root, keymap, $('item'))).toBe('select')
	})
	it('is null for an unmapped key', () => {
		expect(keyAction(key('F7', $('item')), root, keymap, $('item'))).toBeNull()
	})
	it('leaves select on a link to the browser, but still moves from one', () => {
		expect(keyAction(key('Enter', $('link')), root, keymap, $('link'))).toBeNull()
		expect(keyAction(key('ArrowDown', $('link')), root, keymap, $('link'))).toBe('next')
	})
	it('is null while a disabled item has focus', () => {
		expect(keyAction(key('ArrowDown', $('disabled')), root, keymap, $('disabled'))).toBeNull()
	})
})

const click = (target, opts = {}) => ({ target, shiftKey: false, ctrlKey: false, metaKey: false, ...opts })

describe('clickIntent', () => {
	it('is the action and the item path; a plain item swallows the default', () => {
		expect(clickIntent(click($('label')), root)).toEqual({ action: 'select', path: '0', native: false })
		expect(clickIntent(click($('label'), { shiftKey: true }), root)).toEqual({ action: 'range', path: '0', native: false })
	})
	it('marks a link click native so the browser still navigates', () => {
		expect(clickIntent(click($('link')), root)).toEqual({ action: 'select', path: '1', native: true })
	})
	it('is null off any item, on a disabled item, and on a nested control', () => {
		expect(clickIntent(click($('orphan')), root)).toBeNull()
		expect(clickIntent(click($('disabled-label')), root)).toBeNull()
		expect(clickIntent(click($('switch')), root)).toBeNull()
	})
})

describe('focusLeft', () => {
	it('is true when focus goes nowhere or outside the root, false within it', () => {
		expect(focusLeft(root, null)).toBe(true)
		expect(focusLeft(root, $('outside'))).toBe(true)
		expect(focusLeft(root, $('item'))).toBe(false)
		expect(focusLeft(root, root)).toBe(false)
	})
})
