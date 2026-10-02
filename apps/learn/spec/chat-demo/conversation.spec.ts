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
	llm.interpreter = 'local'
})
afterEach(() => vi.useRealTimers())

describe('a System One conversation', () => {
	const flush = async () => {
		await vi.runAllTimersAsync()
	}

	it('asks the server only about what the local interpreter does not recognise', async () => {
		const fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ interpretation: { intent: 'modify', demo: 'list', props: { size: 'lg' }, confidence: 0.9 } }))
		)
		vi.stubGlobal('fetch', fetch)
		llm.interpreter = 'systemone'
		try {
			submitText('show me a list')
			await flush()
			expect(fetch).not.toHaveBeenCalled()
			expect(screen()?.demo).toBe('list')

			submitText('bigger rows please')
			await flush()
			expect(fetch).toHaveBeenCalledTimes(1)
			expect(JSON.parse(fetch.mock.calls[0][1].body).recent).toEqual(['show me a list'])
			expect(screen()).toMatchObject({ demo: 'list', props: { size: 'lg' } })
		} finally {
			llm.interpreter = 'local'
			vi.unstubAllGlobals()
		}
	})
})

describe('an LLM-mode conversation', () => {
	const flush = async () => {
		await vi.runAllTimersAsync()
	}
	afterEach(() => {
		llm.enabled = false
		vi.unstubAllGlobals()
	})

	it('OpenRouter classifies on the server, and its reading is acted on', async () => {
		const fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ interpretation: { intent: 'show', demo: 'chart', data: [{ q: 'Q1', v: 1 }, { q: 'Q2', v: 3 }], confidence: 0.9 } }))
		)
		vi.stubGlobal('fetch', fetch)
		llm.enabled = true
		llm.provider = 'openrouter'
		submitText('Generate a Q3 sales scenario and chart it')
		await flush()
		expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ backend: 'openrouter', model: llm.openRouterModel })
		expect(screen()).toMatchObject({ demo: 'chart', props: { x: 'q', y: 'v' } })
	})

	it('says so when OpenRouter fails, and answers locally', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 429 })))
		llm.enabled = true
		llm.provider = 'openrouter'
		submitText('something with nested folders')
		await flush()
		expect(lastReply()[0]).toMatchObject({ kind: 'prose', text: expect.stringMatching(/OpenRouter didn’t answer.*rate-limited/) })
		expect(screen()?.demo).toBe('tree')
	})

	it('falls back with a note when Web-LLM cannot run in this browser', async () => {
		llm.enabled = true
		llm.provider = 'webllm'
		submitText('something with nested folders')
		await flush()
		expect(lastReply()[0]).toMatchObject({ kind: 'prose', text: expect.stringMatching(/Web-LLM didn’t answer/) })
		expect(screen()?.demo).toBe('tree')
	})
})

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
