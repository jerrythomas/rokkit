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

/**
 * One coercer per prop type. `r` is the lowercased/trimmed value (what the enum
 * and boolean vocabularies match against); `raw` is the original, which `string`
 * uses so casing typed by the user survives.
 */
const COERCERS: Record<
	string,
	(spec: DemoPropSchema, r: string, raw: string) => unknown | undefined
> = {
	enum: (spec, r) => spec.options.find((opt) => opt.toLowerCase() === r),
	boolean: (_spec, r) => (BOOL_TRUE.has(r) ? true : BOOL_FALSE.has(r) ? false : undefined),
	number: (_spec, r) => (Number.isFinite(Number(r)) ? Number(r) : undefined),
	string: (_spec, _r, raw) => raw.trim()
}

function coerceValue(spec: DemoPropSchema, raw: string): unknown | undefined {
	const r = raw.trim().toLowerCase()
	if (!r) return undefined
	// hasOwn, not a bare lookup: an unrecognised type must fall through to
	// undefined rather than reaching an inherited Object key.
	return Object.hasOwn(COERCERS, spec.type) ? COERCERS[spec.type](spec, r, raw) : undefined
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
type RawTweak = { prop: string; value: string }

/** A phrasing whose first two capture groups are the prop and the value. */
const twoGroups = (re: RegExp) => (q: string): RawTweak | null => {
	const m = q.match(re)
	return m ? { prop: m[1], value: m[2] } : null
}

/**
 * Accepted phrasings, in PRECEDENCE order — the first match wins, which is what
 * the original cascade of `if (!m) m = q.match(...)` expressed. Order matters:
 * "turn on debug" must reach the enable/disable shortcut rather than the
 * `turn <prop> on|off` form, which requires the on/off word at the end.
 */
const PATTERNS: Array<(q: string) => RawTweak | null> = [
	// "change <prop> to <value>" / "set <prop> to <value>"
	twoGroups(/^(?:change|set)\s+(\S+)\s+to\s+(.+)$/i),
	// "make <prop> <value>"
	twoGroups(/^make\s+(\S+)\s+(.+)$/i),
	// "turn <prop> on|off"
	twoGroups(/^turn\s+(\S+)\s+(on|off)$/i),
	// "enable|disable|turn on|turn off <prop>" → boolean shortcut
	(q) => {
		const m = q.match(/^(enable|disable|turn\s+on|turn\s+off)\s+(.+)$/i)
		if (!m) return null
		const verb = m[1].toLowerCase()
		return { prop: m[2], value: verb.includes('disable') || verb.includes('off') ? 'off' : 'on' }
	},
	// "<prop> = <value>" / "<prop>: <value>"
	twoGroups(/^(\S+?)\s*[:=]\s*(.+)$/)
]

/** The first phrasing that matches `q`, or null when none do. */
function firstPattern(q: string): RawTweak | null {
	for (const pattern of PATTERNS) {
		const hit = pattern(q)
		if (hit) return hit
	}
	return null
}

export function parseTweakIntent(
	query: string,
	schema: Record<string, DemoPropSchema> | undefined
): TweakIntent | null {
	if (!schema) return null
	const q = query.trim()
	if (!q) return null

	const hit = firstPattern(q)
	if (!hit) return null

	const prop = findPropByName(schema, hit.prop)
	if (!prop) return null
	const value = coerceValue(prop.spec, hit.value)
	return value === undefined ? null : { name: prop.name, value }
}
