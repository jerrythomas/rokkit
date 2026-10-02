/* The LLM as a classifier: one prompt, built from the catalogue, asking for one JSON
 * Interpretation; and a parser that keeps only the fields an Interpretation has. The reply is a
 * proposal — the client validates it like any other reading. The same messages go to OpenRouter
 * (built on the server, which owns the prompt) and to WebLLM (in the browser).
 */
import type { Interpretation, View } from './types'
import { VIEWS } from './types'
import { demoById, propSchemaOf, variantsOf } from './demos'
import type { ScreenSummary } from './systemone'

const DESCRIPTION = 80
const MAX_OPTIONS = 3
const MAX_TOPIC = 200
const DEFAULT_CONFIDENCE = 0.7

export type ChatMessage = { role: 'system' | 'user'; content: string }
export type ClassifierInput = { message: string; screen: ScreenSummary | null; recent: string[]; shortlist: string[] }

const CONTRACT = `You read one message sent to a component-library chat and decide what the chat does next.
Answer with ONE JSON object and nothing else:
{"intent": "show" | "modify" | "reshape" | "explain" | "clarify", "demo": "<id>", "variant": "<id>", "props": {"<name>": <value>}, "view": "table" | "chart" | "list" | "form", "topic": "<text>", "data": [<rows>], "options": [<readings>], "confidence": <0-1>}
- show: the user wants to see a demo; "demo" is an id from DEMOS. For made-up data ("a Q3 sales scenario"), put up to 50 flat rows in "data" with the table, chart or list demo.
- modify: change the demo ON SCREEN with a VARIANT id and/or PROPS values listed below.
- reshape: show the data on screen as another "view".
- explain: a how or why question; "demo" is what it is about, "topic" the question.
- clarify: too vague to act on; give up to 3 "options", each a reading like this one.
Leave out fields you do not need. "confidence" is how sure you are.`

const demoLine = (id: string) => {
	const meta = demoById(id)
	return `- ${id}: ${meta?.title ?? id} — ${(meta?.description ?? '').slice(0, DESCRIPTION)}`
}

function screenLines(screen: ScreenSummary | null): string[] {
	if (!screen) return ['ON SCREEN: nothing (so no modify or reshape)']
	const variants = variantsOf(screen.demo).map((v) => `${v.id} (${v.label})`)
	const props = Object.entries(propSchemaOf(screen.demo)).map(([name, s]) =>
		s.type === 'enum' ? `${name}: ${s.options.join(' | ')}` : `${name}: ${s.type === 'boolean' ? 'true | false' : s.type}`
	)
	return [`ON SCREEN: ${screen.demo}`, `VARIANTS: ${variants.join(', ') || 'none'}`, `PROPS: ${props.join('; ') || 'none'}`]
}

export function classifierMessages({ message, screen, recent, shortlist }: ClassifierInput): ChatMessage[] {
	const system = [CONTRACT, 'DEMOS:', ...shortlist.map(demoLine), ...screenLines(screen)].join('\n')
	const user = [
		...(recent.length ? [`Earlier: ${recent.join(' / ')}`] : []),
		`On screen: ${screen ? `${screen.demo} ${JSON.stringify(screen.props)}` : 'nothing'}`,
		`Message: ${message}`
	].join('\n')
	return [
		{ role: 'system', content: system },
		{ role: 'user', content: user }
	]
}

/**
 * The JSON object in a reply — models wrap it in prose or a fence. From the first `{`, the widest
 * span that parses wins, narrowing one closing brace at a time.
 */
function objectIn(text: string): unknown {
	const start = text.indexOf('{')
	if (start < 0) return null
	for (let end = text.lastIndexOf('}'); end > start; end = text.lastIndexOf('}', end - 1)) {
		try {
			return JSON.parse(text.slice(start, end + 1))
		} catch {
			// Not this span: try the next closing brace in.
		}
	}
	return null
}

const INTENTS = new Set<Interpretation['intent']>(['show', 'modify', 'reshape', 'explain', 'clarify'])
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v: unknown, max = MAX_TOPIC) => (typeof v === 'string' && v ? v.slice(0, max) : undefined)
const clamp = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : DEFAULT_CONFIDENCE)

const optionsOf = (raw: unknown): Interpretation[] | undefined =>
	Array.isArray(raw) ? raw.flatMap((o) => (isRecord(o) ? (reading(o, true) ?? []) : [])).slice(0, MAX_OPTIONS) : undefined

/** The fields of a reading, each kept only if it has the right type. */
function reading(raw: Record<string, unknown>, nested: boolean): Interpretation | null {
	const intent = raw.intent as Interpretation['intent']
	if (!INTENTS.has(intent)) return null
	const fields: Partial<Interpretation> = {
		demo: text(raw.demo, 60),
		variant: text(raw.variant, 60),
		props: isRecord(raw.props) ? raw.props : undefined,
		view: VIEWS.includes(raw.view as View) ? (raw.view as View) : undefined,
		topic: text(raw.topic),
		// Generated data belongs to a show; validate bounds it.
		data: intent === 'show' ? raw.data : undefined,
		options: nested ? undefined : optionsOf(raw.options)
	}
	const kept = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined))
	return { intent, ...kept, confidence: clamp(raw.confidence) }
}

export function parseClassification(reply: string): Interpretation | null {
	const raw = objectIn(reply)
	return isRecord(raw) ? reading(raw, false) : null
}
