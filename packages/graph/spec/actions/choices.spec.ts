/* The `choices` action: a control reports what was chosen — a button's `data-graph-choice`,
 * or a select's value — and nothing else. Exercised on bare DOM.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { choices } from '../../src/actions/choices.js'

let root: HTMLElement
let onchoose: ReturnType<typeof vi.fn>
let handle: { update: (p: never) => void; destroy: () => void }

/** An element with attributes and children — fixtures built with DOM methods, not markup. */
function el(tag: string, attrs: Record<string, string> = {}, ...children: (Node | string)[]) {
	const node = document.createElement(tag)
	for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
	node.append(...children)
	return node
}

beforeEach(() => {
	root = el(
		'div',
		{},
		el('button', { 'data-graph-choice': 'keys' }, el('span', { 'data-inner': '' }, 'Keys')),
		el('button', { 'data-graph-choice': 'in', disabled: '' }, '+'),
		el('span', { 'data-plain': '' }, 'label'),
		el('select', {}, el('option', { value: '' }, 'none'), el('option', { value: 'loc' }, 'loc'))
	)
	document.body.append(root)
	onchoose = vi.fn()
	handle = choices(root, { onchoose }) as never
})
afterEach(() => {
	handle.destroy()
	root.remove()
})

const $ = (sel: string) => root.querySelector<HTMLElement>(sel)!

describe('choices', () => {
	it('reports the choice of the button pressed, from anywhere inside it', () => {
		$('[data-inner]').click()
		expect(onchoose).toHaveBeenCalledWith('keys')
	})

	it('reports nothing for a disabled choice, or a click on anything else', () => {
		$('[disabled]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
		$('[data-plain]').click()
		expect(onchoose).not.toHaveBeenCalled()
	})

	it('reports a select’s new value', () => {
		const select = root.querySelector('select')!
		select.value = 'loc'
		select.dispatchEvent(new Event('change', { bubbles: true }))
		expect(onchoose).toHaveBeenCalledWith('loc')
	})

	it('reports to the latest handler, and to none once destroyed', () => {
		const next = vi.fn()
		handle.update({ onchoose: next } as never)
		$('[data-inner]').click()
		expect(next).toHaveBeenCalledWith('keys')
		handle.destroy()
		$('[data-inner]').click()
		expect(next).toHaveBeenCalledTimes(1)
	})
})
