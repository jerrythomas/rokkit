/* `act` runs a validated intent: it returns the reply's blocks, and the reply's `demo` block
 * IS the next screen — `screenFrom` reads it back, so a resumed conversation knows what is
 * showing without storing anything extra.
 */
import { describe, it, expect } from 'vitest'
import { act } from '../../../src/lib/chat-demo/intent/act'
import { screenFrom } from '../../../src/lib/chat-demo/intent/screen'
import type { Interpretation, Screen } from '../../../src/lib/chat-demo/intent/types'
import type { Block, ChatTurn, DemoBlock, SuggestionsBlock } from '../../../src/lib/chat-demo/types'

const sure = (i: Omit<Interpretation, 'confidence'>): Interpretation => ({ confidence: 1, ...i })
const demoOf = (blocks: Block[]) => blocks.find((b): b is DemoBlock => b.kind === 'demo')
const chipsOf = (blocks: Block[]) => blocks.find((b): b is SuggestionsBlock => b.kind === 'suggestions')?.items ?? []
const PRODUCTS = [
	{ name: 'Laptop', price: 1299, stock: 45 },
	{ name: 'Phone', price: 899, stock: 120 }
]

describe('act — show', () => {
	it('puts the demo on screen with its sample data', () => {
		const shown = demoOf(act(sure({ intent: 'show', demo: 'table' }), null))
		expect(shown).toMatchObject({ demo: 'table' })
		expect(Array.isArray(shown?.data)).toBe(true)
	})

	it('applies the variant’s props', () => {
		expect(demoOf(act(sure({ intent: 'show', demo: 'tabs', variant: 'vertical' }), null))).toMatchObject({
			demo: 'tabs',
			variant: 'vertical',
			props: { orientation: 'vertical' }
		})
	})

	it('offers follow-ups for what it showed', () => {
		expect(chipsOf(act(sure({ intent: 'show', demo: 'table' }), null)).length).toBeGreaterThan(0)
	})
})

describe('act — modify', () => {
	it('changes the demo on screen and keeps its data', () => {
		const screen: Screen = { demo: 'table', props: {}, data: PRODUCTS }
		expect(demoOf(act(sure({ intent: 'modify', demo: 'table', props: { striped: true } }), screen))).toEqual({
			kind: 'demo',
			demo: 'table',
			props: { striped: true },
			data: PRODUCTS
		})
	})

	it('says what changed once, in words', () => {
		const [line] = act(sure({ intent: 'modify', demo: 'table', variant: 'striped', props: { striped: true } }), { demo: 'table', props: {} })
		expect(line).toEqual({ kind: 'prose', text: 'Updated — striped rows.' })
		const [off] = act(sure({ intent: 'modify', demo: 'table', props: { striped: false } }), { demo: 'table', props: {} })
		expect(off).toEqual({ kind: 'prose', text: 'Updated — striped: off.' })
	})

	it('says a variant built on the demo page is there, rather than claiming a change', () => {
		const blocks = act(sure({ intent: 'modify', demo: 'tabs', variant: 'with-icons' }), { demo: 'tabs', props: {} })
		expect(blocks[0]).toEqual({ kind: 'prose', text: '“With icons” is built on the full Tabs demo page — open it below.' })
		expect(demoOf(blocks)?.variant).toBe('with-icons')
	})

	it('merges onto the props already set', () => {
		const screen: Screen = { demo: 'tabs', props: { orientation: 'vertical' } }
		expect(demoOf(act(sure({ intent: 'modify', demo: 'tabs', props: { align: 'end' } }), screen))?.props).toEqual({
			orientation: 'vertical',
			align: 'end'
		})
	})
})

describe('act — reshape', () => {
	it('shows the data on screen as a chart — that data, not a sample', () => {
		const screen: Screen = { demo: 'table', props: {}, data: PRODUCTS }
		const chart = demoOf(act(sure({ intent: 'reshape', view: 'chart' }), screen))
		expect(chart).toMatchObject({ demo: 'chart', data: PRODUCTS })
		expect(chart?.props).toMatchObject({ x: 'name' })
	})

	it('falls back to the screen demo’s sample when it carries no data of its own', () => {
		expect(demoOf(act(sure({ intent: 'reshape', view: 'table' }), { demo: 'chart', props: {} }))?.demo).toBe('table')
	})
})

describe('act — explain and clarify', () => {
	it('answers from the demo’s own docs, and leaves the screen alone', () => {
		const blocks = act(sure({ intent: 'explain', demo: 'table', topic: 'sorting' }), { demo: 'table', props: {} })
		const md = blocks.find((b) => b.kind === 'markdown')
		expect(md && 'markdown' in md ? md.markdown : '').toMatch(/^## Sorting/)
		expect(demoOf(blocks)).toBeUndefined()
	})

	it('asks back with the options as chips that carry their intent', () => {
		const blocks = act(sure({ intent: 'clarify', options: [sure({ intent: 'show', demo: 'tree' })] }), null)
		const [chip] = chipsOf(blocks)
		expect(chip.action).toEqual({ kind: 'intent', interpretation: { intent: 'show', demo: 'tree', confidence: 1 } })
	})

	it('asks back with starting points when it has no options', () => {
		expect(chipsOf(act(sure({ intent: 'clarify' }), null)).length).toBeGreaterThan(0)
	})
})

describe('screenFrom', () => {
	const turn = (blocks: Block[]): ChatTurn => ({ id: 'a', timestamp: 0, role: 'assistant', blocks })

	it('is the last demo block in the conversation', () => {
		const first = act(sure({ intent: 'show', demo: 'table' }), null)
		const second = act(sure({ intent: 'show', demo: 'tabs' }), null)
		const explained = act(sure({ intent: 'explain', demo: 'tabs' }), null)
		expect(screenFrom([turn(first), turn(second), turn(explained)])?.demo).toBe('tabs')
	})

	it('is nothing before anything is shown', () => {
		expect(screenFrom([{ id: 'u', timestamp: 0, role: 'user', text: 'hi' }])).toBeNull()
	})
})
