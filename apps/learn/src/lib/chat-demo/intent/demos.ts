/* The chat's view of the Koan catalogue. The catalogue is the action space: a demo the
 * catalogue has, the chat can show; a prop its schema declares, the chat can change. This
 * module adds only what the chat needs on top — the chart kinds as variants, sample data, and
 * which demos exist only inside the /app layout.
 */
import { catalog, findById, routeFor } from '$lib/koan/catalog'
import type { DemoMeta, DemoPropSchema, DemoVariant } from '$lib/koan/types'
import {
	AREA_CHART_SPEC,
	BOX_PLOT_SPEC,
	BUBBLE_CHART_SPEC,
	CHART_SPEC,
	LINE_CHART_SPEC,
	PIE_CHART_SPEC,
	PRODUCTS,
	REVENUE_BY_PRODUCT,
	SCATTER_PLOT_SPEC,
	SETTINGS_MENU_ITEMS,
	SIGNUP_DATA,
	SIGNUP_SCHEMA,
	VIOLIN_PLOT_SPEC
} from './samples'

export type ChartKind = {
	label: string
	geoms: Record<string, unknown>[]
	/** The spec drawn when the chart carries no data of its own. */
	sample: Record<string, unknown>
}

const GROUPED_SPEC = { ...CHART_SPEC, title: 'Revenue by product', data: REVENUE_BY_PRODUCT, fill: 'product', legend: true }

/** The chart demo's kinds. Each is a variant of `chart`, so "as a pie" is a modify. */
export const CHART_KINDS: Record<string, ChartKind> = {
	bar: { label: 'Bar chart', geoms: [{ type: 'bar' }], sample: CHART_SPEC },
	grouped: { label: 'Grouped bars', geoms: [{ type: 'bar' }], sample: GROUPED_SPEC },
	line: { label: 'Line chart', geoms: [{ type: 'line' }], sample: LINE_CHART_SPEC },
	area: { label: 'Area chart', geoms: AREA_CHART_SPEC.geoms, sample: AREA_CHART_SPEC },
	pie: { label: 'Pie chart', geoms: PIE_CHART_SPEC.geoms, sample: PIE_CHART_SPEC },
	scatter: { label: 'Scatter plot', geoms: [{ type: 'point' }], sample: SCATTER_PLOT_SPEC },
	bubble: { label: 'Bubble chart', geoms: BUBBLE_CHART_SPEC.geoms, sample: BUBBLE_CHART_SPEC },
	box: { label: 'Box plot', geoms: [{ type: 'box' }], sample: BOX_PLOT_SPEC },
	violin: { label: 'Violin plot', geoms: [{ type: 'violin' }], sample: VIOLIN_PLOT_SPEC }
}

/** Demos the chat draws inline with sample data, as the tool its inline renderer knows. */
export const SAMPLES: Record<string, { tool: string; data: unknown; props: Record<string, unknown> }> = {
	table: { tool: 'mount_table', data: PRODUCTS, props: {} },
	// `value` is seeded for the same reason the /app/list demo seeds it: a collapsible List
	// with no active value expands nothing.
	list: { tool: 'mount_list', data: SETTINGS_MENU_ITEMS, props: { collapsible: true, value: 'profile' } },
	form: { tool: 'mount_form', data: SIGNUP_DATA, props: { schema: SIGNUP_SCHEMA } }
}

/**
 * Demos whose `load()` is a placeholder: the /app layout draws them with its own canvas code,
 * so the chat links to their page. (table, list and form are drawn from SAMPLES instead.)
 */
export const CANVAS_ONLY = new Set(['combo', 'multi-select', 'stepper', 'date-picker', 'select', 'tree', 'tree-table'])

/** Props the chat can change beyond a demo's own schema. */
const EXTRA_PROPS: Record<string, Record<string, DemoPropSchema>> = {
	chart: { stack: { type: 'boolean', default: false, label: 'Stacked', desc: 'Stack the series' } }
}

export const demoById = (id: string | undefined): DemoMeta | undefined => (id ? findById(id) : undefined)

export function variantsOf(id: string): DemoVariant[] {
	if (id === 'chart')
		return Object.entries(CHART_KINDS).map(([kind, { label }]) => ({ id: kind, label, mode: 'dynamic' }))
	return demoById(id)?.variants ?? []
}

export const variantOf = (id: string, variant: string | undefined): DemoVariant | undefined =>
	variant ? variantsOf(id).find((v) => v.id === variant) : undefined

export const propSchemaOf = (id: string): Record<string, DemoPropSchema> => ({
	...demoById(id)?.props,
	...EXTRA_PROPS[id]
})

/** A dataset the demo can be reshaped from: its own on screen, or its sample. */
export function dataOf(screen: { demo: string; data?: unknown; variant?: string }): unknown {
	if (screen.data !== undefined) return screen.data
	if (screen.demo === 'chart') return CHART_KINDS[screen.variant ?? 'bar']?.sample.data
	return SAMPLES[screen.demo]?.data
}

export const hrefOf = (id: string): string => routeFor(id) ?? `/app/${id}`

/** A few demos to offer when the chat has nothing better to suggest. */
export const STARTERS = ['table', 'chart', 'form', 'tabs', 'list'] as const

export { catalog }
