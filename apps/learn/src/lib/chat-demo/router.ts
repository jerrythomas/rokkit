/**
 * Mock query router — Phase 1 of the inline chat demo.
 *
 * `routeQuery(query)` returns a `Block[]` synchronously (with a small fake
 * delay shimmed by the caller). The intent is the same shape we'd get from
 * an LLM tool-call response: pick a tool from the catalog, fill in props,
 * wrap with prose + suggestions.
 *
 * Phase 2 replaces this with an in-browser LLM (web-llm / transformers.js)
 * that takes the catalog's `tool[]` definitions and returns the same
 * Block[] structure. The renderer doesn't change.
 */
import type { Block } from './types'
import { inferShape, schemaFromRecord, type FieldSummary, type Inference } from './infer'

type Route = {
	id: string
	keywords: RegExp
	build: (query: string) => Block[]
}

/**
 * Plot/chart specs for the scripted demo routes, one per route id.
 * Hoisted out of their `build` closures: each is a fixture, not logic, and
 * inline they made every build method longer than it had any reason to be.
 */

/** `line-chart` route. */
const LINE_CHART_SPEC = {
	title: 'Monthly revenue · trends by product',
	data: [
		{ month: 'Jan', product: 'Pro', revenue: 80 },
		{ month: 'Feb', product: 'Pro', revenue: 92 },
		{ month: 'Mar', product: 'Pro', revenue: 110 },
		{ month: 'Apr', product: 'Pro', revenue: 105 },
		{ month: 'May', product: 'Pro', revenue: 128 },
		{ month: 'Jun', product: 'Pro', revenue: 145 },
		{ month: 'Jan', product: 'Lite', revenue: 30 },
		{ month: 'Feb', product: 'Lite', revenue: 38 },
		{ month: 'Mar', product: 'Lite', revenue: 42 },
		{ month: 'Apr', product: 'Lite', revenue: 50 },
		{ month: 'May', product: 'Lite', revenue: 48 },
		{ month: 'Jun', product: 'Lite', revenue: 55 }
	],
	x: 'month',
	y: 'revenue',
	color: 'product',
	legend: true,
	geoms: [{ type: 'line' }],
	height: 240,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `area-chart` route. */
const AREA_CHART_SPEC = {
	title: 'Monthly revenue · stacked area',
	data: [
		{ month: 'Jan', product: 'Pro', revenue: 80 },
		{ month: 'Feb', product: 'Pro', revenue: 92 },
		{ month: 'Mar', product: 'Pro', revenue: 110 },
		{ month: 'Apr', product: 'Pro', revenue: 105 },
		{ month: 'May', product: 'Pro', revenue: 128 },
		{ month: 'Jun', product: 'Pro', revenue: 145 },
		{ month: 'Jan', product: 'Lite', revenue: 30 },
		{ month: 'Feb', product: 'Lite', revenue: 38 },
		{ month: 'Mar', product: 'Lite', revenue: 42 },
		{ month: 'Apr', product: 'Lite', revenue: 50 },
		{ month: 'May', product: 'Lite', revenue: 48 },
		{ month: 'Jun', product: 'Lite', revenue: 55 }
	],
	x: 'month',
	y: 'revenue',
	fill: 'product',
	stack: true,
	legend: true,
	geoms: [{ type: 'area' }],
	height: 240,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `pie-chart` route. */
const PIE_CHART_SPEC = {
	title: 'Market share by segment',
	data: [
		{ segment: 'Mobile', share: 42 },
		{ segment: 'Desktop', share: 35 },
		{ segment: 'Tablet', share: 15 },
		{ segment: 'Smart TV', share: 5 },
		{ segment: 'Other', share: 3 }
	],
	y: 'share',
	fill: 'segment',
	legend: true,
	geoms: [{ type: 'arc', options: { innerRadius: 60 } }],
	height: 280,
	margin: { top: 8, right: 16, bottom: 8, left: 16 }
}

/** `scatter-plot` route. */
const SCATTER_PLOT_SPEC = {
	title: 'Engine displacement vs highway mpg',
	data: [
		{ class: 'compact', displ: 1.4, hwy: 35 },
		{ class: 'compact', displ: 1.6, hwy: 33 },
		{ class: 'compact', displ: 1.8, hwy: 31 },
		{ class: 'midsize', displ: 2.0, hwy: 30 },
		{ class: 'midsize', displ: 2.4, hwy: 28 },
		{ class: 'midsize', displ: 3.0, hwy: 25 },
		{ class: 'suv', displ: 3.0, hwy: 23 },
		{ class: 'suv', displ: 3.5, hwy: 22 },
		{ class: 'suv', displ: 4.0, hwy: 20 },
		{ class: 'suv', displ: 4.6, hwy: 18 },
		{ class: 'pickup', displ: 4.0, hwy: 19 },
		{ class: 'pickup', displ: 5.0, hwy: 17 },
		{ class: 'pickup', displ: 5.7, hwy: 16 }
	],
	x: 'displ',
	y: 'hwy',
	color: 'class',
	legend: true,
	geoms: [{ type: 'point' }],
	height: 280,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `bubble-chart` route. */
const BUBBLE_CHART_SPEC = {
	title: 'City vs highway mpg · size = displ',
	data: [
		{ class: 'compact', cty: 28, hwy: 35, displ: 1.4 },
		{ class: 'compact', cty: 26, hwy: 33, displ: 1.6 },
		{ class: 'midsize', cty: 22, hwy: 30, displ: 2.0 },
		{ class: 'midsize', cty: 20, hwy: 28, displ: 2.4 },
		{ class: 'suv', cty: 17, hwy: 23, displ: 3.0 },
		{ class: 'suv', cty: 16, hwy: 22, displ: 3.5 },
		{ class: 'suv', cty: 14, hwy: 20, displ: 4.0 },
		{ class: 'pickup', cty: 14, hwy: 19, displ: 4.0 },
		{ class: 'pickup', cty: 12, hwy: 17, displ: 5.0 },
		{ class: 'pickup', cty: 11, hwy: 16, displ: 5.7 }
	],
	x: 'cty',
	y: 'hwy',
	color: 'class',
	legend: true,
	geoms: [{ type: 'point', size: 'displ' }],
	height: 280,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `box-plot` route. */
const BOX_PLOT_SPEC = {
	title: 'Highway mpg distribution by class',
	data: [
		{ class: 'compact', hwy: 35 }, { class: 'compact', hwy: 33 }, { class: 'compact', hwy: 31 }, { class: 'compact', hwy: 29 }, { class: 'compact', hwy: 27 },
		{ class: 'midsize', hwy: 30 }, { class: 'midsize', hwy: 28 }, { class: 'midsize', hwy: 26 }, { class: 'midsize', hwy: 25 }, { class: 'midsize', hwy: 24 },
		{ class: 'suv', hwy: 23 }, { class: 'suv', hwy: 22 }, { class: 'suv', hwy: 20 }, { class: 'suv', hwy: 18 }, { class: 'suv', hwy: 17 },
		{ class: 'pickup', hwy: 19 }, { class: 'pickup', hwy: 17 }, { class: 'pickup', hwy: 16 }, { class: 'pickup', hwy: 15 }, { class: 'pickup', hwy: 14 }
	],
	x: 'class',
	y: 'hwy',
	geoms: [{ type: 'box' }],
	height: 260,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `violin-plot` route. */
const VIOLIN_PLOT_SPEC = {
	title: 'Highway mpg density by class',
	data: [
		{ class: 'compact', hwy: 35 }, { class: 'compact', hwy: 33 }, { class: 'compact', hwy: 31 }, { class: 'compact', hwy: 29 }, { class: 'compact', hwy: 27 },
		{ class: 'midsize', hwy: 30 }, { class: 'midsize', hwy: 28 }, { class: 'midsize', hwy: 26 }, { class: 'midsize', hwy: 25 }, { class: 'midsize', hwy: 24 },
		{ class: 'suv', hwy: 23 }, { class: 'suv', hwy: 22 }, { class: 'suv', hwy: 20 }, { class: 'suv', hwy: 18 }, { class: 'suv', hwy: 17 },
		{ class: 'pickup', hwy: 19 }, { class: 'pickup', hwy: 17 }, { class: 'pickup', hwy: 16 }, { class: 'pickup', hwy: 15 }, { class: 'pickup', hwy: 14 }
	],
	x: 'class',
	y: 'hwy',
	geoms: [{ type: 'violin' }],
	height: 260,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}

/** `chart` route. */
const CHART_SPEC = {
	title: 'Quarterly revenue · FY 2026',
	data: [
		{ quarter: 'Q1', revenue: 42 },
		{ quarter: 'Q2', revenue: 58 },
		{ quarter: 'Q3', revenue: 51 },
		{ quarter: 'Q4', revenue: 73 }
	],
	x: 'quarter',
	y: 'revenue',
	geoms: [{ type: 'bar' }],
	height: 220,
	grid: true,
	margin: { top: 8, right: 16, bottom: 36, left: 44 }
}
/** `chart-grouped` route dataset — the spec around it varies with the query. */
const REVENUE_BY_PRODUCT = [
	{ quarter: 'Q1', product: 'Hardware', revenue: 24 },
	{ quarter: 'Q1', product: 'Software', revenue: 18 },
	{ quarter: 'Q2', product: 'Hardware', revenue: 31 },
	{ quarter: 'Q2', product: 'Software', revenue: 27 },
	{ quarter: 'Q3', product: 'Hardware', revenue: 28 },
	{ quarter: 'Q3', product: 'Software', revenue: 23 },
	{ quarter: 'Q4', product: 'Hardware', revenue: 39 },
	{ quarter: 'Q4', product: 'Software', revenue: 34 }
]

/**
 * `list` route items. Every leaf carries an explicit `value`: without one the
 * selection value falls back to the raw item object and matching is by
 * reference, which breaks as soon as it passes through `$state`.
 */
const SETTINGS_MENU_ITEMS = [
	{
		label: 'General',
		icon: 'i-mdi:cog-outline',
		children: [
			{ label: 'Profile', value: 'profile', icon: 'i-mdi:account-outline' },
			{ label: 'Account', value: 'account', icon: 'i-mdi:shield-account-outline' },
			{ label: 'Notifications', value: 'notifications', icon: 'i-mdi:bell-outline' }
		]
	},
	{
		label: 'Appearance',
		icon: 'i-mdi:palette-outline',
		children: [
			{ label: 'Theme', value: 'theme', icon: 'i-mdi:invert-colors' },
			{ label: 'Density', value: 'density', icon: 'i-mdi:format-line-spacing' }
		]
	}
]

const ROUTES: Route[] = [
	{
		// Order matters: chart-grouped is the "stacked / grouped *bars*" case
		// for the bar-chart variant slabs. Narrowed to require an explicit
		// "bar", "product", or "series" mention so "stacked area" falls
		// through to the area-chart route below instead of producing a bar
		// chart. Plain `stacked` alone is too ambiguous (could be stacked
		// area / stacked column / stacked anything).
		id: 'chart-grouped',
		keywords: /\b(grouped[\s-]?bar|stacked[\s-]?bar|stack[\s-]?the[\s-]?bars?|by[\s-]?product|two[\s-]?series|multi[\s-]?series)\b/i,
		build: (q) => {
			// The only spec that cannot be a plain fixture: `stack` is read from the
			// query, so the object is built per call around the hoisted dataset.
			const stack = /\b(stack|stacked)\b/i.test(q)
			const spec = {
				title: stack ? 'Revenue stacked by product' : 'Revenue by product',
				data: REVENUE_BY_PRODUCT,
				x: 'quarter',
				y: 'revenue',
				fill: 'product',
				stack,
				legend: true,
				geoms: [{ type: 'bar' }],
				height: 240
			}
			return [
				{
					kind: 'prose',
					text: stack
						? 'Same chart, two series stacked by product. `stack: true` flips the layout from grouped to stacked without changing the data.'
						: 'Same chart, two series grouped by product. `fill: "product"` tells BarChart to colour bars by the product field.'
				},
				{
					kind: 'markdown',
					markdown: `\`\`\`plot\n${  JSON.stringify(spec)  }\n\`\`\``
				}
			]
		}
	},
	{
		id: 'line-chart',
		keywords: /\b(line[\s-]?chart|line[\s-]?graph|trend(s)?|over[\s-]?time|monthly|time[\s-]?series)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Monthly revenue across two products as a <LineChart/>. `color: "product"` splits the series — two trend lines instead of one.'
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${JSON.stringify(LINE_CHART_SPEC)}\n\`\`\``
			},
			{
				kind: 'suggestions',
				intro: 'Try',
				items: [
					{ label: 'Same data as area', query: 'Show monthly revenue as a stacked area chart' },
					{ label: 'Show as a table', query: 'Show the monthly revenue data as a table' }
				]
			}
		]
	},
	{
		id: 'area-chart',
		keywords: /\b(area[\s-]?chart|area[\s-]?graph|filled[\s-]?line|stacked[\s-]?area)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Same monthly data, stacked as filled areas. Each band reads as "this product\'s contribution"; the top edge is the total.'
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${JSON.stringify(AREA_CHART_SPEC)}\n\`\`\``
			},
			{
				kind: 'suggestions',
				intro: 'Try',
				items: [
					{ label: 'Switch to lines', query: 'Show monthly revenue as a line chart' }
				]
			}
		]
	},
	{
		id: 'pie-chart',
		keywords: /\b(pie[\s-]?chart|donut|share[s]?|market[\s-]?share|segment(s|ation)?|distribution[\s-]?of)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Market share by segment as a donut. `innerRadius` carves out the centre; `fill: "segment"` colours one slice per segment.'
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${JSON.stringify(PIE_CHART_SPEC)}\n\`\`\``
			},
			{
				kind: 'suggestions',
				intro: 'Try',
				items: [
					{ label: 'Same data as a bar chart', query: 'Show segment share as a bar chart' }
				]
			}
		]
	},
	{
		id: 'scatter-plot',
		keywords: /\b(scatter[\s-]?(plot|chart)?|x[\s-]?vs[\s-]?y|correlation|displacement)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Engine displacement vs highway mpg — one point per car, coloured by class. Classic <ScatterPlot/>: paired numeric + a categorical color channel.'
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${JSON.stringify(SCATTER_PLOT_SPEC)}\n\`\`\``
			},
			{
				kind: 'suggestions',
				intro: 'Try',
				items: [
					{ label: 'Size by displacement', query: 'Show the same data as a bubble chart with size by displacement' }
				]
			}
		]
	},
	{
		id: 'bubble-chart',
		keywords: /\b(bubble[\s-]?(chart|plot)?|size[\s-]?(field|by))\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'City vs highway mpg with bubble size mapped to engine displacement. <BubbleChart/> = ScatterPlot + a `size` channel.'
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${JSON.stringify(BUBBLE_CHART_SPEC)}\n\`\`\``
			}
		]
	},
	{
		id: 'box-plot',
		keywords: /\b(box[\s-]?plot|boxplot|quartile|whisker|outlier|five[\s-]?number)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Highway mpg distribution per class — five-number summary (min, Q1, median, Q3, max) per category. <BoxPlot/> takes raw rows; the box is computed.'
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${JSON.stringify(BOX_PLOT_SPEC)}\n\`\`\``
			},
			{
				kind: 'suggestions',
				intro: 'Try',
				items: [
					{ label: 'Same data as violin', query: 'Show highway mpg as a violin plot by class' }
				]
			}
		]
	},
	{
		id: 'violin-plot',
		keywords: /\b(violin[\s-]?(plot)?|density|kernel[\s-]?density)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Same raw data as the box plot, drawn as a violin — the silhouette is the kernel-density estimate, so you see the full shape, not just the quartiles.'
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${JSON.stringify(VIOLIN_PLOT_SPEC)}\n\`\`\``
			}
		]
	},
	{
		id: 'chart',
		keywords: /\b(chart|graph|bar|revenue|sales|quarter|visuali[sz]e|metrics?)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: "Here's quarterly revenue from the example dataset. The chart is a real <BarChart/> from @rokkit/chart — pass rows + x/y field names and it handles axes, palette, gridlines."
			},
			{
				kind: 'markdown',
				markdown: `\`\`\`plot\n${  JSON.stringify(CHART_SPEC)  }\n\`\`\``
			},
			{
				kind: 'suggestions',
				intro: 'Try',
				items: [
					{ label: 'Group by product', query: 'Show a grouped bar chart by product' },
					{ label: 'Stack the bars', query: 'Stack the chart by product' },
					{ label: 'Show as a table', query: 'Show the same data as a table' }
				]
			}
		]
	},
	{
		id: 'table',
		keywords: /\b(table|grid|rows?|product|inventory|stock|sortable)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Six rows from the products catalog. <Table/> infers columns from the row shape; click any header to sort.'
			},
			{
				kind: 'component',
				tool: 'mount_table',
				caption: 'Products',
				props: {
					data: [
						{ name: 'Laptop', price: 1299, stock: 45 },
						{ name: 'Phone', price: 899, stock: 120 },
						{ name: 'Tablet', price: 599, stock: 78 },
						{ name: 'Monitor', price: 449, stock: 32 },
						{ name: 'Keyboard', price: 129, stock: 210 },
						{ name: 'Mouse', price: 59, stock: 340 }
					],
					caption: 'Products'
				}
			},
			{
				kind: 'suggestions',
				intro: 'Try',
				items: [
					{ label: 'Plot as a chart', query: 'Visualize stock as a bar chart' },
					{ label: 'Mapped columns', query: 'Same table with custom column labels' }
				]
			}
		]
	},
	{
		id: 'form',
		keywords: /\b(form|schema|sign[\s-]?up|input|fields?|validation)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'A schema-driven form via <FormRenderer/>. Four fields — text, email (validated), select (enum-derived), boolean toggle. `bind:data` round-trips a single object.'
			},
			{
				kind: 'component',
				tool: 'mount_form',
				caption: 'Sign-up form',
				props: {
					schema: {
						type: 'object',
						properties: {
							name: { type: 'string', required: true },
							email: { type: 'string', format: 'email', required: true },
							role: { type: 'string', enum: ['admin', 'editor', 'viewer', 'user'] },
							newsletter: { type: 'boolean' }
						}
					},
					data: { name: '', email: '', role: 'user', newsletter: true }
				}
			}
		]
	},
	{
		id: 'list',
		keywords: /\b(list|settings|menu|options|nav|navigation)\b/i,
		build: () => [
			{
				kind: 'prose',
				text: 'Settings shape — three collapsible groups, items inside. Same <List/> renders flat if you drop `children`.'
			},
			{
				kind: 'component',
				tool: 'mount_list',
				caption: 'Settings',
				// `value` is seeded for the same reason the /app/list demo seeds it:
				// with `collapsible` and no active value List expands nothing, so the
				// component would mount as two closed headers and no items.
				props: { items: SETTINGS_MENU_ITEMS, collapsible: true, value: 'profile' }
			}
		]
	}
]

