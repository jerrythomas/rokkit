import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { RequestHandler } from './$types'
import { interpretRequest, type InterpretBody } from '$lib/chat-demo/intent/interpret-request'
import { shortlistFor } from '$lib/chat-demo/intent/systemone'
import { classifierMessages, parseClassification } from '$lib/chat-demo/intent/classifier'
import { upstreamProblem } from '$lib/chat-demo/intent/upstream'
import type { Interpretation } from '$lib/chat-demo/intent/types'

/**
 * The server interpreter, for OpenRouter. The browser sends a message and a summary of what is
 * on screen; the server asks a curated free model to classify it, with a prompt the server owns,
 * and returns a proposed Interpretation the browser validates and acts on as it does its own.
 * OPENROUTER_API_KEY never leaves the server.
 *
 * System One is not here: it runs on the visitor's own Ollama, which a deployed server cannot
 * reach, so the browser asks it directly (intent/interpret.ts).
 */

/** Free-tier latency varies; past this the browser falls back to its local reading. */
const TIMEOUT_MS = 20_000

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

/** The completion's reply text, parsed into a reading, or a 502. */
async function readingFrom(upstream: Response): Promise<Interpretation> {
	const data = (await upstream.json()) as { choices?: { message?: { content?: string } }[] }
	const reading = parseClassification(data.choices?.[0]?.message?.content ?? '')
	if (!reading) throw error(502, 'The model did not answer with a reading')
	return reading
}

/** A curated free model asked to classify; its status passes on, its account details do not. */
async function askOpenRouter(fetch: typeof globalThis.fetch, url: URL, body: InterpretBody): Promise<Interpretation> {
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
	return json({ interpretation: await askOpenRouter(fetch, url, body) })
}
