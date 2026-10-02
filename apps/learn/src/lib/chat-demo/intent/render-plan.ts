/* A `demo` block says WHAT is on screen; `renderPlan` decides HOW the chat draws it. */
import type { DemoBlock } from '../types'
import { CANVAS_ONLY, CHART_KINDS, SAMPLES, hrefOf, variantOf } from './demos'

export type RenderPlan =
	| { kind: 'inline'; tool: string; props: Record<string, unknown> }
	| { kind: 'plot'; spec: Record<string, unknown> }
	| { kind: 'live'; demo: string; props: Record<string, unknown> }
	| { kind: 'card'; demo: string; href: string }

/** The channels a chart reads from its props; the rest are drawing options. */
const CHANNELS = ['x', 'y', 'fill', 'color', 'size'] as const

/** The chart's channels from its props. A pie has no x: its slices are the category on x. */
function channelsOf(block: DemoBlock): Record<string, unknown> {
	const channels: Record<string, unknown> = Object.fromEntries(
		CHANNELS.filter((c) => block.props[c] !== undefined).map((c) => [c, block.props[c]])
	)
	if (block.variant === 'pie' && !channels.fill) channels.fill = channels.x
	return channels
}

/** Kinds that draw one point per x per series: duplicates would zigzag the line between them. */
const ONE_POINT_PER_X = new Set(['line', 'area'])

/** Rows summed by x and series (fill or colour), first-seen order — one point per x per series. */
function summed(rows: unknown[], channels: Record<string, unknown>): unknown[] {
	const { x, y } = channels
	const series = channels.fill ?? channels.color
	if (typeof x !== 'string' || typeof y !== 'string') return rows
	const groups = new Map<string, Record<string, unknown>>()
	for (const row of rows as Record<string, unknown>[]) {
		const key = JSON.stringify([row[x], typeof series === 'string' ? row[series] : null])
		const seen = groups.get(key)
		if (seen) seen[y] = Number(seen[y]) + Number(row[y])
		else groups.set(key, { ...row })
	}
	return [...groups.values()]
}

const stacking = (props: Record<string, unknown>) => (props.stack ? { stack: props.stack } : {})

function chartPlan(block: DemoBlock): RenderPlan {
	const kind = CHART_KINDS[block.variant ?? 'bar'] ?? CHART_KINDS.bar
	if (!Array.isArray(block.data)) return { kind: 'plot', spec: { ...kind.sample, ...stacking(block.props) } }
	const channels = channelsOf(block)
	return {
		kind: 'plot',
		spec: {
			data: ONE_POINT_PER_X.has(block.variant ?? '') ? summed(block.data, channels) : block.data,
			...channels,
			geoms: kind.geoms,
			height: 260,
			grid: block.variant !== 'pie',
			legend: Boolean(channels.fill ?? channels.color),
			...stacking(block.props)
		}
	}
}

/** The inline renderer's data prop is `data` for a table or form and `items` for a list. */
const DATA_PROP: Record<string, string> = { mount_table: 'data', mount_form: 'data', mount_list: 'items' }

export function renderPlan(block: DemoBlock): RenderPlan {
	if (block.demo === 'chart') return chartPlan(block)
	const sample = SAMPLES[block.demo]
	if (sample) {
		const data = block.data ?? sample.data
		return { kind: 'inline', tool: sample.tool, props: { ...sample.props, ...block.props, [DATA_PROP[sample.tool]]: data } }
	}
	if (CANVAS_ONLY.has(block.demo)) return { kind: 'card', demo: block.demo, href: hrefOf(block.demo) }
	return { kind: 'live', demo: block.demo, props: { ...variantOf(block.demo, block.variant)?.props, ...block.props } }
}
