import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { RequestHandler } from './$types'
import { interpretRequest, type InterpretBody } from '$lib/chat-demo/intent/interpret-request'
import { fromAnswers, questionsFor, shortlistFor, type Answer } from '$lib/chat-demo/intent/systemone'

/**
 * The server interpreter. The browser sends a message and a summary of what is on screen;
 * the server builds the System One questions from the catalogue, asks Ollama, and returns a
 * proposed Interpretation, which the browser validates and acts on as it does its own.
 *
 * System One is local-only in Ollama (no cloud), so it is enabled by OLLAMA_URL — a dev or
 * self-hosted setup. SYSTEMONE_MODEL picks the model (default `nimble`).
 */

/** A cold model load measured 8.4 s locally; past this the browser falls back instead. */
const TIMEOUT_MS = 20_000

export const GET: RequestHandler = () => json({ systemone: Boolean(env.OLLAMA_URL) })

/** The request, bounded by `interpretRequest`, or a 400. */
async function readBody(request: Request): Promise<InterpretBody> {
	let raw: unknown
	try {
		raw = await request.json()
	} catch {
		throw error(400, 'Invalid JSON body')
	}
	const parsed = interpretRequest(raw)
	if ('problem' in parsed) throw error(400, `Invalid request body: ${parsed.problem}`)
	return parsed.body
}

/** One `/v1/systemone` request carrying every question; a 502 if Ollama does not answer. */
async function askSystemOne(fetch: typeof globalThis.fetch, base: string, { message, screen, recent }: InterpretBody) {
	let upstream: Response
	try {
		upstream = await fetch(`${base.replace(/\/$/, '')}/v1/systemone`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: env.SYSTEMONE_MODEL || 'nimble',
				state: { message, on_screen: screen, recent },
				questions: questionsFor(message, screen, shortlistFor(message, screen))
			}),
			signal: AbortSignal.timeout(TIMEOUT_MS)
		})
	} catch {
		throw error(502, 'System One did not answer')
	}
	if (!upstream.ok) throw error(502, `System One ${upstream.status}`)
	return ((await upstream.json()) as { answers?: Record<string, Answer> }).answers ?? {}
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const base = env.OLLAMA_URL
	if (!base) throw error(503, 'No interpreter backend: OLLAMA_URL is not set')
	const body = await readBody(request)
	const answers = await askSystemOne(fetch, base, body)
	return json({ interpretation: fromAnswers(answers, body.message, body.screen) })
}