const FALLBACK: Block[] = [
	{
		kind: 'prose',
		text: "I don't have a scripted response for that yet. The mock router knows about charts (bar, line, area, pie, scatter, bubble, box, violin), tables, forms, and lists. Try one of these:"
	},
	{
		kind: 'suggestions',
		intro: 'Charts',
		items: [
			{ label: 'Bar chart', query: 'Show me a bar chart of quarterly revenue' },
			{ label: 'Line chart', query: 'Show monthly revenue as a line chart' },
			{ label: 'Area chart', query: 'Show monthly revenue as a stacked area chart' },
			{ label: 'Pie chart', query: 'Show market share by segment as a pie chart' },
			{ label: 'Scatter plot', query: 'Show a scatter plot of displacement vs highway mpg' },
			{ label: 'Bubble chart', query: 'Show a bubble chart with size by displacement' },
			{ label: 'Box plot', query: 'Show highway mpg as a box plot by class' },
			{ label: 'Violin plot', query: 'Show highway mpg as a violin plot by class' }
		]
	},
	{
		kind: 'suggestions',
		intro: 'Other shapes',
		items: [
			{ label: 'Products table', query: 'Show me a sortable table of products' },
			{ label: 'Sign-up form', query: 'Render a sign-up form from a schema' },
			{ label: 'Settings list', query: 'Show a collapsible settings list' }
		]
	}
]

