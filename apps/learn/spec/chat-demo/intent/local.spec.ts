/* The local interpreter — simulated mode, and the fallback for every other mode. It reads a
 * message against what is on screen: generic cue words pick the intent, the catalogue search
 * picks the demo, and the screen demo's own prop schema and variants pick the change. Nothing
 * here is written per demo.
 */
import { describe, it, expect } from 'vitest'
import { interpretLocally } from '../../../src/lib/chat-demo/intent/local'
import { validate } from '../../../src/lib/chat-demo/intent/validate'
import type { Screen } from '../../../src/lib/chat-demo/intent/types'
import { PRODUCTS } from '../../../src/lib/chat-demo/intent/samples'

/** What the chat would act on: the interpreter's reading, validated. */
const read = (message: string, screen: Screen | null = null) => validate(interpretLocally(message, screen), screen)

const table: Screen = { demo: 'table', props: {}, data: PRODUCTS }
const tabs: Screen = { demo: 'tabs', props: {} }
const chart: Screen = { demo: 'chart', variant: 'bar', props: { x: 'name', y: 'price' }, data: PRODUCTS }

describe('show — the catalogue search picks the demo', () => {
	it.each([
		['show me a sortable table', 'table'],
		['something with nested folders', 'tree'],
		['pick a date', 'date-picker'],
		['dark mode only section', 'lock-mode']
	])('%s → %s', (message, demo) => {
		expect(read(message)).toMatchObject({ intent: 'show', demo })
	})

	it('shows a chart kind by name', () => {
		expect(read('show me a pie chart')).toMatchObject({ intent: 'show', demo: 'chart', variant: 'pie' })
	})

	it('switches to another demo even while one is on screen', () => {
		expect(read('now show me tabs', table)).toMatchObject({ intent: 'show', demo: 'tabs' })
	})
})

describe('modify — the screen demo’s schema picks the change', () => {
	it('turns a boolean prop on, and off', () => {
		expect(read('make the rows striped', table)).toMatchObject({ intent: 'modify', demo: 'table', props: { striped: true } })
		expect(read('remove the stripes', table)).toMatchObject({ intent: 'modify', props: { striped: false } })
	})

	it('sets an enum prop from one of its options', () => {
		expect(read('make it vertical', tabs)).toMatchObject({ intent: 'modify', props: { orientation: 'vertical' } })
	})

	it('switches to a variant named by its label', () => {
		expect(read('with icons please', tabs)).toMatchObject({ intent: 'modify', variant: 'with-icons' })
	})

	it('switches a chart’s kind while keeping its data', () => {
		expect(read('as a pie', chart)).toMatchObject({ intent: 'modify', variant: 'pie' })
	})
})

describe('reshape — the data on screen in another view', () => {
	it('shows the same data as a chart', () => {
		expect(read('show the same data as a bar chart', table)).toMatchObject({ intent: 'reshape', view: 'chart' })
	})

	it('shows a chart’s data as a table', () => {
		expect(read('show that as a table', chart)).toMatchObject({ intent: 'reshape', view: 'table' })
	})
})

describe('explain — answered from the docs', () => {
	it('explains the demo on screen', () => {
		expect(read('how do I sort the columns?', table)).toMatchObject({ intent: 'explain', demo: 'table' })
	})

	it('explains a demo it names', () => {
		expect(read('how does the tree work?', table)).toMatchObject({ intent: 'explain', demo: 'tree' })
	})

	it('carries the question as the topic', () => {
		expect(read('how do I sort the columns?', table).topic).toMatch(/sort/)
	})
})

describe('clarify — asks rather than guesses', () => {
	it('asks back on a message it cannot place', () => {
		expect(read('hmm').intent).toBe('clarify')
	})

	it('offers the close candidates when two demos tie', () => {
		const v = read('choose several options')
		expect(v.intent).toBe('clarify')
		expect(v.options?.map((o) => o.demo)).toEqual(expect.arrayContaining(['select', 'multi-select']))
	})
})
