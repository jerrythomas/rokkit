/* `validate` makes an interpreter's proposal safe to act on. Every demo, variant and prop is
 * checked against the catalogue; whatever does not survive turns the turn into a question
 * back to the user, never a guess. Local search, System One and an LLM all go through here.
 */
import type { DemoPropSchema } from '$lib/koan/types'
import { VIEWS, type Interpretation, type Screen } from './types'
import { dataOf, demoById, propSchemaOf, variantOf } from './demos'

/** Below this confidence the chat asks back (plan open question: tuned from slice 3). */
export const CLARIFY_BELOW = 0.5
const MAX_OPTIONS = 4

const TRUE_WORDS = new Set([true, 'true', 'yes', 'on', '1', 1])
const FALSE_WORDS = new Set([false, 'false', 'no', 'off', '0', 0])

/** One prop value as its schema allows it, or `undefined` when it does not. */
const COERCE: Record<DemoPropSchema['type'], (value: unknown, schema: DemoPropSchema) => unknown> = {
	boolean: (v) => (TRUE_WORDS.has(v as never) ? true : FALSE_WORDS.has(v as never) ? false : undefined),
	enum: (v, s) => (s.type === 'enum' && s.options.includes(String(v)) ? String(v) : undefined),
	string: (v) => (typeof v === 'string' ? v : undefined),
	number: (v, s) => {
		const n = typeof v === 'number' ? v : Number(v)
		if (!Number.isFinite(n) || s.type !== 'number') return undefined
		return Math.min(s.max ?? Infinity, Math.max(s.min ?? -Infinity, n))
	}
}

function validProps(demo: string, props: Record<string, unknown> | undefined): Record<string, unknown> {
	const schema = propSchemaOf(demo)
	const out: Record<string, unknown> = {}
	for (const [name, value] of Object.entries(props ?? {})) {
		const rule = schema[name]
		const coerced = rule ? COERCE[rule.type](value, rule) : undefined
		if (coerced !== undefined) out[name] = coerced
	}
	return out
}

const ask = (options: Interpretation[] = []): Interpretation => ({
	intent: 'clarify',
	confidence: 1,
	...(options.length ? { options } : {})
})

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Any view takes rows; a form also takes the single record it edits. */
const fits = (data: unknown, view: string) => Array.isArray(data) || (view === 'form' && isRecord(data))

/** The view is real and the data — the part asked for, else the screen's — can take it. */
const reshapes = (i: Interpretation, screen: Screen) =>
	Boolean(i.view && VIEWS.includes(i.view) && fits(i.data ?? dataOf(screen), i.view))

/** A reshape keeps its view, a chart kind when it goes into a chart, and the part asked for. */
function reshape(i: Interpretation): Interpretation {
	const variant = i.view === 'chart' && variantOf('chart', i.variant) ? { variant: i.variant } : {}
	const part = i.data === undefined ? {} : { data: i.data }
	return { intent: 'reshape', view: i.view, ...variant, ...part, confidence: i.confidence }
}

/** Demos a show may hand data to: the views a dataset can take. */
const DATA_DEMOS = new Set<string>(VIEWS)
const MAX_ROWS = 200
const MAX_FIELDS = 12

const flat = (v: unknown) =>
	!isRecord(v) || (Object.keys(v).length <= MAX_FIELDS && Object.values(v).every((x) => x === null || typeof x !== 'object'))

/** Data a show can use — at most MAX_ROWS flat rows, or one flat record — else undefined. */
function bounded(data: unknown): unknown {
	if (Array.isArray(data)) return data.length > 0 && data.length <= MAX_ROWS && data.every(flat) ? data : undefined
	return isRecord(data) && flat(data) ? data : undefined
}

/** A show keeps generated data only for a data demo, and only within bounds. */
function withData(i: Interpretation): Interpretation {
	if (i.intent !== 'show' || i.data === undefined) return i
	const data = DATA_DEMOS.has(i.demo as string) ? bounded(i.data) : undefined
	const { data: _, ...rest } = i
	return data === undefined ? rest : { ...rest, data }
}

/** A modify that changes nothing is a question, not a no-op. */
const changes = (g: Interpretation): Interpretation => (g.variant || g.props ? g : ask())

/** Demo, variant and props of a reading, each kept only if the catalogue has it. */
function grounded(i: Interpretation, demo: string): Interpretation {
	const out: Interpretation = { ...i, demo }
	if (!variantOf(demo, i.variant)) delete out.variant
	const props = validProps(demo, i.props)
	if (Object.keys(props).length) out.props = props
	else delete out.props
	return out
}

/** Each intent's own requirement, given the demo it resolved to. */
const CHECKS: Record<Interpretation['intent'], (i: Interpretation, screen: Screen | null) => Interpretation> = {
	show: (i) => (demoById(i.demo) ? withData(grounded(i, i.demo as string)) : ask()),
	modify: (i, screen) => {
		const demo = i.demo ?? screen?.demo
		if (!demoById(demo)) return ask()
		// Modifying something not on screen is showing it with those changes.
		if (screen?.demo !== demo) return CHECKS.show({ ...i, intent: 'show', demo }, screen)
		return changes(grounded(i, demo as string))
	},
	reshape: (i, screen) => (screen && reshapes(i, screen) ? reshape(i) : ask()),
	explain: (i, screen) => {
		const demo = i.demo ?? screen?.demo
		return demoById(demo) ? { intent: 'explain', demo, topic: i.topic ?? '', confidence: i.confidence } : ask()
	},
	clarify: (i, screen) => ask(options(i.options, screen))
}

function options(list: Interpretation[] | undefined, screen: Screen | null): Interpretation[] {
	const seen = new Set<string>()
	return (list ?? [])
		.map((o) => validate({ ...o, confidence: 1, options: undefined }, screen))
		.filter((o) => {
			const key = JSON.stringify([o.intent, o.demo, o.variant, o.props, o.view])
			if (o.intent === 'clarify' || seen.has(key)) return false
			seen.add(key)
			return true
		})
		.slice(0, MAX_OPTIONS)
}

export function validate(i: Interpretation, screen: Screen | null): Interpretation {
	const check = CHECKS[i.intent]
	if (!check) return ask()
	// The reading and its runners-up become the choices offered back.
	if (i.intent !== 'clarify' && i.confidence < CLARIFY_BELOW) return ask(options([i, ...(i.options ?? [])], screen))
	return check(i, screen)
}
