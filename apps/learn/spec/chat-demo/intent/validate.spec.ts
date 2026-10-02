/* An interpreter — local search, System One, an LLM — only proposes. `validate` makes the
 * proposal safe to act on: every demo, variant and prop is checked against the catalogue,
 * and anything that does not survive becomes a question back to the user, never a guess.
 */
import { describe, it, expect } from 'vitest'
import { validate, CLARIFY_BELOW } from '../../../src/lib/chat-demo/intent/validate'
import type { Interpretation, Screen } from '../../../src/lib/chat-demo/intent/types'

const sure = (i: Omit<Interpretation, 'confidence'>): Interpretation => ({ confidence: 1, ...i })
const table: Screen = { demo: 'table', props: {} }

describe('validate — demos and variants', () => {
	it('keeps a show of a real demo', () => {
		expect(validate(sure({ intent: 'show', demo: 'tabs' }), null)).toMatchObject({ intent: 'show', demo: 'tabs' })
	})

	it('turns a show of an unknown demo into a question', () => {
		expect(validate(sure({ intent: 'show', demo: 'spaceship' }), null).intent).toBe('clarify')
	})

	it('drops a variant the demo does not have, and keeps one it does', () => {
		expect(validate(sure({ intent: 'show', demo: 'tabs', variant: 'nope' }), null).variant).toBeUndefined()
		expect(validate(sure({ intent: 'show', demo: 'tabs', variant: 'vertical' }), null).variant).toBe('vertical')
	})

	it('knows the chart kinds as variants of the chart demo', () => {
		expect(validate(sure({ intent: 'show', demo: 'chart', variant: 'pie' }), null).variant).toBe('pie')
	})
})

describe('validate — props against the demo’s schema', () => {
	it('keeps an enum value the schema lists and drops one it does not', () => {
		const ok = validate(sure({ intent: 'modify', props: { orientation: 'vertical' } }), { demo: 'tabs', props: {} })
		expect(ok.props).toEqual({ orientation: 'vertical' })
		const bad = validate(sure({ intent: 'modify', props: { orientation: 'diagonal', align: 'end' } }), { demo: 'tabs', props: {} })
		expect(bad.props).toEqual({ align: 'end' })
	})

	it('drops props the schema does not declare', () => {
		const v = validate(sure({ intent: 'modify', props: { striped: true, onclick: 'alert(1)' } }), table)
		expect(v.props).toEqual({ striped: true })
	})

	it('reads a boolean from the words a model might use', () => {
		expect(validate(sure({ intent: 'modify', props: { striped: 'true' } }), table).props).toEqual({ striped: true })
		expect(validate(sure({ intent: 'modify', props: { striped: 'no' } }), table).props).toEqual({ striped: false })
	})
})

describe('validate — what each intent needs', () => {
	it('modifies the demo on screen when no demo is named', () => {
		expect(validate(sure({ intent: 'modify', props: { striped: true } }), table).demo).toBe('table')
	})

	it('asks back when asked to modify with nothing on screen', () => {
		expect(validate(sure({ intent: 'modify', props: { striped: true } }), null).intent).toBe('clarify')
	})

	it('asks back when a modify changes nothing', () => {
		expect(validate(sure({ intent: 'modify', props: { bogus: 1 } }), table).intent).toBe('clarify')
	})

	it('reshapes only into a known view, and only something with data', () => {
		expect(validate(sure({ intent: 'reshape', view: 'chart' }), table).intent).toBe('reshape')
		expect(validate(sure({ intent: 'reshape', view: 'hologram' as never }), table).intent).toBe('clarify')
		expect(validate(sure({ intent: 'reshape', view: 'chart' }), { demo: 'tabs', props: {} }).intent).toBe('clarify')
	})

	it('explains the demo on screen when none is named', () => {
		expect(validate(sure({ intent: 'explain', topic: 'sorting' }), table)).toMatchObject({ intent: 'explain', demo: 'table' })
	})
})

describe('validate — confidence', () => {
	it('asks back below the threshold, offering the low-confidence reading as an option', () => {
		const v = validate({ intent: 'show', demo: 'tree', confidence: CLARIFY_BELOW - 0.1 }, null)
		expect(v.intent).toBe('clarify')
		expect(v.options?.map((o) => o.demo)).toContain('tree')
	})

	it('keeps clarify options that validate, at most four', () => {
		const options = ['tree', 'list', 'nope', 'table', 'tabs', 'chart'].map((demo) => sure({ intent: 'show', demo }))
		const v = validate(sure({ intent: 'clarify', options }), null)
		expect(v.options?.map((o) => o.demo)).toEqual(['tree', 'list', 'table', 'tabs'])
	})
})
