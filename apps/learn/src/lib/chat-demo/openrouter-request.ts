/* What the OpenRouter proxy forwards. The endpoint spends the server's key, so it is not a
 * general proxy: it accepts the body the demo client sends — a curated free model, a short
 * conversation, a temperature, JSON mode — rebuilds it from those fields only, and refuses
 * anything else before OpenRouter sees it.
 */
import { OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODEL } from './models'

/** The demo sends a system prompt (~5 KB) and one user turn; these leave generous room. */
export const MAX_MESSAGES = 8
export const MAX_CONTENT = 16_000

const ROLES = new Set(['system', 'user', 'assistant'])
const MODELS = new Set(OPENROUTER_MODELS.map((m) => m.id))

type Message = { role: string; content: string }
export type UpstreamBody = {
	model: string
	messages: Message[]
	temperature?: number
	response_format?: { type: 'json_object' }
}
export type UpstreamRequest = { body: UpstreamBody } | { problem: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

function message(value: unknown): Message | null {
	if (!isRecord(value) || typeof value.role !== 'string' || !ROLES.has(value.role)) return null
	if (typeof value.content !== 'string' || value.content.length > MAX_CONTENT) return null
	return { role: value.role, content: value.content }
}

function messages(value: unknown): Message[] | string {
	if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES)
		return `"messages" must be 1–${MAX_MESSAGES} messages`
	const parsed = value.map(message)
	if (parsed.some((m) => m === null))
		return `each message must be {role: system|user|assistant, content: string ≤ ${MAX_CONTENT} chars}`
	return parsed as Message[]
}

/** The optional fields: each returns its forwarded value, or a problem string. */
const OPTIONAL: Record<string, (value: unknown) => { value: unknown } | string> = {
	temperature: (v) => (typeof v === 'number' && v >= 0 && v <= 2 ? { value: v } : '"temperature" must be 0–2'),
	response_format: (v) =>
		isRecord(v) && v.type === 'json_object' ? { value: { type: 'json_object' } } : '"response_format" may only be json_object'
}

function optional(body: Record<string, unknown>): Partial<UpstreamBody> | string {
	const out: Record<string, unknown> = {}
	for (const [key, check] of Object.entries(OPTIONAL)) {
		if (body[key] === undefined) continue
		const result = check(body[key])
		if (typeof result === 'string') return result
		out[key] = result.value
	}
	return out
}

/** Rebuild the body OpenRouter receives from the fields the demo uses, or say what is wrong. */
export function upstreamRequest(body: unknown): UpstreamRequest {
	if (!isRecord(body)) return { problem: 'the body must be a JSON object' }
	const model = body.model ?? DEFAULT_OPENROUTER_MODEL
	if (typeof model !== 'string' || !MODELS.has(model))
		return { problem: '"model" must be one of the demo’s free models' }
	const conversation = messages(body.messages)
	if (typeof conversation === 'string') return { problem: conversation }
	const rest = optional(body)
	if (typeof rest === 'string') return { problem: rest }
	return { body: { model, messages: conversation, ...rest } }
}
