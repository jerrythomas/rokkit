// Shared aesthetic resolution for all geoms. Done ONCE here so every geom's build
// function inherits the same ggplot-aligned fill/color and alpha rules.
// See docs/backlog/2026-08-17-chart-aesthetics-unification.md §2, §3, §11.

const GRAY = { fill: '#888', stroke: '#888' }

/**
 * Resolve a mark's interior (fill) and outline (stroke) from the `fill` and `color`
 * channels through the shared categorical `colors` palette (Map<value, {fill, stroke}>).
 *
 * ggplot fallback:
 *  - color-only → fill AND stroke from the color value's entry (backward compatible)
 *  - fill-only  → fill AND stroke from the fill value's entry
 *  - both       → interior from the fill value, outline from the color value
 *  - neither    → the first palette entry (single-series)
 *
 * @param {Record<string, unknown>} row
 * @param {{ fill?: string, color?: string }} channels
 * @param {Map<unknown, { fill: string, stroke: string }>} colors
 * @returns {{ fill: string, stroke: string }}
 */
export function resolveFillStroke(row, channels, colors) {
	const { fill, color } = channels ?? {}
	const first = colors?.values?.().next?.().value ?? GRAY
	const fillEntry = fill ? (colors?.get(row?.[fill]) ?? first) : null
	const colorEntry = color ? (colors?.get(row?.[color]) ?? first) : null
	const base = fillEntry ?? colorEntry ?? first
	return {
		fill: (fillEntry ?? base).fill,
		stroke: (colorEntry ?? base).stroke
	}
}

/**
 * Resolve a geom's mark opacity: an explicit fixed `alpha`, else the per-geom preset
 * default, else fully opaque.
 * @param {number|undefined} alpha
 * @param {string} type - geom type key into preset.opacity
 * @param {{ opacity?: Record<string, number> }} [preset]
 * @returns {number}
 */
export function resolveAlpha(alpha, type, preset) {
	if (typeof alpha === 'number') return alpha
	return preset?.opacity?.[type] ?? 1
}

/**
 * Resolve a mark's text label from the geom's `label` prop.
 *
 *  - falsy      → no label
 *  - `true`     → the row's value in `defaultField` (usually the geom's y channel)
 *  - function   → its return value, stringified
 *  - string     → the row's value in that field
 *
 * @param {boolean|string|((row: Record<string, unknown>) => unknown)|undefined} label
 * @param {Record<string, unknown>} row
 * @param {string} [defaultField] - field used when `label` is `true`
 * @returns {string|null}
 */
export function resolveLabel(label, row, defaultField) {
	if (!label) return null
	if (label === true) return String((defaultField ? row[defaultField] : undefined) ?? '')
	if (typeof label === 'function') return String(label(row) ?? '')
	if (typeof label === 'string') return String(row[label] ?? '')
	return null
}
