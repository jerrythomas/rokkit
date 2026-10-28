import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import base from '../dist/base.css?raw'
import zenSumi from '../dist/zen-sumi.css?raw'

/**
 * zen-sumi's List takes the guides rail's look, so any zen-sumi List — the learn site's guides
 * rail and a downstream app's sidebar alike — renders it without app CSS:
 *
 * - a group heading is a mono micro-label: 10px, weight 500, 1.2px (0.12em) tracking,
 *   uppercase, ink-mute, set off by a 14px / 8px / 6px margin;
 * - an item reads as body text: the UI face at 13px, weight 400, ink, padded 6px 8px;
 * - the active item is an ink fill with paper text.
 *
 * Runs over the BUILT css (dist/), the file consumers load. The tokens are given sentinel values
 * so a computed colour or face proves which token the rule read.
 */
const PREFLIGHT = '*,::before,::after{box-sizing:border-box;border:0 solid}'
const TOKENS = `:root{
	--ink: rgb(10, 20, 30);
	--ink-mute: rgb(40, 50, 60);
	--paper: rgb(250, 240, 230);
	--paper-soft: rgb(245, 235, 225);
	--paper-mute: rgb(235, 225, 215);
	--paper-edge: rgb(200, 190, 180);
	--primary: rgb(200, 80, 40);
	--font-mono: TestMono;
	--font-ui: TestUi;
}`

const sheet = document.createElement('style')

beforeAll(() => {
	sheet.textContent = `${PREFLIGHT}\n${TOKENS}\n${base}\n${zenSumi}`
	document.head.appendChild(sheet)
	const still = document.createElement('style')
	still.textContent = '*{transition:none!important}'
	document.head.appendChild(still)
})

afterEach(() => {
	document.body.replaceChildren()
})

/** The List component's markup for a non-collapsible group with two links, the first active. */
function mount() {
	document.body.dataset.style = 'zen-sumi'
	const nav = document.createElement('nav')
	nav.setAttribute('data-list', '')
	nav.setAttribute('data-size', 'md')
	const group = document.createElement('button')
	group.type = 'button'
	group.setAttribute('data-list-group', '')
	group.setAttribute('data-disabled', 'true')
	group.textContent = 'basics'
	const link = (text: string, active: boolean) => {
		const a = document.createElement('a')
		a.href = '#'
		a.setAttribute('data-list-item', '')
		if (active) a.setAttribute('data-active', 'true')
		a.textContent = text
		return a
	}
	const active = link('Getting Started', true)
	const item = link('Data Binding', false)
	nav.append(group, active, item)
	document.body.replaceChildren(nav)
	return { group, active, item }
}

describe('zen-sumi List', () => {
	it('renders a group heading as a mono micro-label', () => {
		const style = getComputedStyle(mount().group)
		expect(style.fontFamily).toBe('TestMono')
		expect(style.fontSize).toBe('10px')
		expect(style.fontWeight).toBe('500')
		expect(style.letterSpacing).toBe('1.2px')
		expect(style.textTransform).toBe('uppercase')
		expect(style.color).toBe('rgb(40, 50, 60)')
		expect([style.marginTop, style.marginRight, style.marginBottom, style.marginLeft]).toEqual([
			'14px',
			'8px',
			'6px',
			'8px'
		])
		expect([style.paddingTop, style.paddingLeft]).toEqual(['0px', '0px'])
	})

	it('renders an item as 13px ink body text', () => {
		const style = getComputedStyle(mount().item)
		expect(style.fontFamily).toBe('TestUi')
		expect(style.fontSize).toBe('13px')
		expect(style.fontWeight).toBe('400')
		expect(style.color).toBe('rgb(10, 20, 30)')
		expect([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]).toEqual([
			'6px',
			'8px',
			'6px',
			'8px'
		])
	})

	it('renders the active item as an ink fill with paper text', () => {
		const style = getComputedStyle(mount().active)
		expect(style.backgroundColor).toBe('rgb(10, 20, 30)')
		expect(style.color).toBe('rgb(250, 240, 230)')
	})
})
