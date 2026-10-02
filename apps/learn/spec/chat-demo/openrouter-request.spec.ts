/* The OpenRouter proxy spends the server's key, so it forwards only what the demo sends:
 * a curated free model, a short conversation, a temperature. Anything else — a paid model,
 * max_tokens, tools — is refused or dropped before it reaches OpenRouter.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { upstreamRequest } from '../../src/lib/chat-demo/openrouter-request'
import { OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODEL } from '../../src/lib/chat-demo/models'

vi.mock('$env/dynamic/private', () => ({ env: { OPENROUTER_API_KEY: 'test-key' } }))

const messages = [
	{ role: 'system', content: 'You are helpful.' },
	{ role: 'user', content: 'Show me a chart' }
]
const ok = (body: unknown) => {
	const result = upstreamRequest(body)
	if ('problem' in result) throw new Error(result.problem)
	return result.body
}
const problem = (body: unknown) => {
	const result = upstreamRequest(body)
	return 'problem' in result ? result.problem : null
}

describe('upstreamRequest', () => {
	it('forwards what the demo client sends, unchanged', () => {
		const body = { model: OPENROUTER_MODELS[2].id, messages, temperature: 0.3 }
		expect(ok(body)).toEqual(body)
	})

	it('defaults the model when none is named', () => {
		expect(ok({ messages }).model).toBe(DEFAULT_OPENROUTER_MODEL)
	})

	it('keeps response_format json_object', () => {
		expect(ok({ messages, response_format: { type: 'json_object' } }).response_format).toEqual({ type: 'json_object' })
	})

	it('drops every field it does not know', () => {
		const body = ok({ messages, max_tokens: 1_000_000, tools: [{}], provider: { order: ['x'] }, stream: true })
		expect(Object.keys(body).sort()).toEqual(['messages', 'model'])
	})

	it('drops unknown fields inside a message', () => {
		const body = ok({ messages: [{ role: 'user', content: 'hi', name: 'x', tool_calls: [] }] })
		expect(body.messages).toEqual([{ role: 'user', content: 'hi' }])
	})

	it('refuses a model outside the curated free list', () => {
		expect(problem({ model: 'openai/gpt-4o', messages })).toMatch(/model/)
		expect(problem({ model: 'anthropic/claude-opus-5-5', messages })).toMatch(/model/)
		expect(problem({ model: 42, messages })).toMatch(/model/)
	})

	it.each([
		['not an object', 'hello'],
		['an array', [messages]],
		['null', null],
		['no messages', {}],
		['empty messages', { messages: [] }],
		['a message that is not an object', { messages: ['hi'] }],
		['a non-string content', { messages: [{ role: 'user', content: { toString: 'x' } }] }],
		['an unknown role', { messages: [{ role: 'tool', content: 'x' }] }],
		['too many messages', { messages: Array.from({ length: 9 }, () => ({ role: 'user', content: 'x' })) }],
		['an oversized message', { messages: [{ role: 'user', content: 'x'.repeat(16_001) }] }],
		['a non-numeric temperature', { messages, temperature: '0.3' }],
		['an out-of-range temperature', { messages, temperature: 5 }],
		['a response_format other than json_object', { messages, response_format: { type: 'json_schema', json_schema: {} } }]
	])('refuses %s', (_, body) => {
		expect(problem(body)).toBeTruthy()
	})
})

describe('POST /api/llm/openrouter', () => {
	let fetch: ReturnType<typeof vi.fn>
	beforeEach(() => {
		fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [] }), { status: 200 }))
	})
	const post = async (body: unknown) => {
		const { POST } = await import('../../src/routes/api/llm/openrouter/+server')
		const request = new Request('http://localhost/api/llm/openrouter', { method: 'POST', body: JSON.stringify(body) })
		// A RequestEvent stub with only the fields POST reads.
		return POST({ request, fetch, url: new URL('http://localhost') } as unknown as Parameters<typeof POST>[0])
	}

	it('sends OpenRouter the sanitised body only', async () => {
		await post({ messages, max_tokens: 99_999 })
		const sent = JSON.parse(fetch.mock.calls[0][1].body)
		expect(sent).toEqual({ model: DEFAULT_OPENROUTER_MODEL, messages })
	})

	it('answers 400 and never calls OpenRouter for a paid model', async () => {
		await expect(post({ model: 'openai/gpt-4o', messages })).rejects.toMatchObject({ status: 400 })
		expect(fetch).not.toHaveBeenCalled()
	})
})
