/* The local interpreter: simulated mode, and the fallback for every other mode. No network.
 *
 * Generic cue words pick the intent ("how…" explains, "as a table" reshapes); the catalogue
 * search picks the demo; the screen demo's own prop schema and variants pick a change. The
 * only vocabulary written here is the cue words and the chart kinds — never a demo's words.
 */
import { miniIndex } from '$lib/koan/catalog'
import type { DemoPropSchema } from '$lib/koan/types'
import type { Interpretation, Screen, View } from './types'
import { CHART_KINDS, catalog, dataOf, propSchemaOf, variantsOf } from './demos'

const STOP = new Set(['a', 'an', 'the', 'it', 'me', 'my', 'to', 'of', 'on', 'in', 'with', 'and', 'please', 'make', 'show', 'now', 'can', 'you', 'i', 'do', 'is', 'some', 'this', 'that'])

/** Crude stems, enough that "stripes", "striped" and "stripe" meet. */
const stem = (word: string) => word.replace(/(ing|es|ed|s)$/, '')
const stems = (text: string) => new Set((text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP.has(w)).map(stem))
/** The share of a phrase's words the message contains. */
const overlap = (said: Set<string>, phrase: string) => {
	const want = [...stems(phrase)]
	return want.length ? want.filter((w) => said.has(w)).length / want.length : 0
}

const EXPLAIN = /^(how|why|what|explain|describe|tell me)\b|\bhow (do|does|can|would|to)\b|\bwhat (is|are|does)\b/i
const NEGATE = /\b(no|not|without|remove|hide|disable|drop|turn off|un\w+)\b/i
/** "edit this row", "open the selected item" — a reference to what the user selected. */
const SELECTION = /\b(this|that|the|selected)\s+(row|item|one|record|entry|group)\b|\b(edit|open) (this|that|it)\b|\bselected\b/i
const OPENS = /\b(open|expand|inside|children)\b/i
const REFERS = /\b(as|into|same|that|this|it|them|those)\b/i
const VIEW_WORDS: [RegExp, View][] = [
	[/\btables?\b/i, 'table'],
	[/\b(charts?|graphs?|plots?)\b/i, 'chart'],
	[/\blists?\b/i, 'list'],
	[/\bforms?\b/i, 'form']
]
const CHART_WORDS: Record<string, RegExp> = {
	pie: /\b(pie|donut|doughnut)\b/i,
	line: /\bline\b/i,
	area: /\barea\b/i,
	scatter: /\bscatter\b/i,
	bubble: /\bbubbles?\b/i,
	box: /\bbox\b/i,
	violin: /\bviolins?\b/i,
	grouped: /\bgrouped\b/i,
	bar: /\bbars?\b/i
}

const chartKind = (text: string) => Object.keys(CHART_WORDS).find((k) => k in CHART_KINDS && CHART_WORDS[k].test(text))
const viewIn = (text: string) => VIEW_WORDS.find(([re]) => re.test(text))?.[1]

/**
 * A demo the message names outright, by id ("tabs", "date picker"). When it names several, the
 * first named is the subject ("a form with dropdowns" is a form); at the same spot the longer
 * id wins ("tree table" is tree-table, not tree).
 */
function named(text: string): string | undefined {
	const said = ` ${[...stems(text)].join(' ')} `
	return catalog
		.map((d) => ({ id: d.id, at: said.indexOf(` ${[...stems(d.id.replace(/-/g, ' '))].join(' ')} `) }))
		.filter((m) => m.at >= 0)
		.sort((a, b) => a.at - b.at || b.id.length - a.id.length)[0]?.id
}

/** What the message sets a prop to, by the prop's type: an option it says, a boolean it names. */
const PROP_SAID: Partial<Record<DemoPropSchema['type'], (text: string, said: Set<string>, name: string, s: DemoPropSchema) => unknown>> = {
	enum: (_, said, __, s) => (s.type === 'enum' ? s.options.find((o) => said.has(stem(o.toLowerCase()))) : undefined),
	boolean: (text, said, name, s) =>
		overlap(said, name) === 1 || overlap(said, s.label ?? '') === 1 ? !NEGATE.test(text) : undefined
}