export function routeQuery(query: string): Block[] {
	const match = ROUTES.find((r) => r.keywords.test(query))
	if (!match) return FALLBACK
	return match.build(query)
}

// ─── Data-driven routing ──────────────────────────────────────────────────

function dataNote(
	shape: Inference['kind'],
	source: 'json' | 'csv',
	columns: FieldSummary[] = [],
	rowCount?: number
): Block {
	return {
		kind: 'data-note',
		source,
		shape: shape === 'error' ? 'json' : shape,
		rowCount,
		columnCount: columns.length || undefined,
		columns: columns.length
			? columns.map((c) => ({ name: c.name, type: c.type }))
			: undefined
	}
}

const SHAPE_HEADLINE: Record<string, string> = {
	record: 'Single record detected — rendered as an editable form. Edit any field; the schema was inferred from the value types.',
	table:
		"Tabular data detected — here's a sortable Table. Columns are inferred from the row shape (click any header to sort).",
	chart:
		'Numeric series detected — rendering as a BarChart. The first categorical column becomes x; the first numeric column becomes y; a second categorical column (if present) becomes the fill series.',
	list: 'Flat list detected — rendering each item below.',
	json: 'Could not infer a structured shape, falling back to a JSON code block.'
}

// Each per-shape builder returns the blocks that FOLLOW the headline for that
// inferred shape. `routeData` prepends the headline (or a query-contextual line)
// and dispatches here — keeping the top-level function a thin, low-complexity router.

