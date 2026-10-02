/* The System One interpreter's two halves: the questions the chat asks Ollama's
 * `/v1/systemone` about a message, and how its answers become an Interpretation.
 *
 * Everything is built from the catalogue — the demo choice from a search shortlist (System One
 * takes 2–26 options), the prop questions from the screen demo's prop schema — so nothing
 * here is written per demo. The answers are a proposal; the client validates them as usual.
 */
import { miniIndex } from '$lib/koan/catalog'
import type { DemoPropSchema } from '$lib/koan/types'
import type { Interpretation, View } from './types'
import { STARTERS, demoById, propSchemaOf, variantsOf } from './demos'
import { topicOf } from './local'
import { CLARIFY_BELOW } from './validate'

/** System One's limit on the options of one choice question. */
export const MAX_OPTIONS = 26
const SHORTLIST = 12
const DESCRIPTION = 160
const OPTIONS_OFFERED = 3

/** What the server is told about the screen: never its data, which stays in the browser. */
export type ScreenSummary = { demo: string; variant?: string; props: Record<string, unknown> }

export type Question = { type: 'choice'; instructions: string; criteria: Record<string, string> }
export type Answer =
	| { type: 'choice'; choice: string; confidence: number; probabilities: Record<string, number> }
	| { type: 'noul'; noul: number }

const INTENTS: Record<Interpretation['intent'], string> = {
	show: 'Wants to see a component or demo: names or describes one',
	modify: 'Wants to change the demo already on screen: a setting, style or option',
	reshape: 'Wants the data on screen shown as a different view: a table, chart, list or form',
	explain: 'Asks how something works, why, or how to use it',
	clarify: 'Too vague to act on, or not about components'
}
const ON_SCREEN_ONLY = new Set(['modify', 'reshape'])

const VIEWS: Record<View, string> = {
	table: 'As a table of rows and columns',
	chart: 'As a chart or plot',
	list: 'As a list of items',
	form: 'As an editable form'
}

/** The demos to choose between: search hits, the one on screen, and starters to fill out. */
export function shortlistFor(message: string, screen: ScreenSummary | null): string[] {
	const hits = miniIndex.search(message).slice(0, SHORTLIST).map((h) => String(h.id))
	const ids = new Set([...hits, ...(screen ? [screen.demo] : [])])
	if (ids.size < 2) STARTERS.forEach((id) => ids.add(id))
	return [...ids].slice(0, MAX_OPTIONS)
}

const describe = (id: string) => {
	const meta = demoById(id)
	return `${meta?.title ?? id}: ${meta?.description ?? ''}`.slice(0, DESCRIPTION)
}

const ask = (instructions: string, criteria: Record<string, string>): Question => ({ type: 'choice', instructions, criteria })

/** A question per prop the screen demo's schema can enumerate: an enum's options, on/off. */
const PROP_QUESTIONS: Partial<Record<DemoPropSchema['type'], (name: string, s: DemoPropSchema) => Record<string, string>>> = {
	enum: (name, s) => (s.type === 'enum' ? Object.fromEntries(s.options.map((o) => [o, `${name} = ${o}`])) : {}),
	boolean: (name, s) => ({ on: `Turn ${s.label ?? name} on`, off: `Turn ${s.label ?? name} off` })
}

function screenQuestions(screen: ScreenSummary): Record<string, Question> {
	const out: Record<string, Question> = {
		view: ask('If the user wants the data shown another way, which view?', VIEWS)
	}
	const variants = variantsOf(screen.demo)
	if (variants.length)
		out.variant = ask('Does the message ask for one of these variants of the demo on screen? If not, none.', {
			none: 'The message does not ask for a variant',
			...Object.fromEntries(variants.map((v) => [v.id, v.label]))
		})
	for (const [name, schema] of Object.entries(propSchemaOf(screen.demo))) {
		const criteria = PROP_QUESTIONS[schema.type]?.(name, schema)
		// Asked as "does the message change it?", with `unchanged` first: asked "what should it
		// become?", nimble read "smaller" as lineStyle = none (measured 2026-10-02).
		if (criteria)
			out[`prop:${name}`] = ask(
				`Does the message ask to change "${name}" (${schema.desc ?? 'a setting'})? If so, to what; if not, unchanged.`,
				{ unchanged: `The message does not mention ${name}`, ...criteria }
			)
	}
	return out
}

