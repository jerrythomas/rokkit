import { describe, it, expect, beforeEach } from 'vitest'
import { isChatMode, MODES, CHAT_MODES, visibleModes } from '../../src/lib/chat-demo/modes'
import { setEngine, llm, DEFAULT_OPENROUTER_MODEL, DEFAULT_WEBLLM_MODEL } from '../../src/lib/chat-demo/llm.svelte'

describe('modes descriptor', () => {
	it('CHAT_MODES lists the four engines', () => {
		expect(CHAT_MODES).toEqual(['simulated', 'systemone', 'openrouter', 'webllm'])
	})
	it('shows a mode that needs a backend only when the server reports it', () => {
		expect(visibleModes({ systemone: false }).map((m) => m.mode)).toEqual(['simulated', 'openrouter', 'webllm'])
		expect(visibleModes({ systemone: true }).map((m) => m.mode)).toEqual(['simulated', 'systemone', 'openrouter', 'webllm'])
	})
	it('marks System One as needing the server backend', () => {
		expect(MODES.find((m) => m.mode === 'systemone')?.needsBackend).toBe('systemone')
		expect(MODES.filter((m) => m.needsBackend).map((m) => m.mode)).toEqual(['systemone'])
	})
	it('isChatMode guards valid/invalid', () => {
		expect(isChatMode('simulated')).toBe(true)
		expect(isChatMode('webllm')).toBe(true)
		expect(isChatMode('bogus')).toBe(false)
		expect(isChatMode(undefined)).toBe(false)
	})
	it('each mode has a card descriptor with examples', () => {
		for (const m of CHAT_MODES) {
			const card = MODES.find((c) => c.mode === m)
			expect(card).toBeTruthy()
			expect(card!.examples.length).toBeGreaterThan(0)
		}
	})
})

describe('setEngine', () => {
	beforeEach(() => {
		llm.enabled = true
		llm.provider = 'openrouter'
		llm.openRouterModel = DEFAULT_OPENROUTER_MODEL
		llm.webllmModel = DEFAULT_WEBLLM_MODEL
	})
	it('simulated disables the LLM and answers with the local interpreter', () => {
		setEngine('simulated')
		expect(llm.enabled).toBe(false)
		expect(llm.interpreter).toBe('local')
	})
	it('systemone has no LLM either, and interprets on the server', () => {
		setEngine('systemone')
		expect(llm.enabled).toBe(false)
		expect(llm.interpreter).toBe('systemone')
		setEngine('simulated')
		expect(llm.interpreter).toBe('local')
	})
	it('openrouter enables + sets provider + model (default when omitted)', () => {
		setEngine('openrouter')
		expect(llm.enabled).toBe(true)
		expect(llm.provider).toBe('openrouter')
		expect(llm.openRouterModel).toBe(DEFAULT_OPENROUTER_MODEL)
		setEngine('openrouter', 'google/gemma-4-31b-it:free')
		expect(llm.openRouterModel).toBe('google/gemma-4-31b-it:free')
	})
	it('openrouter falls back to the default for a model off the curated list (a stale ?model=)', () => {
		setEngine('openrouter', 'openai/gpt-oss-120b:free')
		expect(llm.openRouterModel).toBe(DEFAULT_OPENROUTER_MODEL)
	})
	it('webllm enables + sets provider + model', () => {
		setEngine('webllm', 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC')
		expect(llm.enabled).toBe(true)
		expect(llm.provider).toBe('webllm')
		expect(llm.webllmModel).toBe('Qwen2.5-1.5B-Instruct-q4f16_1-MLC')
		setEngine('webllm')
		expect(llm.webllmModel).toBe(DEFAULT_WEBLLM_MODEL)
	})
})
