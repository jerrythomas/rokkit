/* `/api/chat/interpret` — the server interpreter, for OpenRouter (the key stays server-side).
 * The browser sends the message and a summary of the screen (never its data); the server builds
 * the classifier prompt and returns a proposal the browser validates. System One is not here:
 * it runs on the visitor's own Ollama, asked from the browser.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { interpretRequest } from '../../src/lib/chat-demo/intent/interpret-request'
import { upstreamProblem } from '../../src/lib/chat-demo/intent/upstream'
import { DEFAULT_OPENROUTER_MODEL } from '../../src/lib/chat-demo/models'

const env: Record<string, string | undefined> = {}
vi.mock('$env/dynamic/private', () => ({ env }))

const endpoint = () => import('../../src/routes/api/chat/interpret/+server')
const event = (body: unknown, fetch: typeof globalThis.fetch) =>
	({
		request: new Request('http://localhost/api/chat/interpret', { method: 'POST', body: JSON.stringify(body) }),
		fetch,
		url: new URL('http://localhost/api/chat/interpret')
	}) as never

describe('interpretRequest — what the browser may send', () => {
	it('accepts a message, a screen summary and recent messages', () => {
		const r = interpretRequest({ message: 'make it vertical', screen: { demo: 'tabs', props: { align: 'end' } }, recent: ['show me tabs'] })
		expect(r).toEqual({
			body: {
				message: 'make it vertical',
				screen: { demo: 'tabs', props: { align: 'end' } },
				recent: ['show me tabs'],
				backend: 'openrouter',
				model: DEFAULT_OPENROUTER_MODEL
			}
		})
	})

	it.each([
		['no message', {}],
		['an empty message', { message: '  ' }],
		['an oversized message', { message: 'x'.repeat(2001) }],
		['a screen demo not in the catalogue', { message: 'hi', screen: { demo: 'spaceship', props: {} } }],
		['too many recent messages', { message: 'hi', recent: Array(7).fill('x') }]
	])('refuses %s', (_, body) => {
		expect('problem' in interpretRequest(body)).toBe(true)
	})

	it('asks OpenRouter, with a curated free model only — System One is not a server backend', () => {
		expect(interpretRequest({ message: 'hi' })).toMatchObject({ body: { backend: 'openrouter', model: DEFAULT_OPENROUTER_MODEL } })
		expect('problem' in interpretRequest({ message: 'hi', backend: 'openrouter', model: 'openai/gpt-4o' })).toBe(true)
		expect('problem' in interpretRequest({ message: 'hi', backend: 'systemone' })).toBe(true)
	})

	it('drops the screen’s data if a client sends it anyway', () => {
		const r = interpretRequest({ message: 'hi', screen: { demo: 'table', props: {}, data: [{ secret: 1 }] } })
		expect('body' in r && r.body.screen).toEqual({ demo: 'table', props: {} })
	})
})

it('has no GET: the picker no longer asks which backends the server has', async () => {
	expect('GET' in (await endpoint())).toBe(false)
})

const OPENROUTER_404 = JSON.stringify({
	error: { message: 'This model is unavailable for free.', code: 404, metadata: { raw: 'provider internals' } },
	user_id: 'user_2quhocCfcTnSxee12HwFEdf4S2q'
})
const completion = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }))

describe('POST /api/chat/interpret — OpenRouter', () => {
	beforeEach(() => {
		env.OPENROUTER_API_KEY = 'test-key'
	})

	it('asks a curated free model to classify, with the server’s own prompt, and parses the reply', async () => {
		const fetch = vi.fn().mockResolvedValue(completion('{"intent":"show","demo":"tree","confidence":0.8}'))
		const { POST } = await endpoint()
		const res = await POST(event({ message: 'something with nested folders', backend: 'openrouter' }, fetch))
		expect(await res.json()).toEqual({ interpretation: { intent: 'show', demo: 'tree', confidence: 0.8 } })

		const [url, init] = fetch.mock.calls[0]
		expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
		expect(init.headers.Authorization).toBe('Bearer test-key')
		const sent = JSON.parse(init.body)
		expect(sent).toMatchObject({ model: DEFAULT_OPENROUTER_MODEL, temperature: 0, response_format: { type: 'json_object' } })
		expect(sent.messages[0].role).toBe('system')
		expect(sent.messages[1].content).toMatch(/nested folders/)
	})

	it('answers 503 when the server has no OpenRouter key', async () => {
		delete env.OPENROUTER_API_KEY
		const { POST } = await endpoint()
		await expect(POST(event({ message: 'hi', backend: 'openrouter' }, vi.fn()))).rejects.toMatchObject({ status: 503 })
	})

	it('passes on OpenRouter’s status without its account details', async () => {
		const fetch = vi.fn().mockResolvedValue(new Response(OPENROUTER_404, { status: 404 }))
		const { POST } = await endpoint()
		const failure = await POST(event({ message: 'hi', backend: 'openrouter' }, fetch)).catch((e) => e)
		expect(failure).toMatchObject({ status: 404 })
		expect(JSON.stringify(failure.body)).not.toMatch(/user_|provider internals/)
	})

	it('answers 502 when the reply is not a reading', async () => {
		const fetch = vi.fn().mockResolvedValue(completion('I think a tree.'))
		const { POST } = await endpoint()
		await expect(POST(event({ message: 'hi', backend: 'openrouter' }, fetch))).rejects.toMatchObject({ status: 502 })
	})
})

describe('upstreamProblem', () => {
	it('keeps OpenRouter’s message and nothing else', () => {
		expect(upstreamProblem(404, OPENROUTER_404)).toBe('OpenRouter 404: This model is unavailable for free.')
	})

	it('says only the status when the body is not OpenRouter’s error JSON', () => {
		expect(upstreamProblem(502, '<html>Bad gateway user_2quho</html>')).toBe('OpenRouter 502')
	})

	it('caps a long message', () => {
		const long = JSON.stringify({ error: { message: 'x'.repeat(1000) } })
		expect(upstreamProblem(400, long).length).toBeLessThanOrEqual('OpenRouter 400: '.length + 200)
	})
})
