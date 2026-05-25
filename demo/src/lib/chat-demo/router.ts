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

const ROUTES: Route[] = [
	{
		// Order matters: more specific patterns first. chart-grouped must beat
		// the plain `chart` route since "grouped" implies "chart" too.
		id: 'chart-grouped',
		keywords: /\b(grouped|by product|stacked|two series|multi[-\s]?series)\b/i,
		build: (q) => {
			const stack = /\b(stack|stacked)\b/i.test(q)
			return [
				{
					kind: 'prose',
					text: stack
						? 'Same chart, two series stacked by product. `stack: true` flips the layout from grouped to stacked without changing the data.'
						: 'Same chart, two series grouped by product. `fill: "product"` tells BarChart to colour bars by the product field.'
				},
				{
					kind: 'component',
					tool: 'mount_bar_chart',
					caption: stack ? 'Revenue stacked by product' : 'Revenue by product',
					props: {
						data: [
							{ quarter: 'Q1', product: 'Hardware', revenue: 24 },
							{ quarter: 'Q1', product: 'Software', revenue: 18 },
							{ quarter: 'Q2', product: 'Hardware', revenue: 31 },
							{ quarter: 'Q2', product: 'Software', revenue: 27 },
							{ quarter: 'Q3', product: 'Hardware', revenue: 28 },
							{ quarter: 'Q3', product: 'Software', revenue: 23 },
							{ quarter: 'Q4', product: 'Hardware', revenue: 39 },
							{ quarter: 'Q4', product: 'Software', revenue: 34 }
						],
						x: 'quarter',
						y: 'revenue',
						fill: 'product',
						stack,
						legend: true,
						height: 240
					}
				}
			]
		}
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
				kind: 'component',
				tool: 'mount_bar_chart',
				caption: 'Quarterly revenue · FY 2026',
				props: {
					data: [
						{ quarter: 'Q1', revenue: 42 },
						{ quarter: 'Q2', revenue: 58 },
						{ quarter: 'Q3', revenue: 51 },
						{ quarter: 'Q4', revenue: 73 }
					],
					x: 'quarter',
					y: 'revenue',
					height: 240,
					grid: true
				}
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
				props: {
					items: [
						{
							label: 'General',
							icon: 'i-mdi:cog-outline',
							children: [
								{ label: 'Profile', icon: 'i-mdi:account-outline' },
								{ label: 'Account', icon: 'i-mdi:shield-account-outline' },
								{ label: 'Notifications', icon: 'i-mdi:bell-outline' }
							]
						},
						{
							label: 'Appearance',
							icon: 'i-mdi:palette-outline',
							children: [
								{ label: 'Theme', icon: 'i-mdi:invert-colors' },
								{ label: 'Density', icon: 'i-mdi:format-line-spacing' }
							]
						}
					],
					collapsible: true
				}
			}
		]
	}
]

const FALLBACK: Block[] = [
	{
		kind: 'prose',
		text: "I don't have a scripted response for that yet. The mock router knows about charts, tables, forms, and lists. Try one of these:"
	},
	{
		kind: 'suggestions',
		items: [
			{ label: 'Quarterly revenue chart', query: 'Show me a chart of quarterly revenue' },
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
	const blocks: Block[] = [headline]

	if (inf.kind === 'record') {
		blocks.push(
			dataNote('record', source, inf.fields as unknown as FieldSummary[])
		)
		blocks.push({
			kind: 'component',
			tool: 'mount_form',
			caption: 'Editable record',
			props: {
				schema: schemaFromRecord(inf.record),
				data: inf.record
			}
		})
		blocks.push({
			kind: 'suggestions',
			intro: 'Or',
			items: [
				{
					label: 'Wrap in a list',
					query: 'Wrap this record in a one-item list',
					action: {
						kind: 'reshape',
						source,
						data: [inf.record],
						force: 'table',
						caption: 'as a 1-row table'
					}
				}
			]
		})
	} else if (inf.kind === 'table') {
		blocks.push(dataNote('table', source, inf.columns, inf.rows.length))
		blocks.push({
			kind: 'component',
			tool: 'mount_table',
			caption: `${inf.rows.length} rows · ${inf.columns.length} columns`,
			props: { data: inf.rows }
		})
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
	} else if (inf.kind === 'chart') {
		blocks.push(dataNote('chart', source, inf.columns, inf.rows.length))
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
		blocks.push({
			kind: 'component',
			tool: 'mount_bar_chart',
			caption: `${inf.y} by ${inf.x}${inf.fill ? ` (grouped by ${inf.fill})` : ''}`,
			props
		})
		const stackProps: Record<string, unknown> = { ...props, stack: true }
		blocks.push({
			kind: 'suggestions',
			intro: 'Or',
			items: [
				{
					label: 'Show as a table',
					query: 'Show the data as a table',
					action: { kind: 'reshape', source, data: inf.rows, force: 'table' }
				},
				...(inf.fill
					? [
							{
								label: 'Stack the series',
								query: `Stack the chart by ${inf.fill}`,
								action: {
									kind: 'props' as const,
									tool: 'mount_bar_chart',
									props: stackProps,
									caption: `${inf.y} stacked by ${inf.fill}`
								}
							}
						]
					: [])
			]
		})
	} else if (inf.kind === 'list') {
		blocks.push({
			kind: 'component',
			tool: 'mount_list',
			caption: `${inf.items.length} items`,
			props: {
				items: inf.items.map((item) =>
					typeof item === 'object' && item !== null ? item : { label: String(item) }
				)
			}
		})
	} else {
		blocks.push({
			kind: 'code',
			language: 'json',
			filename: 'data.json',
			code: JSON.stringify(parsed, null, 2)
		})
	}

	if (originalQuery && originalQuery.trim()) {
		blocks.unshift({
			kind: 'prose',
			text: `For "${originalQuery.trim()}" — ${SHAPE_HEADLINE[inf.kind].toLowerCase()}`
		})
		// shift removes the headline we already added; re-pop it cleanly:
		blocks.splice(1, 1)
	}

	return blocks
}