function buildRecordBlocks(
	source: 'json' | 'csv',
	inf: Extract<Inference, { kind: 'record' }>
): Block[] {
	return [
		dataNote('record', source, inf.fields as unknown as FieldSummary[]),
		{
			kind: 'component',
			tool: 'mount_form',
			caption: 'Editable record',
			props: { schema: schemaFromRecord(inf.record), data: inf.record }
		},
		recordSuggestions(source, inf.record)
	]
}

/** The one follow-up a record offers: re-render it as a 1-row table. */
function recordSuggestions(source: 'json' | 'csv', record: unknown): Block {
	return {
		kind: 'suggestions',
		intro: 'Or',
		items: [
			{
				label: 'Wrap in a list',
				query: 'Wrap this record in a one-item list',
				action: {
					kind: 'reshape',
					source,
					data: [record],
					force: 'table',
					caption: 'as a 1-row table'
				}
			}
		]
	}
}

function buildTableBlocks(
	source: 'json' | 'csv',
	inf: Extract<Inference, { kind: 'table' }>
): Block[] {
	const blocks: Block[] = [
		dataNote('table', source, inf.columns, inf.rows.length),
		{
			kind: 'component',
			tool: 'mount_table',
			caption: `${inf.rows.length} rows · ${inf.columns.length} columns`,
			props: { data: inf.rows }
		}
	]
	const chartAxes = inferShape(inf.rows, 'chart')
	if (chartAxes.kind === 'chart') {
		blocks.push({
			kind: 'suggestions',
			intro: 'Or',
			items: [
				{
					label: `Chart ${chartAxes.y} by ${chartAxes.x}`,
					query: `Visualize this as a bar chart with x=${chartAxes.x} y=${chartAxes.y}`,
					action: { kind: 'reshape', source, data: inf.rows, force: 'chart' }
				}
			]
		})
	}
	return blocks
}

