/* Simulated mode end to end through the store: each turn reads what is on screen, so a
 * follow-up acts on the conversation so far — the thing the regex routes could not do (a
 * chip's text went back through the same regexes and showed the same canned reply).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { clearAll } from '../../src/lib/koan/conversations.svelte'
import { adjustScreen, conversation, isScreen, noteSelection, resetConversation, submitAction, submitText } from '../../src/lib/chat-demo/store.svelte'
import { llm } from '../../src/lib/chat-demo/llm.svelte'
import type { DemoBlock, SuggestionItem } from '../../src/lib/chat-demo/types'

const say = (text: string) => {
	submitText(text)
	vi.runAllTimers()
}
const lastReply = () => {
	const turn = conversation.turns.at(-1)
	return turn?.role === 'assistant' ? turn.blocks : []
}
const screen = () => lastReply().find((b): b is DemoBlock => b.kind === 'demo')
const chips = (): SuggestionItem[] => lastReply().flatMap((b) => (b.kind === 'suggestions' ? b.items : []))

beforeEach(() => {
	vi.useFakeTimers()
	clearAll()
	resetConversation()
	llm.enabled = false
})
afterEach(() => vi.useRealTimers())

describe('a simulated conversation', () => {
	it('follows up on the table it showed: striped, then charted — the same rows throughout', () => {
		say('show me a sortable table')
		const rows = screen()?.data
		expect(screen()).toMatchObject({ demo: 'table' })

		say('make the rows striped')
		expect(screen()).toMatchObject({ demo: 'table', props: { striped: true }, data: rows })

		say('show the same data as a bar chart')
		expect(screen()).toMatchObject({ demo: 'chart', data: rows })
	})

	it('answers a how-to about what is on screen without replacing it', () => {
		say('show me a sortable table')
		say('how do I sort the columns?')
		expect(lastReply().some((b) => b.kind === 'markdown')).toBe(true)
		expect(screen()).toBeUndefined()
		say('make the rows striped')
		expect(screen()).toMatchObject({ demo: 'table', props: { striped: true } })
	})

	it('runs a chip’s intent directly', () => {
		say('show me tabs')
		const vertical = chips().find((c) => c.action?.kind === 'intent' && c.action.interpretation.variant === 'vertical')
		expect(vertical).toBeTruthy()
		submitAction({ label: vertical?.label, action: vertical!.action! })
		vi.runAllTimers()
		expect(screen()).toMatchObject({ demo: 'tabs', variant: 'vertical', props: { orientation: 'vertical' } })
	})

	it('follows up on pasted data like any other screen', () => {
		say(JSON.stringify([{ name: 'a', qty: 1, cost: 2, tax: 3, sku: 'x' }]))
		expect(screen()).toMatchObject({ demo: 'table' })
		say('make the rows striped')
		expect(screen()).toMatchObject({ demo: 'table', props: { striped: true } })
	})

	it('takes "edit this row" to mean the row the user selected in the table on screen', () => {
		say('show me a sortable table')
		const table = screen()!
		const laptop = (table.data as Record<string, unknown>[])[0]
		noteSelection(table, laptop)
		say('edit this row')
		expect(screen()).toMatchObject({ demo: 'form', data: laptop })
	})

	it('ignores a selection made in a demo that is no longer on screen', () => {
		say('show me a sortable table')
		const table = screen()!
		say('show me tabs')
		noteSelection(table, (table.data as Record<string, unknown>[])[0])
		say('edit this row')
		expect(screen()?.demo).not.toBe('form')
	})

	it('adjusts the demo on screen in place: no new turn, and the next turn sees it', () => {
		say('show me tabs')
		const turns = conversation.turns.length
		adjustScreen({ orientation: 'vertical' })
		expect(conversation.turns.length).toBe(turns)
		expect(screen()?.props).toMatchObject({ orientation: 'vertical' })
		say('align it to the end')
		expect(screen()?.props).toMatchObject({ orientation: 'vertical', align: 'end' })
	})

	it('knows which demo block is the screen', () => {
		say('show me a sortable table')
		const table = screen()!
		expect(isScreen(table)).toBe(true)
		say('show me tabs')
		expect(isScreen(table)).toBe(false)
	})

	it('asks back instead of guessing', () => {
		say('hmm')
		expect(screen()).toBeUndefined()
		expect(chips().length).toBeGreaterThan(0)
	})
})
