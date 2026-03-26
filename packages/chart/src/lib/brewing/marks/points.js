import {
	symbol,
	symbolCircle,
	symbolSquare,
	symbolTriangle,
	symbolDiamond,
	symbolCross,
	symbolStar
} from 'd3-shape'
import { defaultPreset } from '../../preset.js'

const SYMBOL_TYPES = [
	symbolCircle,
	symbolSquare,
	symbolTriangle,
	symbolDiamond,
	symbolCross,
	symbolStar
]
const SYMBOL_NAMES = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star']

/**
 * Returns a Map assigning shape names to distinct values, cycling through available shapes.
 * @param {unknown[]} values
 * @param {typeof defaultPreset} preset
 * @returns {Map<unknown, string>}
 */
export function assignSymbols(values, preset = defaultPreset) {
	const names = preset.symbols
	return new Map(values.map((v, i) => [v, names[i % names.length]]))
}

/**
 * Builds an SVG path string for a given shape name and radius.
 * @param {string} shapeName
 * @param {number} r
 * @returns {string}
 */
export function buildSymbolPath(shapeName, r) {
	const idx = SYMBOL_NAMES.indexOf(shapeName)
	const type = idx >= 0 ? SYMBOL_TYPES[idx] : symbolCircle
	return (
		symbol()
			.type(type)
			.size(Math.PI * r * r)() ?? ''
	)
}

/**
 * Returns a stable pseudo-random offset for a given index.
 * Uses a linear congruential generator seeded by index — no external dependency,
 * stable across re-renders.
 * @param {number} i - row index (seed)
 * @param {number} range - total spread (jitter is ±range/2)
 * @returns {number}
 */
export function jitterOffset(i, range) {
	const r = ((i * 1664525 + 1013904223) >>> 0) / 0xffffffff
	return (r - 0.5) * range
}

/**
 * Builds point geometry for scatter/bubble charts.
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, size?: string, symbol?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {Function|null} sizeScale
 * @param {Map<unknown, string>|null} symbolMap  — maps symbol field value → shape name
 * @param {number} defaultRadius
 * @param {{ width?: number, height?: number }|null} jitter
 */
export function buildPoints(
	data,
	channels,
	xScale,
	yScale,
	colors,
	sizeScale,
	symbolMap,
	defaultRadius = 5,
	jitter = null
) {
	const { x: xf, y: yf, color: cf, size: sf, symbol: symf } = channels
	return data.map((d, i) => {
		const colorKey = cf ? d[cf] : null
		const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#444' }
		const r = sf && sizeScale ? sizeScale(d[sf]) : defaultRadius
		const shapeName = symf && symbolMap ? (symbolMap.get(d[symf]) ?? 'circle') : null
		const symbolPath = shapeName ? buildSymbolPath(shapeName, r) : null
		const jx = jitter?.width ? jitterOffset(i, jitter.width) : 0
		const jy = jitter?.height ? jitterOffset(i + 100000, jitter.height) : 0
		return {
			data: d,
			cx: xScale(d[xf]) + jx,
			cy: yScale(d[yf]) + jy,
			r,
			fill: colorEntry.fill,
			stroke: colorEntry.stroke,
			symbolPath,
			key: colorKey
		}
	})
}
