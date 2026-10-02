/* Follow-up chips come from the catalogue data of whatever is on screen — its variants, its
 * prop schema, the views its data can take, and its docs — so no chip is hand-written per
 * demo, and every chip is an intent, never text to be matched again.
 */
import { describe, it, expect } from 'vitest'
import { chipsFor } from '../../../src/lib/chat-demo/intent/chips'

const intents = (items: ReturnType<typeof chipsFor>) =>
	items.map((c) => (c.action?.kind === 'intent' ? c.action.interpretation : null))

describe('chipsFor', () => {
	it('offers the screen demo’s other variants', () => {
		const chips = intents(chipsFor({ demo: 'tabs', variant: 'vertical', props: { orientation: 'vertical' } }))
		expect(chips).toContainEqual(expect.objectContaining({ intent: 'modify', variant: 'with-icons' }))
		expect(chips).not.toContainEqual(expect.objectContaining({ variant: 'vertical' }))
	})

	it('offers to flip a boolean prop', () => {
		const chips = intents(chipsFor({ demo: 'table', props: { striped: true } }))
		expect(chips).toContainEqual(expect.objectContaining({ intent: 'modify', props: { striped: false } }))
	})

	it('offers the other values of an enum prop', () => {
		const chips = intents(chipsFor({ demo: 'tree', props: { lineStyle: 'solid' } }))
		expect(chips).toContainEqual(expect.objectContaining({ props: { lineStyle: 'dashed' } }))
		expect(chips).not.toContainEqual(expect.objectContaining({ props: { lineStyle: 'solid' } }))
	})

	it('offers other views of data, but not the view on screen', () => {
		const chips = intents(chipsFor({ demo: 'table', props: {}, data: [{ a: 'x', b: 1 }] }))
		expect(chips).toContainEqual(expect.objectContaining({ intent: 'reshape', view: 'chart' }))
		expect(chips).not.toContainEqual(expect.objectContaining({ intent: 'reshape', view: 'table' }))
	})

	it('offers no reshape for a demo without data', () => {
		expect(intents(chipsFor({ demo: 'tabs', props: {} }))).not.toContainEqual(expect.objectContaining({ intent: 'reshape' }))
	})

	it('always offers to explain, and stays short', () => {
		const chips = chipsFor({ demo: 'tabs', props: {} })
		expect(intents(chips)).toContainEqual(expect.objectContaining({ intent: 'explain', demo: 'tabs' }))
		expect(chips.length).toBeLessThanOrEqual(8)
	})
})
