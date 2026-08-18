import type { DatasetKey } from './datasets'

/** A tweakable setting; the controls render only the ones a type `applies`. */
export type Setting =
	| 'orientation'
	| 'position'
	| 'fill'
	| 'color'
	| 'pattern'
	| 'alpha'
	| 'legend'
	| 'innerRadius'
	| 'size'

/**
 * A chart type's purpose group. Every type is a geom (geom_bar, geom_line,
 * geom_tile…); the grouping is by what question the chart answers, not by any
 * "chart vs geom" distinction (there isn't one).
 */
export type ChartGroup =
	| 'Comparison'
	| 'Trend'
	| 'Part-to-whole'
	| 'Relationship'
	| 'Distribution'
	| 'Financial'
	| 'Flow'
	| 'Reference'

/** A leading guidance nudge — one tap either switches `to` a type or `set`s settings. */
export type Tip = { text: string; to?: string; set?: Record<string, unknown> }

export type ChartTypeConfig = {
	id: string
	label: string
	group: ChartGroup
	dataset: DatasetKey
	/** Default field mappings passed to the component. */
	fields: Record<string, string>
	/** Which settings the controls show for this type. */
	applies: Setting[]
	/** Initial setting values when this type is selected. */
	defaults: Record<string, unknown>
	/** Contextual guidance shown while this type is active. */
	tips: Tip[]
}

export const registry: Record<string, ChartTypeConfig> = {
	bar: {
		id: 'bar', label: 'Bar', group: 'Comparison', dataset: 'productSeries',
		fields: { x: 'quarter', y: 'revenue', fill: 'product' },
		applies: ['orientation', 'position', 'fill', 'pattern', 'alpha', 'legend'],
		defaults: { position: 'dodge', orientation: 'vertical' },
		tips: [
			{ text: 'These are grouped bars — stack them instead', set: { position: 'stack' } },
			{ text: 'Make it 100% stacked to compare proportions', set: { position: 'fill' } },
			{ text: 'Turn it on its side (horizontal)', set: { orientation: 'horizontal' } },
			{ text: 'See the same data flow over time as a line', to: 'line' }
		]
	},
	line: {
		id: 'line', label: 'Line', group: 'Trend', dataset: 'productSeries',
		fields: { x: 'quarter', y: 'revenue', color: 'product' },
		applies: ['alpha', 'legend'],
		defaults: { legend: true },
		tips: [
			{ text: 'Fill the area under the line', to: 'area' },
			{ text: 'Compare categories side by side as bars', to: 'bar' }
		]
	},
	area: {
		id: 'area', label: 'Area', group: 'Trend', dataset: 'productSeries',
		fields: { x: 'quarter', y: 'revenue', fill: 'product' },
		applies: ['position', 'fill', 'pattern', 'alpha', 'legend'],
		defaults: { position: 'stack', alpha: 0.7 },
		tips: [
			{ text: 'Normalize to 100% to read share over time', set: { position: 'fill' } },
			{ text: 'Overlap the series instead of stacking', set: { position: 'identity' } },
			{ text: 'Prefer crisp lines? Switch to a line chart', to: 'line' }
		]
	},
	pie: {
		id: 'pie', label: 'Pie', group: 'Part-to-whole', dataset: 'segments',
		fields: { y: 'share', fill: 'segment' },
		applies: ['innerRadius', 'pattern', 'alpha', 'legend'],
		defaults: { innerRadius: 0 },
		tips: [
			{ text: 'Cut out the center to make a donut', set: { innerRadius: 0.6 } },
			{ text: 'Add texture with a pattern fill', set: { pattern: 'segment' } }
		]
	},
	scatter: {
		id: 'scatter', label: 'Scatter', group: 'Relationship', dataset: 'cars',
		fields: { x: 'displ', y: 'hwy', color: 'class' },
		applies: ['color', 'alpha', 'legend'],
		defaults: { legend: true, alpha: 0.8 },
		tips: [
			{ text: 'Encode a third variable as bubble size', to: 'bubble' },
			{ text: 'Summarize each class as a distribution', to: 'box' }
		]
	},
	bubble: {
		id: 'bubble', label: 'Bubble', group: 'Relationship', dataset: 'cars',
		fields: { x: 'displ', y: 'hwy', size: 'cty', color: 'class' },
		applies: ['color', 'alpha', 'legend'],
		defaults: { legend: true, alpha: 0.7 },
		tips: [
			{ text: 'Drop the size channel for a plain scatter', to: 'scatter' }
		]
	},
	box: {
		id: 'box', label: 'Box', group: 'Distribution', dataset: 'cars',
		fields: { x: 'class', y: 'hwy', fill: 'class' },
		applies: ['orientation', 'fill', 'pattern', 'alpha'],
		defaults: { alpha: 0.5 },
		tips: [
			{ text: 'See the full density shape as a violin', to: 'violin' },
			{ text: 'Did you know? The box shows the middle 50% (IQR)' }
		]
	},
	violin: {
		id: 'violin', label: 'Violin', group: 'Distribution', dataset: 'cars',
		fields: { x: 'class', y: 'hwy', fill: 'class' },
		applies: ['orientation', 'fill', 'pattern', 'alpha'],
		defaults: { alpha: 0.5 },
		tips: [
			{ text: 'Prefer quartiles? Switch to a box plot', to: 'box' },
			{ text: 'Wider bands mean more values at that level' }
		]
	},
	heatmap: {
		id: 'heatmap', label: 'Heatmap', group: 'Distribution', dataset: 'heatmap',
		fields: { x: 'day', y: 'hour', color: 'count' },
		applies: ['alpha'],
		defaults: {},
		tips: [{ text: 'Color encodes the count in each cell' }]
	},
	hexbin: {
		id: 'hexbin', label: 'Hexbin', group: 'Distribution', dataset: 'points',
		fields: { x: 'x', y: 'y' },
		applies: ['alpha'],
		defaults: {},
		tips: [{ text: 'Hex bins reveal density where points overlap' }]
	},
	candlestick: {
		id: 'candlestick', label: 'Candlestick', group: 'Financial', dataset: 'ohlc',
		fields: { x: 'day' },
		applies: ['alpha'],
		defaults: {},
		tips: [{ text: 'Green rises, red falls — open vs close' }]
	},
	waterfall: {
		id: 'waterfall', label: 'Waterfall', group: 'Financial', dataset: 'waterfall',
		fields: { x: 'step', y: 'delta' },
		applies: ['alpha'],
		defaults: {},
		tips: [{ text: 'Each bar adds to the running total' }]
	},
	ribbon: {
		id: 'ribbon', label: 'Ribbon', group: 'Flow', dataset: 'flows',
		fields: {},
		applies: ['alpha'],
		defaults: { alpha: 0.5 },
		tips: [{ text: 'Ribbon width is proportional to the flow' }]
	},
	rule: {
		id: 'rule', label: 'Rule', group: 'Reference', dataset: 'daily',
		fields: { x: 'day', y: 'value' },
		applies: ['alpha'],
		defaults: {},
		tips: [{ text: 'Reference lines mark thresholds or targets' }]
	}
}

export const chartTypes = Object.values(registry)
export const chartGroups: ChartGroup[] = [
	'Comparison',
	'Trend',
	'Part-to-whole',
	'Relationship',
	'Distribution',
	'Financial',
	'Flow',
	'Reference'
]