function buildChartBlocks(
	source: 'json' | 'csv',
	inf: Extract<Inference, { kind: 'chart' }>
): Block[] {
	const props = chartProps(inf)
	return [
		dataNote('chart', source, inf.columns, inf.rows.length),
		{
			kind: 'component',
			tool: 'mount_bar_chart',
			caption: `${inf.y} by ${inf.x}${inf.fill ? ` (grouped by ${inf.fill})` : ''}`,
			props
		},
		chartSuggestions(source, inf, props)
	]
}

/** Chart props from an inference. A `fill` channel also turns the legend on. */
function chartProps(inf: Extract<Inference, { kind: 'chart' }>): Record<string, unknown> {
	const props: Record<string, unknown> = {
		data: inf.rows,
		x: inf.x,
		y: inf.y,
		height: 280,
		grid: true
	}
	if (inf.fill) {
		props.fill = inf.fill
		props.legend = true
	}
	return props
}

/**
 * Follow-ups a chart offers: the table view always, plus stacking when there is
 * a series channel to stack by.
 */
function chartSuggestions(
	source: 'json' | 'csv',
	inf: Extract<Inference, { kind: 'chart' }>,
	props: Record<string, unknown>
): Block {
	return {
		kind: 'suggestions',
		intro: 'Or',
		items: [
			{
				label: 'Show as a table',
				query: 'Show the data as a table',
				action: { kind: 'reshape', source, data: inf.rows, force: 'table' }
			},
			...stackSuggestion(inf, props)
		]
	}
}

