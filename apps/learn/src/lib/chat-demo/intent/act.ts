/* The intents table. `act` runs a validated interpretation against what is on screen and
 * returns the reply. A reply that changes the screen carries a `demo` block, which IS the
 * next screen (`screenFrom` reads it back).
 */
import type { Block, DemoBlock } from '../types'
import { inferShape, schemaFromRecord } from '../infer'
import type { Interpretation, Screen, View } from './types'
import { chip, chipsFor } from './chips'
import { STARTERS, dataOf, demoById, variantOf } from './demos'
import { bestSection } from './docs'

const demoBlock = (screen: Screen): DemoBlock => ({ kind: 'demo', ...screen })
const prose = (text: string): Block => ({ kind: 'prose', text })
const suggest = (items: ReturnType<typeof chipsFor>, intro = 'Try'): Block => ({ kind: 'suggestions', intro, items })

/** The reply for a new screen: what it is, the screen itself, what to try next. */
const onScreen = (text: string, screen: Screen): Block[] => [prose(text), demoBlock(screen), suggest(chipsFor(screen))]

function describeChange(i: Interpretation, demo: string): string {
	const parts = Object.entries(i.props ?? {}).map(([k, v]) => `${k}: ${String(v)}`)
	const variant = variantOf(demo, i.variant)
	if (variant) parts.unshift(variant.label)
	return `Updated — ${parts.join(', ')}.`
}

/** How a dataset becomes each view, via the same shape inference pasted data goes through. */
const FORCE = { table: 'table', chart: 'chart', list: 'list', form: 'record' } as const

function reshaped(data: unknown, view: View): Screen | null {
	const inf = inferShape(data, FORCE[view])
	if (inf.kind === 'table') return { demo: 'table', props: {}, data: inf.rows }
	if (inf.kind === 'chart') {
		const props = { x: inf.x, y: inf.y, ...(inf.fill ? { fill: inf.fill } : {}) }
		return { demo: 'chart', variant: 'bar', props, data: inf.rows }
	}
	if (inf.kind === 'record') return { demo: 'form', props: { schema: schemaFromRecord(inf.record) }, data: inf.record }
	if (inf.kind === 'list')
		return { demo: 'list', props: {}, data: inf.items.map((it) => (typeof it === 'object' && it !== null ? it : { label: String(it) })) }
	return null
}

const titleOf = (demo: string | undefined) => demoById(demo)?.title ?? demo ?? ''

/** A clarify option's chip text, by what the option would do. */
const LABELS: Record<Interpretation['intent'], (o: Interpretation) => string> = {
	show: (o) => titleOf(o.demo),
	reshape: (o) => `As a ${o.view}`,
	explain: (o) => `How does ${titleOf(o.demo)} work?`,
	modify: (o) => `${titleOf(o.demo)}: ${describeChange(o, o.demo ?? '').replace(/^Updated — |\.$/g, '')}`,
	clarify: () => 'Something else'
}

const labelFor = (o: Interpretation): string => o.label ?? LABELS[o.intent](o)

/** The screen a `show` puts up: the variant's props under the asked-for ones, plus sample data. */
function shown(i: Interpretation): Screen {
	const demo = i.demo as string
	const data = demo === 'chart' ? undefined : dataOf({ demo })
	return {
		demo,
		...(i.variant ? { variant: i.variant } : {}),
		props: { ...variantOf(demo, i.variant)?.props, ...i.props },
		...(data === undefined ? {} : { data })
	}
}

/** The docs section about the topic, or the demo's description when it has no docs. */
function answer(demo: string, topic: string): Block {
	const meta = demoById(demo)
	const section = meta?.docs ? bestSection(meta.docs, topic) : null
	return section ? { kind: 'markdown', markdown: section.body } : prose(meta?.description ?? '')
}

/** The screen a `modify` leaves: a new variant's props, then the asked-for props, over the old. */
function modified(i: Interpretation, now: Screen): Screen {
	const variant = i.variant ?? now.variant
	return {
		...now,
		...(variant ? { variant } : {}),
		props: { ...now.props, ...variantOf(now.demo, i.variant)?.props, ...i.props }
	}
}

type Handler = (i: Interpretation, screen: Screen | null) => Block[]

const INTENTS: Record<Interpretation['intent'], Handler> = {
	show: (i) => onScreen(`**${titleOf(i.demo)}** — ${demoById(i.demo)?.description ?? ''}`, shown(i)),
	modify: (i, screen) => onScreen(describeChange(i, (screen as Screen).demo), modified(i, screen as Screen)),
	reshape: (i, screen) => {
		const data = dataOf(screen as Screen)
		const next = reshaped(data, i.view as View)
		if (!next) return [prose(`That data can’t be shown as a ${i.view}.`)]
		const count = Array.isArray(data) ? `${data.length} rows` : 'data'
		return onScreen(`The same ${count}, as a ${i.view}.`, next)
	},
	explain: (i, screen) => {
		const demo = i.demo as string
		const context = screen?.demo === demo ? screen : { demo, props: {} }
		return [answer(demo, i.topic ?? ''), suggest(chipsFor(context), 'Next')]
	},
	clarify: (i) => {
		if (i.options?.length)
			return [prose('Did you mean one of these?'), suggest(i.options.map((o) => chip(labelFor(o), o)), '')]
		const starters = STARTERS.map((demo) => chip(titleOf(demo), { intent: 'show', demo }))
		return [prose('I’m not sure what to show for that. Here are some places to start:'), suggest(starters, '')]
	}
}

export function act(i: Interpretation, screen: Screen | null): Block[] {
	return INTENTS[i.intent](i, screen)
}
