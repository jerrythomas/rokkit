import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { RequestHandler } from './$types'

/**
 * Proxy to OpenRouter's chat completions API.
 *
 * The OPENROUTER_API_KEY env var stays server-side (demo/.env.local) — the
 * browser never sees it. The client POSTs the same body shape OpenRouter
 * expects; we add the auth header + standard referrer fields and forward.
 *
 * Default model is meta-llama/llama-3.2-3b-instruct:free (Llama 3.2 3B,
 * free tier) which is a reasonable balance of speed + tool-calling
 * fidelity. Callers can override `model` in the request body.
 */
export const POST: RequestHandler = async ({ request, fetch, url }) => {
	const key = env.OPENROUTER_API_KEY
	if (!key) {
		throw error(503, 'OPENROUTER_API_KEY not set on server')
	}

	let body: Record<string, unknown>
	try {
		body = await request.json()
	} catch {
		throw error(400, 'Invalid JSON body')
	}

	const { messages, model } = body
	const isValidMessage = (m: unknown): boolean =>
		typeof m === 'object' &&
		m !== null &&
		typeof (m as Record<string, unknown>).role === 'string' &&
		typeof (m as Record<string, unknown>).content === 'string'

	if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isValidMessage)) {
		throw error(400, 'Invalid request body: "messages" must be a non-empty array of {role, content}')
	}
	if (model !== undefined && typeof model !== 'string') {
		throw error(400, 'Invalid request body: "model" must be a string')
	}

	const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			// OpenRouter recommends sending these so they can attribute usage.
			'HTTP-Referer': url.origin,
			'X-Title': 'Rokkit Chat Demo'
		},
		body: JSON.stringify(body)
	})

	if (!upstream.ok) {
		const text = await upstream.text()
		throw error(upstream.status, `OpenRouter ${upstream.status}: ${text.slice(0, 400)}`)
	}

	const data = await upstream.json()
	return json(data)
}