/** The "stack the series" chip — only offered when there is a series to stack by. */
function stackSuggestion(
	inf: Extract<Inference, { kind: 'chart' }>,
	props: Record<string, unknown>
) {
	if (!inf.fill) return []
	return [
		{
			label: 'Stack the series',
			query: `Stack the chart by ${inf.fill}`,
			action: {
				kind: 'props' as const,
				tool: 'mount_bar_chart',
				props: { ...props, stack: true },
				caption: `${inf.y} stacked by ${inf.fill}`
			}
		}
	]
}

function buildListBlocks(inf: Extract<Inference, { kind: 'list' }>): Block[] {
	return [
		{
			kind: 'component',
			tool: 'mount_list',
			caption: `${inf.items.length} items`,
			props: {
				items: inf.items.map((item) =>
					typeof item === 'object' && item !== null ? item : { label: String(item) }
				)
			}
		}
	]
}

function buildJsonFallback(parsed: unknown): Block[] {
	return [{ kind: 'code', language: 'json', filename: 'data.json', code: JSON.stringify(parsed, null, 2) }]
}

// Replace the standalone headline (blocks[0]) with a query-contextual prose line.
function prependQueryContext(blocks: Block[], originalQuery: string | undefined, kind: string): Block[] {
	if (!originalQuery || !originalQuery.trim()) return blocks
	const lead: Block = {
		kind: 'prose',
		text: `For "${originalQuery.trim()}" — ${SHAPE_HEADLINE[kind].toLowerCase()}`
	}
	return [lead, ...blocks.slice(1)]
}

export function routeData(
	source: 'json' | 'csv',
	parsed: unknown,
	originalQuery?: string,
	force?: 'table' | 'chart' | 'record' | 'list'
): Block[] {
	const inf = inferShape(parsed, force)
	if (inf.kind === 'error') {
		return [{ kind: 'prose', text: `Could not parse the data — ${inf.message}` }]
	}

	const headline: Block = { kind: 'prose', text: SHAPE_HEADLINE[inf.kind] }
	const body =
		inf.kind === 'record'
			? buildRecordBlocks(source, inf)
			: inf.kind === 'table'
				? buildTableBlocks(source, inf)
				: inf.kind === 'chart'
					? buildChartBlocks(source, inf)
					: inf.kind === 'list'
						? buildListBlocks(inf)
						: buildJsonFallback(parsed)

	return prependQueryContext([headline, ...body], originalQuery, inf.kind)
}
