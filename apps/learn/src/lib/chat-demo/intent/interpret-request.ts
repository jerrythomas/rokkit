/* What the browser may send `/api/chat/interpret`: the message, a summary of the screen and a
 * few recent messages. Rebuilt field by field, like the OpenRouter proxy's body — the screen's
 * data is never accepted, and the screen demo must be one the catalogue has.
 */
import type { ScreenSummary } from './systemone'
import { demoById } from './demos'

export const MAX_MESSAGE = 2_000
export const MAX_RECENT = 6
const MAX_RECENT_LENGTH = 500
const MAX_PROPS = 20

export type InterpretBody = { message: string; screen: ScreenSummary | null; recent: string[] }
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

export function interpretRequest(body: unknown): InterpretRequest {
	if (!isRecord(body)) return { problem: 'the body must be a JSON object' }
	const message = typeof body.message === 'string' ? body.message.trim() : ''
	if (!message || message.length > MAX_MESSAGE) return { problem: `"message" must be 1–${MAX_MESSAGE} characters` }
	const screen = screenOf(body.screen)
	if (typeof screen === 'string') return { problem: screen }
	const recent = recentOf(body.recent)
	if (typeof recent === 'string') return { problem: recent }
	return { body: { message, screen, recent } }
}
