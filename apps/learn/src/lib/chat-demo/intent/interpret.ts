/* Which interpreter answers a message. Measured on 22 messages (journal 2026-10-02): the local
 * interpreter scored 18 and System One 16, failing on different messages — local wins when a
 * message names things outright, System One when the wording is vague ("bigger rows please").
 * So a direct local reading answers at once, and only the rest go to a backend: System One on
 * the visitor's own Ollama (asked from the browser — a deployed server cannot reach it),
 * OpenRouter on the server, or Web-LLM in the browser. An LLM is still asked about a `show`,
 * because it can bring data ("generate a Q3 sales scenario and chart it") where the local
 * reading would show the sample. If the backend fails, the local reading answers, and the reply
 * says why.
 */
import type { Interpretation, Screen } from './types'
import { interpretLocally, readDirectly } from './local'
import { classifierMessages, parseClassification, type ChatMessage } from './classifier'
import { fromAnswers, questionsFor, shortlistFor, type Answer } from './systemone'

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
	/** System One: the visitor's Ollama. */
	ollama?: { url: string; model: string }
	/** This site's origin, for the OLLAMA_ORIGINS a visitor must allow. */
	origin?: string
}

export const DEFAULT_OLLAMA = { url: 'http://localhost:11434', model: 'nimble' }

/** A cold model load measured 8.4 s; past this the local reading answers instead. */
const OLLAMA_TIMEOUT_MS = 20_000

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

/**
 * System One on the visitor's own Ollama. The browser builds the questions from the catalogue
 * (the same `questionsFor` the eval measures) and posts them to `/v1/systemone`; Ollama must
 * allow this site's origin (OLLAMA_ORIGINS), which is what an unreachable Ollama's note says.
 */
async function askOllama(message: string, ctx: Context): Promise<Interpretation> {
	const { url, model } = ctx.ollama ?? DEFAULT_OLLAMA
	const screen = summaryOf(ctx.screen)
	const body = {
		model,
		state: { message, on_screen: screen, recent: ctx.recent ?? [] },
		questions: questionsFor(message, screen, shortlistFor(message, screen))
	}
	const res = await postToOllama(`${url.replace(/\/$/, '')}/v1/systemone`, body, ctx)
	const { answers } = (await res.json()) as { answers?: Record<string, Answer> }
	return fromAnswers(answers ?? {}, message, screen)
}

/**
 * What a visitor needs for this site to use their Ollama: Ollama allowing the origin, a System
 * One model, and — from a public site — the browser's local-network permission, which Chromium
 * asks for on the first request and blocks without (measured 2026-10-02, Chromium 147).
 */
const setupHint = (ctx: Context, model: string) =>
	`start it with \`OLLAMA_ORIGINS=${ctx.origin ?? '<this site>'} ollama serve\`, pull a System One model (${model}), and allow this site to reach your local network when the browser asks`

/** POST to the visitor's Ollama; unreachable or refused becomes a BackendError saying how to fix it. */
async function postToOllama(endpoint: string, body: { model: string }, ctx: Context): Promise<Response> {
	const { url } = ctx.ollama ?? DEFAULT_OLLAMA
	let res: Response
	try {
		res = await (ctx.fetcher ?? fetch)(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS)
		})
	} catch {
		throw new BackendError(`your Ollama at ${url} could not be reached — ${setupHint(ctx, body.model)}`)
	}
	if (!res.ok) throw new BackendError(`your Ollama answered ${res.status} — ${setupHint(ctx, body.model)}`)
	return res
}

const NAMES: Record<Exclude<Backend, 'local'>, string> = { systemone: 'System One', openrouter: 'OpenRouter', webllm: 'Web-LLM' }

const ASK: Record<Exclude<Backend, 'local'>, (message: string, ctx: Context) => Promise<Interpretation>> = {
	systemone: askOllama,
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
