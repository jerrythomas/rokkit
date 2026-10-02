/* Which interpreter answers a message. Measured on 22 messages (journal 2026-10-02): the local
 * interpreter scored 18 and System One 16, failing on different messages — local wins when a
 * message names things outright, System One when the wording is vague ("bigger rows please").
 * So a direct local reading answers at once, and only the rest go to a backend: System One or
 * OpenRouter on the server, or Web-LLM in the browser. An LLM is still asked about a `show`,
 * because it can bring data ("generate a Q3 sales scenario and chart it") where the local
 * reading would show the sample. If the backend fails, the local reading answers, and the reply
 * says why.
 */
import type { Interpretation, Screen } from './types'
import { interpretLocally, readDirectly } from './local'
import { classifierMessages, parseClassification, type ChatMessage } from './classifier'
import { shortlistFor } from './systemone'

export type Backend = 'local' | 'systemone' | 'openrouter' | 'webllm'

export type Context = {
	screen: Screen | null
	/** What the user said before, for the backend's context. */
	recent?: string[]
	/** The OpenRouter model. */
	model?: string
	fetcher?: typeof fetch
	/** Web-LLM: run the classifier messages, resolve with the reply text. */
	complete?: (messages: ChatMessage[]) => Promise<string>
}

/** The reading, and — when a backend failed and the local reading stood in — why. */
export type Outcome = { reading: Interpretation; note?: string }

/** The screen as a backend is told it: what is on screen, never the data it holds. */
const summaryOf = (screen: Screen | null) =>
	screen ? { demo: screen.demo, ...(screen.variant ? { variant: screen.variant } : {}), props: screen.props } : null

/** What a failed status means on the free tier, and what to try. */
const STATUS_HINT: Record<number, string> = {
	404: 'that model is unavailable — the free list rotates, so pick another',
	408: 'it timed out — free-tier latency varies, so retry or pick a faster model',
	429: 'it is rate-limited by the free provider — retry in a moment or pick another model',
	503: 'it is not set up on this server'
}

class BackendError extends Error {}

async function askServer(message: string, ctx: Context, backend: object): Promise<Interpretation> {
	const res = await (ctx.fetcher ?? fetch)('/api/chat/interpret', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, screen: summaryOf(ctx.screen), recent: ctx.recent ?? [], ...backend })
	})
	if (!res.ok) throw new BackendError(STATUS_HINT[res.status] ?? `it answered ${res.status}`)
	return (await res.json()).interpretation as Interpretation
}

async function askBrowser(message: string, ctx: Context): Promise<Interpretation> {
	if (!ctx.complete) throw new BackendError('the model is not loaded')
	const screen = summaryOf(ctx.screen)
	const reply = await ctx.complete(classifierMessages({ message, screen, recent: ctx.recent ?? [], shortlist: shortlistFor(message, screen) }))
	const reading = parseClassification(reply)
	if (!reading) throw new BackendError('it did not answer with a reading')
	return reading
}

/** The backends that can generate, so are asked about a show the local reading named. */
const LLMS = new Set<Backend>(['openrouter', 'webllm'])

const NAMES: Record<Exclude<Backend, 'local'>, string> = { systemone: 'System One', openrouter: 'OpenRouter', webllm: 'Web-LLM' }

const ASK: Record<Exclude<Backend, 'local'>, (message: string, ctx: Context) => Promise<Interpretation>> = {
	systemone: (m, ctx) => askServer(m, ctx, { backend: 'systemone' }),
	openrouter: (m, ctx) => askServer(m, ctx, { backend: 'openrouter', ...(ctx.model ? { model: ctx.model } : {}) }),
	webllm: askBrowser
}

export async function interpretWith(backend: Backend, message: string, ctx: Context): Promise<Outcome> {
	const direct = readDirectly(message, ctx.screen)
	if (direct && !(LLMS.has(backend) && direct.intent === 'show')) return { reading: direct }
	if (backend === 'local') return { reading: interpretLocally(message, ctx.screen) }
	try {
		return { reading: await ASK[backend](message, ctx) }
	} catch (err) {
		const why = err instanceof BackendError ? err.message : 'it could not be reached'
		return { reading: interpretLocally(message, ctx.screen), note: `${NAMES[backend]} didn’t answer: ${why}, so this was read here instead.` }
	}
}