export function questionsFor(message: string, screen: ScreenSummary | null, shortlist: string[]): Record<string, Question> {
	const intents = Object.entries(INTENTS).filter(([intent]) => screen || !ON_SCREEN_ONLY.has(intent))
	return {
		intent: ask('What does the user want the chat to do next?', Object.fromEntries(intents)),
		demo: ask('Which demo is the message about?', Object.fromEntries(shortlist.map((id) => [id, describe(id)]))),
		...(screen ? screenQuestions(screen) : {})
	}
}

const chosen = (a: Answer | undefined) => (a?.type === 'choice' ? a.choice : undefined)

/** The answer's options, most likely first. */
const likeliest = (a: Answer | undefined, n: number) =>
	a?.type === 'choice'
		? Object.entries(a.probabilities)
				.sort(([, p], [, q]) => q - p)
				.slice(0, n)
				.map(([id]) => id)
		: []

const PROP_VALUE: Record<string, (answer: string) => unknown> = {
	boolean: (a) => a === 'on',
	enum: (a) => a
}

/** How sure System One must be of a prop's answer for the chat to act on it. */
const PROP_SURE = 0.6

/** A variant only when the answer is sure and not "none". */
const variantFrom = (a: Answer | undefined) => sureChoice(a, 'none')

/** The answer's choice when it is sure and not the "leave it" option, else undefined. */
function sureChoice(a: Answer | undefined, leave: string): string | undefined {
	if (a?.type !== 'choice' || a.choice === leave) return undefined
	return (a.probabilities[a.choice] ?? 0) >= PROP_SURE ? a.choice : undefined
}

/** Props whose answer is sure, not "unchanged", and not what the screen already has. */
function propsFrom(answers: Record<string, Answer>, screen: ScreenSummary): Record<string, unknown> {
	const props: Record<string, unknown> = {}
	for (const [name, schema] of Object.entries(propSchemaOf(screen.demo))) {
		const answer = sureChoice(answers[`prop:${name}`], 'unchanged')
		const value = answer === undefined ? undefined : PROP_VALUE[schema.type]?.(answer)
		if (value !== undefined && value !== screen.props[name]) props[name] = value
	}
	return props
}

const offered = (a: Record<string, Answer>): Interpretation[] =>
	likeliest(a.demo, OPTIONS_OFFERED).map((demo) => ({ intent: 'show', demo, confidence: 1 }))

type Reader = (answers: Record<string, Answer>, message: string, screen: ScreenSummary | null, confidence: number) => Interpretation

const READERS: Record<Interpretation['intent'], Reader> = {
	show: (a, _, __, confidence) => ({ intent: 'show', demo: chosen(a.demo), confidence }),
	modify: (a, _, screen, confidence) => {
		const now = screen ?? { demo: '', props: {} }
		const variant = variantFrom(a.variant)
		return { intent: 'modify', demo: now.demo, ...(variant ? { variant } : {}), props: propsFrom(a, now), confidence }
	},
	reshape: (a, _, __, confidence) => ({ intent: 'reshape', view: chosen(a.view) as View, confidence }),
	explain: (a, message, screen, confidence) => {
		const sure = a.demo?.type === 'choice' && a.demo.probabilities[a.demo.choice] >= 0.5
		return { intent: 'explain', demo: sure ? chosen(a.demo) : (screen?.demo ?? chosen(a.demo)), topic: topicOf(message), confidence }
	},
	clarify: (a) => ({ intent: 'clarify', confidence: 1, options: offered(a) })
}

export function fromAnswers(answers: Record<string, Answer>, message: string, screen: ScreenSummary | null): Interpretation {
	const intent = (chosen(answers.intent) ?? 'clarify') as Interpretation['intent']
	const confidence = answers.intent?.type === 'choice' ? answers.intent.confidence : 0
	const reading = (READERS[intent] ?? READERS.clarify)(answers, message, screen, confidence)
	// Unsure readings carry the runners-up, so the question back offers them.
	return reading.intent !== 'clarify' && confidence < CLARIFY_BELOW ? { ...reading, options: offered(answers) } : reading
}
