import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { RequestHandler } from './$types'
import { interpretRequest, type InterpretBody } from '$lib/chat-demo/intent/interpret-request'
import { fromAnswers, questionsFor, shortlistFor, type Answer } from '$lib/chat-demo/intent/systemone'
import { classifierMessages, parseClassification } from '$lib/chat-demo/intent/classifier'
import { upstreamProblem } from '$lib/chat-demo/intent/upstream'
import type { Interpretation } from '$lib/chat-demo/intent/types'

/**
 * The server interpreter. The browser sends a message and a summary of what is on screen;
 * the server asks a backend and returns a proposed Interpretation, which the browser validates
 * and acts on as it does its own. The server owns every prompt: none comes from the browser.
 *
 * - System One (`backend: 'systemone'`): the questions built from the catalogue, asked of
 *   Ollama's /v1/systemone. Local-only in Ollama (no cloud), so enabled by OLLAMA_URL — a dev
 *   or self-hosted setup. SYSTEMONE_MODEL picks the model (default `nimble`).
 * - OpenRouter (`backend: 'openrouter'`): a curated free model asked to classify, with
 *   json_object. Enabled by OPENROUTER_API_KEY, which never leaves the server.
 */

/** A cold model load measured 8.4 s locally; past this the browser falls back instead. */
const TIMEOUT_MS = 20_000

export const GET: RequestHandler = () =>
	json({ systemone: Boolean(env.OLLAMA_URL), openrouter: Boolean(env.OPENROUTER_API_KEY) })

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
async function askSystemOne(fetch: typeof globalThis.fetch, body: InterpretBody): Promise<Interpretation> {
	const base = env.OLLAMA_URL
	if (!base) throw error(503, 'No System One backend: OLLAMA_URL is not set')
	const { message, screen, recent } = body
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
	const answers = ((await upstream.json()) as { answers?: Record<string, Answer> }).answers ?? {}
	return fromAnswers(answers, message, screen)
}

/** The completion's reply text, parsed into a reading, or a 502. */
async function readingFrom(upstream: Response): Promise<Interpretation> {
	const data = (await upstream.json()) as { choices?: { message?: { content?: string } }[] }
	const reading = parseClassification(data.choices?.[0]?.message?.content ?? '')
	if (!reading) throw error(502, 'The model did not answer with a reading')
	return reading
}

/** A curated free model asked to classify; its status passes on, its account details do not. */
async function askOpenRouter(fetch: typeof globalThis.fetch, url: URL, body: InterpretBody & { backend: 'openrouter' }): Promise<Interpretation> {
	const key = env.OPENROUTER_API_KEY
	if (!key) throw error(503, 'No OpenRouter backend: OPENROUTER_API_KEY is not set')
	const { message, screen, recent, model } = body
	const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			// OpenRouter asks for these so it can attribute usage.
			'HTTP-Referer': url.origin,
			'X-Title': 'Rokkit Chat Demo'
		},
		body: JSON.stringify({
			model,
			messages: classifierMessages({ message, screen, recent, shortlist: shortlistFor(message, screen) }),
			temperature: 0,
			response_format: { type: 'json_object' }
		}),
		signal: AbortSignal.timeout(TIMEOUT_MS)
	})
	if (!upstream.ok) throw error(upstream.status, upstreamProblem(upstream.status, await upstream.text()))
	return readingFrom(upstream)
}

export const POST: RequestHandler = async ({ request, fetch, url }) => {
	const body = await readBody(request)
	const interpretation = body.backend === 'openrouter' ? await askOpenRouter(fetch, url, body) : await askSystemOne(fetch, body)
	return json({ interpretation })
}
