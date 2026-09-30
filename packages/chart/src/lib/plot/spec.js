/**
 * How `PlotChart` reads its inputs: a `spec` object and component props, which overlap.
 *
 * The rule is "a spec value overrides its prop", with one declared exception — `orientation`,
 * where the prop wins so a wrapper can force direction over a shared spec. Written as a table
 * so the exception is visible rather than one `??` in twenty turned the other way. Pure: the
 * component derives from these, and they are tested without rendering.
 */

/** Where a config field comes from. A null/undefined value falls through to the other source. */
const SOURCES = {
	spec: (key, spec) => spec?.[key],
	prop: (key, _spec, props) => props[key],
	specFirst: (key, spec, props) => spec?.[key] ?? props[key],
	propFirst: (key, spec, props) => props[key] ?? spec?.[key]
}

/**
 * The PlotState config fields read straight from spec and/or props, in config order.
 * @type {Array<[string, keyof typeof SOURCES]>}
 */
export const PLOT_CONFIG_FIELDS = [
	['data', 'specFirst'],
	['width', 'specFirst'],
	['height', 'specFirst'],
	['mode', 'prop'],
	['margin', 'prop'],
	['helpers', 'prop'],
	['xDomain', 'specFirst'],
	['yDomain', 'specFirst'],
	['colorDomain', 'spec'],
	['colorScale', 'spec'],
	['colorScheme', 'spec'],
	['colorMidpoint', 'spec'],
	['orientation', 'propFirst'],
	['axisOrigin', 'specFirst'],
	['axisOffset', 'specFirst'],
	['sort', 'spec'],
	['continuousCategory', 'spec'],
	['onselect', 'prop'],
	['selectable', 'prop']
]

/**
 * The config `PlotSurface` builds its `PlotState` from.
 *
 * @param {Record<string, any> | undefined} spec
 * @param {Record<string, any>} props - the component's props
 * @param {unknown} chartPreset - the resolved preset (context, else the default)
 */
export function resolvePlotConfig(spec, props, chartPreset) {
	const config = Object.fromEntries(
		PLOT_CONFIG_FIELDS.map(([key, source]) => [key, SOURCES[source](key, spec, props)])
	)
	// A spec names its channels; the prop-driven form has none here (children declare them).
	config.channels = spec ? { x: spec.x, y: spec.y, color: spec.color ?? spec.fill } : {}
	config.labels = spec?.labels ?? {}
	config.chartPreset = chartPreset
	return config
}

/** An axis label: the spec's label for the field on that axis, else blank. */
const axisLabel = (spec, field) => spec?.labels?.[field ?? ''] ?? ''

/**
 * The chrome around the marks: grid, legend, title, summary, axis labels, and the fields the
 * trend / highlight overlays draw on.
 *
 * `grid`: `false` hides it; `true` is 'auto'; `'x' | 'y' | 'both'` names the lines.
 *
 * @param {Record<string, any> | undefined} spec
 * @param {Record<string, any>} props
 */
export function resolveChrome(spec, props) {
	const grid = spec?.grid ?? props.grid
	return {
		showGrid: grid !== false,
		gridLines: typeof grid === 'boolean' ? 'auto' : grid,
		showLegend: spec?.legend ?? props.legend,
		title: spec?.title ?? props.title,
		summary: spec?.summary ?? props.summary,
		overlayX: spec?.x ?? props.x,
		overlayY: spec?.y ?? props.y,
		xLabel: axisLabel(spec, spec?.x),
		yLabel: axisLabel(spec, spec?.y)
	}
}

/**
 * The accessible table's columns: the spec's channels (deduped — a table's keyed each needs
 * unique names, and `x === color` is normal), else the first row's keys.
 *
 * @param {Record<string, any> | undefined} spec
 * @param {Record<string, unknown>[]} rows
 * @returns {string[]}
 */
export function tableColumns(spec, rows) {
	const channels = [spec?.x, spec?.y, spec?.color ?? spec?.fill].filter(Boolean)
	if (channels.length > 0) return [...new Set(channels)]
	return rows[0] ? Object.keys(rows[0]) : []
}

/** Spec-level options every geom inherits — only when the spec sets them. */
function inheritedOptions(spec) {
	const options = {}
	if (spec?.stack !== undefined) options.stack = spec.stack
	if (spec?.orientation !== undefined) options.orientation = spec.orientation
	return options
}

/**
 * The props for one `spec.geoms` entry: the spec's channels unless the geom names its own,
 * the spec's stack / orientation under the geom's options, and the geom's `props` over all.
 *
 * @param {Record<string, any>} geomSpec
 * @param {Record<string, any> | undefined} spec
 */
export function specGeomProps(geomSpec, spec) {
	return {
		x: geomSpec.x ?? spec?.x,
		y: geomSpec.y ?? spec?.y,
		color: geomSpec.color ?? spec?.color,
		fill: geomSpec.fill ?? spec?.fill,
		pattern: geomSpec.pattern,
		symbol: geomSpec.symbol,
		stat: geomSpec.stat,
		label: geomSpec.label,
		options: { ...inheritedOptions(spec), ...(geomSpec.options ?? {}) },
		...(geomSpec.props ?? {})
	}
}
