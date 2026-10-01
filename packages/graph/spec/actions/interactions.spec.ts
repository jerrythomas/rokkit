/* The `interactions` action: one delegated listener reads the intent off the element that was
 * pressed and hands it to `act`. Exercised on bare DOM — no component, no layout.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { interactions } from '../../src/actions/interactions.js'

let root: HTMLElement
let act: ReturnType<typeof vi.fn>
let handle: { update: (p: never) => void; destroy: () => void }

beforeEach(() => {
	root = document.createElement('div')
	root.innerHTML = `
		<button data-graph-press="select" data-graph-open="drill" data-graph-key="list"><span data-inner>List</span></button>
		<div data-graph-press="select" data-graph-open="group" data-graph-key="card" role="button" tabindex="0">
			<span data-graph-press="expand" data-graph-key="card" role="button" tabindex="0" data-more>+2</span>
		</div>
		<div data-region>scenery</div>
		<button data-graph-press="bogus" data-graph-key="x">?</button>
	`
	document.body.append(root)
	act = vi.fn()
	handle = interactions(root, { state: { act }, clearOnBackground: true }) as never
})
afterEach(() => {
	handle.destroy()
	root.remove()
})

const $ = (sel: string) => root.querySelector<HTMLElement>(sel)!
const key = (el: HTMLElement, k: string) =>
	el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

describe('interactions', () => {
	it('acts on the press intent of the element clicked, from anywhere inside it', () => {
		$('[data-inner]').click()
		expect(act).toHaveBeenCalledWith('select', 'list')
	})

	it('takes the innermost intent — a control inside a card is its own', () => {
		$('[data-more]').click()
		expect(act).toHaveBeenCalledTimes(1)
		expect(act).toHaveBeenCalledWith('expand', 'card')
	})

	it('acts on the open intent on a double-click', () => {
		$('[data-inner]').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
		expect(act).toHaveBeenCalledWith('drill', 'list')
	})

	it('clears on a click that lands on nothing interactive', () => {
		$('[data-region]').click()
		expect(act).toHaveBeenCalledWith('clear', null)
	})

	it('leaves the background alone where it is not asked to clear', () => {
		handle.update({ state: { act }, clearOnBackground: false } as never)
		$('[data-region]').click()
		expect(act).not.toHaveBeenCalled()
	})

	it('presses a non-button control with Enter or Space, and stops the page scrolling', () => {
		const more = $('[data-more]')
		const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		more.dispatchEvent(enter)
		expect(act).toHaveBeenLastCalledWith('expand', 'card')
		expect(enter.defaultPrevented).toBe(true)
		key(more, ' ')
		expect(act).toHaveBeenCalledTimes(2)
	})

	it('leaves Enter on a real button to the browser, which clicks it', () => {
		key($('button'), 'Enter')
		expect(act).not.toHaveBeenCalled()
	})

	it('clears on Escape', () => {
		key($('[data-region]'), 'Escape')
		expect(act).toHaveBeenCalledWith('clear', null)
	})

	it('ignores an intent outside the vocabulary, and other keys', () => {
		$('[data-graph-press="bogus"]').click()
		key($('[data-more]'), 'a')
		expect(act).not.toHaveBeenCalled()
	})

	it('stops listening once destroyed', () => {
		handle.destroy()
		$('[data-inner]').click()
		expect(act).not.toHaveBeenCalled()
	})
})
