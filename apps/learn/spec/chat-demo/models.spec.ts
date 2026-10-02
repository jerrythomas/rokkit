/* The curated OpenRouter models: free, JSON-mode capable (the demo sends json_object), and the
 * only ones the server proxies, so a model from a stale URL or saved conversation falls back
 * to the default instead of being refused.
 */
import { describe, it, expect } from 'vitest'
import { OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODEL, curatedOpenRouterModel } from '../../src/lib/chat-demo/models'

describe('OPENROUTER_MODELS', () => {
	it('defaults to Nemotron 3 Super, which answered JSON live on 2026-10-02 while both Gemmas were rate-limited', () => {
		expect(DEFAULT_OPENROUTER_MODEL).toBe('nvidia/nemotron-3-super-120b-a12b:free')
	})

	it('lists only free models, once each', () => {
		const ids = OPENROUTER_MODELS.map((m) => m.id)
		expect(ids.every((id) => id.endsWith(':free'))).toBe(true)
		expect(new Set(ids).size).toBe(ids.length)
	})
})

describe('curatedOpenRouterModel', () => {
	it('keeps a listed model', () => {
		expect(curatedOpenRouterModel(OPENROUTER_MODELS[2].id)).toBe(OPENROUTER_MODELS[2].id)
	})

	it.each([
		['a rotated-out model', 'openai/gpt-oss-20b:free'],
		['a paid model', 'openai/gpt-4o'],
		['nothing', undefined]
	])('falls back to the default for %s', (_, id) => {
		expect(curatedOpenRouterModel(id)).toBe(DEFAULT_OPENROUTER_MODEL)
	})
})
