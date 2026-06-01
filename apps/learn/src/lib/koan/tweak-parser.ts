/**
 * Chat-driven prop tweak parser. Recognises natural-language commands
 * like "change orientation to vertical" and resolves them against the
 * active demo's prop schema. Returns the canonical { name, value } pair
 * if the request is unambiguous, or null otherwise.
 *
 * Routing happens in /app/+layout.svelte's submitQuery — when this
 * parser matches we apply the tweak directly (no goto, no thinking
 * phase) so the chat-first UX feels responsive: the canvas updates
 * mid-conversation while the chat log captures the diff.
 *
 * Supported phrasings:
 *   - "change <prop> to <value>"
 *   - "set <prop> to <value>"
 *   - "make <prop> <value>"
 *   - "<prop> = <value>"
 *   - "use <value> <prop>" / "switch to <value> <prop>"
 *   - Boolean: "enable <prop>" / "disable <prop>" / "turn <prop> on|off"
 *
 * Value resolution is case-insensitive; booleans accept on/off,
 * true/false, yes/no.
 */
import type { DemoPropSchema } from './types'

export type TweakIntent = { name: string; value: unknown }

const BOOL_TRUE = new Set(['true', 'yes', 'on', '1', 'enable', 'enabled'])
const BOOL_FALSE = new Set(['false', 'no', 'off', '0', 'disable', 'disabled'])

function coerceValue(spec: DemoPropSchema, raw: string): unknown | undefined {
	const r = raw.trim().toLowerCase()
	if (!r) return undefined
	if (spec.type === 'enum') {
		const match = spec.options.find((opt) => opt.toLowerCase() === r)
		return match
	}
	if (spec.type === 'boolean') {
		if (BOOL_TRUE.has(r)) return true
		if (BOOL_FALSE.has(r)) return false
		return undefined
	}
	if (spec.type === 'number') {
		const n = Number(r)
		return Number.isFinite(n) ? n : undefined
	}
	if (spec.type === 'string') return raw.trim()
	return undefined
}

function findPropByName(
	schema: Record<string, DemoPropSchema>,
	candidate: string
): { name: string; spec: DemoPropSchema } | null {
	const c = candidate.trim().toLowerCase()
	if (!c) return null
	// Exact match wins.
	for (const [name, spec] of Object.entries(schema)) {
		if (name.toLowerCase() === c) return { name, spec }
	}
	// Fall back to label match (the human-readable variant) when defined.
	for (const [name, spec] of Object.entries(schema)) {
		if (spec.label && spec.label.toLowerCase() === c) return { name, spec }
	}
	return null
}

/**
 * Run the parser. Returns null when the query doesn't look like a
 * tweak intent OR when the prop/value can't be resolved against the
 * active schema.
 */
export function parseTweakIntent(
	query: string,
	schema: Record<string, DemoPropSchema> | undefined
): TweakIntent | null {
	if (!schema) return null
	const q = query.trim()
	if (!q) return null

	// Pattern 1: "change/set <prop> to <value>" or "make <prop> <value>"
	const setRe = /^(?:change|set)\s+(\S+)\s+to\s+(.+)$/i
	const makeRe = /^make\s+(\S+)\s+(.+)$/i
	// Pattern 2: "<prop> = <value>" or "<prop>: <value>"
	const eqRe = /^(\S+?)\s*[:=]\s*(.+)$/
	// Pattern 3: "enable/disable <prop>" → boolean shortcut
	const toggleRe = /^(enable|disable|turn\s+on|turn\s+off)\s+(.+)$/i
	const turnRe = /^turn\s+(\S+)\s+(on|off)$/i

	let propRaw: string | null = null
	let valueRaw: string | null = null

	let m = q.match(setRe) ?? q.match(makeRe)
	if (m) {
		propRaw = m[1]
		valueRaw = m[2]
	}
	if (!m) m = q.match(turnRe)
	if (m && !propRaw) {
		propRaw = m[1]
		valueRaw = m[2]
	}
	if (!m) m = q.match(toggleRe)
	if (m && !propRaw) {
		const verb = m[1].toLowerCase()
		propRaw = m[2]
		valueRaw = verb.includes('disable') || verb.includes('off') ? 'off' : 'on'
	}
	if (!m) m = q.match(eqRe)
	if (m && !propRaw) {
		propRaw = m[1]
		valueRaw = m[2]
	}

	if (!propRaw || !valueRaw) return null

	const prop = findPropByName(schema, propRaw)
	if (!prop) return null
	const value = coerceValue(prop.spec, valueRaw)
	if (value === undefined) return null
	return { name: prop.name, value }
}
