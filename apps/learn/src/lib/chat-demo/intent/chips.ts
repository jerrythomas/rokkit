/* Follow-up chips, generated from the catalogue data of whatever is on screen: its variants,
 * its prop schema, the views its data can take, and its docs. Nothing is written per demo,
 * and each chip carries a ready intent — clicking one is `act`, never text matched again.
 */
import type { DemoPropSchema } from '$lib/koan/types'
import type { SuggestionItem } from '../types'
import type { Interpretation, Screen, View } from './types'
import { dataOf, demoById, propSchemaOf, variantsOf } from './demos'

const MAX_CHIPS = 8
const MAX_ENUM_CHIPS = 3

export const chip = (label: string, interpretation: Omit<Interpretation, 'confidence'>): SuggestionItem => ({
	label,
	query: label,
	action: { kind: 'intent', interpretation: { ...interpretation, confidence: 1 } }
})

const humanise = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

function variantChips(screen: Screen): SuggestionItem[] {
	return variantsOf(screen.demo)
		.filter((v) => v.id !== screen.variant)
		.map((v) => chip(v.label, { intent: 'modify', demo: screen.demo, variant: v.id }))
}

/** A chip per value the prop could change to: the flip of a boolean, the other enum options. */
const PROP_CHIPS: Partial<Record<DemoPropSchema['type'], (name: string, s: DemoPropSchema, now: unknown, demo: string) => SuggestionItem[]>> = {
	boolean: (name, s, now, demo) => {
		const next = !(now ?? s.default)
		return [chip(`${s.label ?? humanise(name)}: ${next ? 'on' : 'off'}`, { intent: 'modify', demo, props: { [name]: next } })]
	},
	enum: (name, s, now, demo) =>
		s.type === 'enum'
			? s.options
					.filter((o) => o !== (now ?? s.default))
					.slice(0, MAX_ENUM_CHIPS)
					.map((o) => chip(`${s.label ?? humanise(name)}: ${o}`, { intent: 'modify', demo, props: { [name]: o } }))
			: []
}

function propChips(screen: Screen): SuggestionItem[] {
	return Object.entries(propSchemaOf(screen.demo)).flatMap(
		([name, schema]) => PROP_CHIPS[schema.type]?.(name, schema, screen.props[name], screen.demo) ?? []
	)
}

/** Rows can be a table or a chart; any array can be a list. */
function viewsFor(data: unknown): View[] {
	if (!Array.isArray(data) || data.length === 0) return []
	const rows = data.every((d) => typeof d === 'object' && d !== null && !Array.isArray(d))
	return rows ? ['table', 'chart'] : ['list']
}

function reshapeChips(screen: Screen): SuggestionItem[] {
	return viewsFor(dataOf(screen))
		.filter((view) => view !== screen.demo)
		.map((view) => chip(`As a ${view}`, { intent: 'reshape', view }))
}

export function chipsFor(screen: Screen): SuggestionItem[] {
	const title = demoById(screen.demo)?.title ?? screen.demo
	const explain = chip(`How does ${title} work?`, { intent: 'explain', demo: screen.demo, topic: '' })
	const rest = [...reshapeChips(screen), ...variantChips(screen), ...propChips(screen)]
	return [...rest.slice(0, MAX_CHIPS - 1), explain]
}
