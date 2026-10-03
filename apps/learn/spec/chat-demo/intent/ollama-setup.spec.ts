/* What the System One page tells a visitor, and how it checks their Ollama. The steps are
 * built for this site's origin (OLLAMA_ORIGINS must name it) and follow Ollama's FAQ per OS;
 * the model comes from Ollama's library (`ollama pull nimble`, needs Ollama 0.35+).
 */
import { describe, it, expect, vi } from 'vitest'
import { checkOllama, setupSteps } from '../../../src/lib/chat-demo/intent/ollama-setup'

const ORIGIN = 'https://rokkit.sensei-hq.com'

describe('setupSteps', () => {
	const steps = setupSteps(ORIGIN, 'nimble')

	it('pulls the System One model', () => {
		expect(steps.model).toBe('ollama pull nimble')
	})

	it('allows this site’s origin on each platform, the way Ollama’s FAQ says', () => {
		const by = Object.fromEntries(steps.allow.map((s) => [s.os, s.commands.join('\n')]))
		expect(by['macOS app']).toBe(`launchctl setenv OLLAMA_ORIGINS "${ORIGIN}"`)
		expect(by['Linux (systemd)']).toContain(`Environment="OLLAMA_ORIGINS=${ORIGIN}"`)
		expect(by['Linux (systemd)']).toContain('systemctl restart ollama')
		expect(by['Terminal']).toBe(`OLLAMA_ORIGINS=${ORIGIN} ollama serve`)
		expect(steps.allow.map((s) => s.os)).toEqual(['macOS app', 'Linux (systemd)', 'Windows', 'Terminal'])
	})

	it('says a localhost origin needs no allowing — Ollama allows it already', () => {
		expect(setupSteps('http://localhost:5173', 'nimble').allowNeeded).toBe(false)
		expect(steps.allowNeeded).toBe(true)
	})
})

describe('checkOllama', () => {
	const tags = (...names: string[]) => vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: names.map((name) => ({ name })) })))

	it('is ready when Ollama answers and has the model', async () => {
		const fetch = tags('llama3.2:latest', 'nimble:latest')
		expect(await checkOllama({ url: 'http://localhost:11434', model: 'nimble' }, fetch)).toBe('ready')
		expect(fetch.mock.calls[0][0]).toBe('http://localhost:11434/api/tags')
	})

	it('reports a missing model', async () => {
		expect(await checkOllama({ url: 'http://localhost:11434', model: 'nimble' }, tags('llama3.2:latest'))).toBe('no-model')
	})

	it('reports unreachable for anything the browser blocks or nothing answers', async () => {
		const refused = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
		expect(await checkOllama({ url: 'http://localhost:11434', model: 'nimble' }, refused)).toBe('unreachable')
		const forbidden = vi.fn().mockResolvedValue(new Response('', { status: 403 }))
		expect(await checkOllama({ url: 'http://localhost:11434', model: 'nimble' }, forbidden)).toBe('unreachable')
	})
})
