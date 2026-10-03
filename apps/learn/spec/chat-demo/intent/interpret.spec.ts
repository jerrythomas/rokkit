/* Which interpreter answers. Measured on 22 messages (journal 2026-10-02): the local reading
 * scored 18, System One 16, and they failed on different messages — local wins when a message
 * names things outright, System One when the wording is vague ("bigger rows please"). So a
 * backend is asked only when the local interpreter did not recognise the message directly.
 * System One runs on the visitor's own Ollama, asked from the browser; OpenRouter on the server.
 */
import { describe, it, expect, vi } from 'vitest'
import { interpretWith } from '../../../src/lib/chat-demo/intent/interpret'
import { readDirectly } from '../../../src/lib/chat-demo/intent/local'
import type { Screen } from '../../../src/lib/chat-demo/intent/types'

const list: Screen = { demo: 'list', props: {} }
const choice = (c: string) => ({ type: 'choice', choice: c, confidence: 0.9, probabilities: { [c]: 0.9 } })
const answer = (interpretation: unknown) => vi.fn().mockResolvedValue(new Response(JSON.stringify({ interpretation })))

describe('readDirectly', () => {
	it('recognises a message that names a demo, a prop or a view', () => {
		expect(readDirectly('show me a sortable table', null)?.demo).toBe('table')
		expect(readDirectly('make it vertical', { demo: 'tabs', props: {} })?.intent).toBe('modify')
	})

	it('does not guess at vague wording', () => {
		expect(readDirectly('bigger rows please', list)).toBeNull()
	})
})

describe('interpretWith', () => {
	it('never calls the server for the local backend', async () => {
		const fetch = vi.fn()
		expect((await interpretWith('local', 'bigger rows please', { screen: list, fetcher: fetch })).reading.intent).toBeTruthy()
		expect(fetch).not.toHaveBeenCalled()
	})

	it('answers a direct reading locally, even with System One available', async () => {
		const fetch = vi.fn()
		expect((await interpretWith('systemone', 'show me a sortable table', { screen: null, fetcher: fetch })).reading).toMatchObject({ demo: 'table' })
		expect(fetch).not.toHaveBeenCalled()
	})

	it('asks the visitor’s own Ollama — from the browser — about vague wording, without the screen’s data', async () => {
		const fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ answers: { intent: choice('modify'), demo: choice('list'), 'prop:size': choice('lg') } }))
		)
		const screen = { ...list, data: [{ secret: 1 }] }
		const { reading, note } = await interpretWith('systemone', 'bigger rows please', { screen, recent: ['show me a list'], fetcher: fetch })
		expect(reading).toMatchObject({ intent: 'modify', props: { size: 'lg' } })
		expect(note).toBeUndefined()

		const [url, init] = fetch.mock.calls[0]
		expect(url).toBe('http://localhost:11434/v1/systemone')
		const sent = JSON.parse(init.body)
		expect(sent).toMatchObject({ model: 'nimble', state: { message: 'bigger rows please', on_screen: { demo: 'list', props: {} }, recent: ['show me a list'] } })
		expect(Object.keys(sent.questions)).toEqual(expect.arrayContaining(['intent', 'demo', 'prop:size']))
		expect(JSON.stringify(sent)).not.toMatch(/secret/)
	})

	it('uses the Ollama address and model it is given', async () => {
		const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ answers: { intent: choice('show'), demo: choice('tree') } })))
		await interpretWith('systemone', 'something with nested folders', { screen: null, fetcher: fetch, ollama: { url: 'http://127.0.0.1:11500/', model: 'nimble:2' } })
		expect(fetch.mock.calls[0][0]).toBe('http://127.0.0.1:11500/v1/systemone')
		expect(JSON.parse(fetch.mock.calls[0][1].body).model).toBe('nimble:2')
	})

	it('when Ollama cannot be reached, says how to let this site use it, and reads locally', async () => {
		const fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
		const { reading, note } = await interpretWith('systemone', 'something with nested folders', { screen: null, fetcher: fetch, origin: 'https://rokkit.sensei-hq.com' })
		expect(reading).toMatchObject({ intent: 'show', demo: 'tree' })
		expect(note).toMatch(/OLLAMA_ORIGINS=https:\/\/rokkit\.sensei-hq\.com ollama serve/)
		expect(note).toMatch(/nimble/)
		// A public site reaching localhost also needs the browser's local-network permission.
		expect(note).toMatch(/allow .*local network/i)
		expect(note).toMatch(/read here instead/)
	})

	it('asks OpenRouter on the server, naming the model', async () => {
		const fetch = answer({ intent: 'modify', demo: 'list', props: { size: 'lg' }, confidence: 0.9 })
		await interpretWith('openrouter', 'bigger rows please', { screen: list, model: 'google/gemma-4-31b-it:free', fetcher: fetch })
		expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ backend: 'openrouter', model: 'google/gemma-4-31b-it:free' })
	})

	it('asks an LLM about a show even when it names a demo, since an LLM can bring data', async () => {
		const fetch = answer({ intent: 'show', demo: 'chart', data: [{ q: 'Q1', v: 1 }], confidence: 0.9 })
		const { reading } = await interpretWith('openrouter', 'Generate a Q3 sales scenario and chart it', { screen: null, fetcher: fetch })
		expect(fetch).toHaveBeenCalled()
		expect(reading.data).toEqual([{ q: 'Q1', v: 1 }])
	})

	it('still answers a change to the screen locally in an LLM mode', async () => {
		const fetch = vi.fn()
		await interpretWith('openrouter', 'make it vertical', { screen: { demo: 'tabs', props: {} }, fetcher: fetch })
		expect(fetch).not.toHaveBeenCalled()
	})

	it('says why it fell back, with a hint for the free tier', async () => {
		const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'OpenRouter 429: Provider returned error' }), { status: 429 }))
		const { note } = await interpretWith('openrouter', 'bigger rows please', { screen: list, fetcher: fetch })
		expect(note).toMatch(/rate-limited/i)
		expect(note).toMatch(/read here instead/)
	})

	it('runs the classifier prompt in the browser for Web-LLM', async () => {
		const complete = vi.fn().mockResolvedValue('{"intent":"modify","demo":"list","props":{"size":"lg"},"confidence":0.8}')
		const { reading } = await interpretWith('webllm', 'bigger rows please', { screen: list, complete })
		expect(reading).toMatchObject({ intent: 'modify', props: { size: 'lg' } })
		expect(complete.mock.calls[0][0][0].role).toBe('system')
	})

	it('falls back when Web-LLM is not loaded', async () => {
		const { reading, note } = await interpretWith('webllm', 'something with nested folders', { screen: null })
		expect(reading.demo).toBe('tree')
		expect(note).toMatch(/Web-LLM/)
	})
})
