import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { RequestHandler } from './$types'
import { upstreamRequest, upstreamProblem } from '$lib/chat-demo/openrouter-request'

/**
 * Proxy to OpenRouter's chat completions API.
 *
 * The OPENROUTER_API_KEY env var stays server-side (demo/.env.local) — the
 * browser never sees it. Because the key is ours, this is not an open proxy:
 * `upstreamRequest` rebuilds the body from the fields the demo sends (one of
 * its curated free models, a short conversation, temperature, JSON mode) and
 * anything else is answered 400 before OpenRouter is called. We add the auth
 * header + standard referrer fields and forward.
 */
export const POST: RequestHandler = async ({ request, fetch, url }) => {
	const key = env.OPENROUTER_API_KEY
	if (!key) {
		throw error(503, 'OPENROUTER_API_KEY not set on server')
	}

	let raw: unknown
	try {
		raw = await request.json()
	} catch {
		throw error(400, 'Invalid JSON body')
	}
	const upstreamBody = upstreamRequest(raw)
	if ('problem' in upstreamBody) throw error(400, `Invalid request body: ${upstreamBody.problem}`)

	const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			// OpenRouter recommends sending these so they can attribute usage.
			'HTTP-Referer': url.origin,
			'X-Title': 'Rokkit Chat Demo'
		},
		body: JSON.stringify(upstreamBody.body)
	})

	if (!upstream.ok) {
		throw error(upstream.status, upstreamProblem(upstream.status, await upstream.text()))
	}

	const data = await upstream.json()
	return json(data)
}
