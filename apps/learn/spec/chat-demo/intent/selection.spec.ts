/* What the user clicks in a component feeds the conversation: a selected row or item becomes
 * part of the screen, offers its own follow-ups, and can be referred to ("edit this row").
 */
import { describe, it, expect } from 'vitest'
import { selectionChips } from '../../../src/lib/chat-demo/intent/chips'
import { interpretLocally } from '../../../src/lib/chat-demo/intent/local'
import { validate } from '../../../src/lib/chat-demo/intent/validate'
import { act } from '../../../src/lib/chat-demo/intent/act'
import type { Interpretation, Screen } from '../../../src/lib/chat-demo/intent/types'
import type { DemoBlock } from '../../../src/lib/chat-demo/types'
import { PRODUCTS, SETTINGS_MENU_ITEMS } from '../../../src/lib/chat-demo/intent/samples'

const intents = (chips: ReturnType<typeof selectionChips>) =>
	chips.map((c) => (c.action?.kind === 'intent' ? c.action.interpretation : null))
const laptop = PRODUCTS[0]
const table: Screen = { demo: 'table', props: {}, data: PRODUCTS, selected: laptop }

describe('selectionChips', () => {
	it('offers to edit a selected row, named by its label', () => {
		const [edit] = selectionChips(table)
		expect(edit.label).toBe('Edit “Laptop”')
		expect(intents([edit])[0]).toMatchObject({ intent: 'reshape', view: 'form', data: laptop })
	})

	it('offers to open a selected group’s children', () => {
		const general = SETTINGS_MENU_ITEMS[0]
		const chips = selectionChips({ demo: 'list', props: {}, data: SETTINGS_MENU_ITEMS, selected: general })
		expect(chips[0].label).toBe(`Open “${general.label}”`)
		expect(intents(chips)[0]).toMatchObject({ intent: 'reshape', view: 'list', data: general.children })
	})

	it('offers nothing when nothing is selected', () => {
		expect(selectionChips({ ...table, selected: undefined })).toEqual([])
	})
})

describe('a selection in the conversation', () => {
	it('is what "edit this row" means', () => {
		expect(validate(interpretLocally('edit this row', table), table)).toMatchObject({
			intent: 'reshape',
			view: 'form',
			data: laptop
		})
	})

	it('reshapes just the selection, leaving the rest of the data alone', () => {
		const reading: Interpretation = { intent: 'reshape', view: 'form', data: laptop, confidence: 1 }
		const blocks = act(validate(reading, table), table)
		const form = blocks.find((b): b is DemoBlock => b.kind === 'demo')
		expect(form).toMatchObject({ demo: 'form', data: laptop })
	})

	it('without a selection, "edit this row" is not guessed at', () => {
		expect(validate(interpretLocally('edit this row', { ...table, selected: undefined }), table).intent).not.toBe('reshape')
	})
})
