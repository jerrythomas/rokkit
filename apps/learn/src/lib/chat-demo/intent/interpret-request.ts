/* What the browser may send `/api/chat/interpret`: the message, a summary of the screen and a
 * few recent messages. Rebuilt field by field, like the OpenRouter proxy's body — the screen's
 * data is never accepted, and the screen demo must be one the catalogue has.
 */
import type { ScreenSummary } from './systemone'
import { demoById } from './demos'
import { OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODEL } from '../models'

export const MAX_MESSAGE = 2_000
export const MAX_RECENT = 6
const MAX_RECENT_LENGTH = 500
const MAX_PROPS = 20

export type ServerBackend = 'systemone' | 'openrouter'
export type InterpretBody = { message: string; screen: ScreenSummary | null; recent: string[] } & (
	| { backend: 'systemone' }
	| { backend: 'openrouter'; model: string }
)

const MODELS = new Set(OPENROUTER_MODELS.map((m) => m.id))

/** The backend to ask: System One unless OpenRouter is named, and then only a curated free model. */
function backendOf(body: Record<string, unknown>): { backend: 'systemone' } | { backend: 'openrouter'; model: string } | string {
	if (body.backend === undefined || body.backend === 'systemone') return { backend: 'systemone' }
	if (body.backend !== 'openrouter') return '"backend" must be systemone or openrouter'
	const model = body.model ?? DEFAULT_OPENROUTER_MODEL
	return typeof model === 'string' && MODELS.has(model) ? { backend: 'openrouter', model } : '"model" must be one of the demo’s free models'
}
export type InterpretRequest = { body: InterpretBody } | { problem: string }

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Only flat, primitive props: they are summaries of settings, not data. */
const primitive = (v: unknown) => ['string', 'number', 'boolean'].includes(typeof v)

const propsOf = (value: unknown) =>
	Object.fromEntries(Object.entries(isRecord(value) ? value : {}).filter(([, v]) => primitive(v)).slice(0, MAX_PROPS))

const isDemo = (value: Record<string, unknown>) => typeof value.demo === 'string' && Boolean(demoById(value.demo))

function screenOf(value: unknown): ScreenSummary | null | string {
	if (value === undefined || value === null) return null
	if (!isRecord(value) || !isDemo(value)) return '"screen.demo" must be a catalogue demo'
	const variant = typeof value.variant === 'string' ? { variant: value.variant } : {}
	return { demo: value.demo as string, ...variant, props: propsOf(value.props) }
}

function recentOf(value: unknown): string[] | string {
	if (value === undefined) return []
	if (!Array.isArray(value) || value.length > MAX_RECENT || !value.every((m) => typeof m === 'string'))
		return `"recent" must be at most ${MAX_RECENT} messages`
	return value.map((m: string) => m.slice(0, MAX_RECENT_LENGTH))
}

const messageOf = (body: Record<string, unknown>): string | { problem: string } => {
	const message = typeof body.message === 'string' ? body.message.trim() : ''
	return message && message.length <= MAX_MESSAGE ? message : { problem: `"message" must be 1–${MAX_MESSAGE} characters` }
}

/** A field's value, or the problem with it — each check below returns one or the other. */
const failed = (v: unknown): v is string | { problem: string } => typeof v === 'string' || (isRecord(v) && 'problem' in v)
const problemOf = (v: string | { problem: string }) => ({ problem: typeof v === 'string' ? v : v.problem })

export function interpretRequest(body: unknown): InterpretRequest {
	if (!isRecord(body)) return { problem: 'the body must be a JSON object' }
	const message = messageOf(body)
	if (typeof message !== 'string') return message
	const [screen, recent, backend] = [screenOf(body.screen), recentOf(body.recent), backendOf(body)]
	for (const field of [screen, recent, backend]) if (failed(field)) return problemOf(field)
	return {
		body: { message, screen: screen as ScreenSummary | null, recent: recent as string[], ...(backend as { backend: 'systemone' }) }
	}
}
