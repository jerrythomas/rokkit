import { describe, it, expect, beforeEach } from 'vitest'
import { isChatMode, MODES, CHAT_MODES } from '../../src/lib/chat-demo/modes'
import { setEngine, llm, DEFAULT_OPENROUTER_MODEL, DEFAULT_WEBLLM_MODEL } from '../../src/lib/chat-demo/llm.svelte'

describe('modes descriptor', () => {
	it('CHAT_MODES lists the three engines', () => {
		expect(CHAT_MODES).toEqual(['simulated', 'openrouter', 'webllm'])
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
	it('simulated disables the LLM', () => {
		setEngine('simulated')
		expect(llm.enabled).toBe(false)
	})
	it('openrouter enables + sets provider + model (default when omitted)', () => {
		setEngine('openrouter')
		expect(llm.enabled).toBe(true)
		expect(llm.provider).toBe('openrouter')
		expect(llm.openRouterModel).toBe(DEFAULT_OPENROUTER_MODEL)
		setEngine('openrouter', 'meta-llama/llama-3.3-70b-instruct:free')
		expect(llm.openRouterModel).toBe('meta-llama/llama-3.3-70b-instruct:free')
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
