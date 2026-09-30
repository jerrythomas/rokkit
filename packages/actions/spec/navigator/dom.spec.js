import { describe, it, expect, beforeEach } from 'vitest'
import { pathOf, clickAction, isNestedInteractive, isDisabledItem } from '../../src/navigator/dom.js'

let root
beforeEach(() => {
	document.body.innerHTML = `
		<div id="root">
			<div data-path="0" id="plain"><span id="label">One</span></div>
			<button data-path="1" id="button-item">Two</button>
			<div data-path="2" id="with-switch"><span role="switch" id="switch">s</span></div>
			<div data-path="3" id="with-trigger"><button data-accordion-trigger id="trigger">+</button></div>
			<div data-path="4" data-disabled id="disabled"><span id="disabled-label">x</span></div>
			<div data-path="5" aria-disabled="true" id="aria-disabled"></div>
			<div data-path="6" aria-disabled="false" id="aria-enabled"></div>
			<div id="no-path"><span id="orphan">o</span></div>
		</div>
		<div data-path="9" id="outside"><button id="outside-button">b</button></div>`
	root = document.getElementById('root')
})
const $ = (id) => document.getElementById(id)

describe('pathOf', () => {
	it('is the nearest data-path at or above the target, within the root', () => {
		expect(pathOf($('label'), root)).toBe('0')
		expect(pathOf($('button-item'), root)).toBe('1')
		expect(pathOf($('orphan'), root)).toBeNull()
		expect(pathOf(root, root)).toBeNull()
	})
})

describe('clickAction', () => {
	const click = (opts) => ({ shiftKey: false, ctrlKey: false, metaKey: false, target: $('plain'), ...opts })
	it('maps modifiers to range / extend, an accordion trigger to toggle, else select', () => {
		expect(clickAction(click({ shiftKey: true }))).toBe('range')
		expect(clickAction(click({ ctrlKey: true }))).toBe('extend')
		expect(clickAction(click({ metaKey: true }))).toBe('extend')
		expect(clickAction(click({ target: $('trigger') }))).toBe('toggle')
		expect(clickAction(click())).toBe('select')
	})
})

describe('isNestedInteractive', () => {
	it('is true for a control inside an item, not the item itself', () => {
		expect(isNestedInteractive($('switch'), root)).toBe(true)
		expect(isNestedInteractive($('button-item'), root)).toBe(false)
		expect(isNestedInteractive($('label'), root)).toBe(false)
	})
	it('lets a nested accordion trigger through — it is a Navigator hook', () => {
		expect(isNestedInteractive($('trigger'), root)).toBe(false)
	})
	it('ignores interactives outside the root', () => {
		expect(isNestedInteractive($('outside-button'), root)).toBe(false)
	})
})

describe('isDisabledItem', () => {
	it('honours data-disabled and aria-disabled="true" on the item', () => {
		expect(isDisabledItem($('disabled-label'), root)).toBe(true)
		expect(isDisabledItem($('aria-disabled'), root)).toBe(true)
		expect(isDisabledItem($('aria-enabled'), root)).toBe(false)
		expect(isDisabledItem($('label'), root)).toBe(false)
	})
	it('is false outside any item or outside the root', () => {
		expect(isDisabledItem($('orphan'), root)).toBe(false)
		expect(isDisabledItem($('outside'), root)).toBe(false)
	})
})