/** The screen demo's props this message sets. */
function propsSaid(text: string, demo: string): Record<string, unknown> {
	const said = stems(text)
	const props: Record<string, unknown> = {}
	for (const [name, schema] of Object.entries(propSchemaOf(demo))) {
		const value = PROP_SAID[schema.type]?.(text, said, name, schema)
		if (value !== undefined) props[name] = value
	}
	return props
}

const variantSaid = (text: string, demo: string) =>
	variantsOf(demo).find((v) => overlap(stems(text), v.label) >= 0.6 || overlap(stems(text), v.id.replace(/-/g, ' ')) === 1)?.id

/** A show from the catalogue search; confidence is how far the best hit leads the next. */
function searched(text: string): Interpretation {
	const hits = miniIndex.search(text).slice(0, 3)
	if (hits.length === 0) return { intent: 'clarify', confidence: 1 }
	const lead = hits[1] ? 1 - hits[1].score / hits[0].score : 0.5
	const options = hits.map((h): Interpretation => ({ intent: 'show', demo: String(h.id), confidence: 1 }))
	return { intent: 'show', demo: String(hits[0].id), confidence: 0.3 + 0.8 * lead, options }
}

/** Topic words for `explain`: the question without its cue and filler words. */
export const topicOf = (text: string) => [...stems(text.replace(EXPLAIN, ''))].join(' ')

/** The data on screen can become that view (and is not already it). */
const reshapeable = (screen: Screen, view: View) => view !== screen.demo && Array.isArray(dataOf(screen))

/** The message is about some other demo than the one on screen. */
function namesAnother(text: string, screen: Screen): boolean {
	const demo = named(text)
	return Boolean(demo) && demo !== screen.demo
}

/** A change to the screen demo: a variant or chart kind it names, and props it sets. */
function changeSaid(text: string, demo: string): Interpretation | null {
	const props = propsSaid(text, demo)
	// "remove the stripes" turns a prop off; it must not switch on the variant named after it.
	const variant = NEGATE.test(text) ? undefined : (variantSaid(text, demo) ?? (demo === 'chart' ? chartKind(text) : undefined))
	if (!variant && Object.keys(props).length === 0) return null
	return { intent: 'modify', demo, ...(variant ? { variant } : {}), props, confidence: 0.9 }
}

type Reading = (text: string, screen: Screen | null) => Interpretation | null

/** A reference to the selection: open a group it names, else edit the selected record. */
function aboutSelection(text: string, screen: Screen | null): Interpretation | null {
	const item = screen?.selected
	if (!item || typeof item !== 'object' || !SELECTION.test(text)) return null
	const children = (item as { children?: unknown }).children
	if (OPENS.test(text) && Array.isArray(children)) return { intent: 'reshape', view: 'list', data: children, confidence: 0.9 }
	return { intent: 'reshape', view: 'form', data: item, confidence: 0.9 }
}

/** Tried in order; the first that recognises the message wins. */
const READINGS: Reading[] = [
	aboutSelection,
	(text, screen) => {
		if (!EXPLAIN.test(text)) return null
		const demo = named(text) ?? screen?.demo
		return demo ? { intent: 'explain', demo, topic: topicOf(text), confidence: 0.9 } : null
	},
	(text, screen) => {
		const view = viewIn(text)
		if (!screen || !view || !REFERS.test(text) || !reshapeable(screen, view)) return null
		const variant = view === 'chart' ? chartKind(text) : undefined
		return { intent: 'reshape', view, ...(variant ? { variant } : {}), confidence: 0.9 }
	},
	(text, screen) => (screen && !namesAnother(text, screen) ? changeSaid(text, screen.demo) : null),
	(text) => {
		const kind = chartKind(text)
		return kind && viewIn(text) === 'chart' ? { intent: 'show', demo: 'chart', variant: kind, confidence: 0.9 } : null
	},
	(text) => {
		const demo = named(text)
		return demo ? { intent: 'show', demo, confidence: 0.9 } : null
	}
]

/**
 * A reading of a message the interpreter recognises outright — a named demo, a prop or variant
 * word, a reshape or explain cue — or null when it would only be guessing from search.
 */
export function readDirectly(message: string, screen: Screen | null): Interpretation | null {
	const text = message.trim()
	for (const reading of READINGS) {
		const found = reading(text, screen)
		if (found) return found
	}
	return null
}

export function interpretLocally(message: string, screen: Screen | null): Interpretation {
	return readDirectly(message, screen) ?? searched(message.trim())
}
