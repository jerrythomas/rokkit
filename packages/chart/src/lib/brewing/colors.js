import { scaleSequential, scaleDiverging } from 'd3-scale'
import { extent } from 'd3-array'
import * as chromatic from 'd3-scale-chromatic'
import masterPalette from '../palette.json'
import { defaultPreset } from '../preset.js'

/**
 * Returns true if the value looks like a CSS color literal (not a field name).
 * Supports hex (#rgb, #rrggbb, #rrggbbaa), and functional notations (rgb, hsl, oklch, etc.).
 * @param {unknown} value
 * @returns {boolean}
 */
export function isLiteralColor(value) {
	if (!value || typeof value !== 'string') return false
	if (/^#([0-9a-fA-F]{3,8})$/.test(value)) return true
	if (/^(rgb|rgba|hsl|hsla|oklch|oklab|hwb|lab|lch|color)\s*\(/i.test(value)) return true
	return false
}

/**
 * Extracts distinct values for a given field from the data array.
 * @param {Object[]} data
 * @param {string|null} field
 * @returns {unknown[]}
 */
export function distinct(data, field) {
	if (!field) return []
	return [...new Set(data.map((d) => d[field]))].filter((v) => v !== null && v !== undefined)
}

/**
 * Assigns palette colors to an array of distinct values.
 * @param {unknown[]} values
 * @param {'light'|'dark'} mode
 * @param {typeof defaultPreset} preset
 * @returns {Map<unknown, {fill: string, stroke: string}>}
 */
export function assignColors(values, mode = 'light', preset = defaultPreset) {
	const { colors, shades } = preset
	const { fill, stroke } = shades[mode]
	return new Map(
		values.map((v, i) => {
			const colorName = colors[i % colors.length]
			const group = masterPalette[colorName]
			return [
				v,
				{
					fill: group?.[fill] ?? '#888',
					stroke: group?.[stroke] ?? '#444'
				}
			]
		})
	)
}

/**
 * Named sequential color schemes from d3-scale-chromatic.
 * Keys are lowercase user-facing names.
 * @type {Record<string, (t: number) => string>}
 */
const SEQUENTIAL_SCHEMES = {
	blues: chromatic.interpolateBlues,
	greens: chromatic.interpolateGreens,
	oranges: chromatic.interpolateOranges,
	purples: chromatic.interpolatePurples,
	reds: chromatic.interpolateReds,
	greys: chromatic.interpolateGreys,
	bugn: chromatic.interpolateBuGn,
	bupu: chromatic.interpolateBuPu,
	gnbu: chromatic.interpolateGnBu,
	orrd: chromatic.interpolateOrRd,
	pubu: chromatic.interpolatePuBu,
	purd: chromatic.interpolatePuRd,
	rdpu: chromatic.interpolateRdPu,
	ylgn: chromatic.interpolateYlGn,
	ylgnbu: chromatic.interpolateYlGnBu,
	ylorbr: chromatic.interpolateYlOrBr,
	ylorrd: chromatic.interpolateYlOrRd,
	viridis: chromatic.interpolateViridis,
	inferno: chromatic.interpolateInferno,
	magma: chromatic.interpolateMagma,
	plasma: chromatic.interpolatePlasma,
	cividis: chromatic.interpolateCividis,
	turbo: chromatic.interpolateTurbo,
	warm: chromatic.interpolateWarm,
	cool: chromatic.interpolateCool
}

/**
 * Named diverging color schemes from d3-scale-chromatic.
 * @type {Record<string, (t: number) => string>}
 */
const DIVERGING_SCHEMES = {
	rdbu: chromatic.interpolateRdBu,
	rdylbu: chromatic.interpolateRdYlBu,
	rdylgn: chromatic.interpolateRdYlGn,
	brbg: chromatic.interpolateBrBG,
	piyg: chromatic.interpolatePiYG,
	prgn: chromatic.interpolatePRGn,
	puor: chromatic.interpolatePuOr,
	rdgy: chromatic.interpolateRdGy,
	spectral: chromatic.interpolateSpectral
}

/**
 * Resolves a color scheme name to an interpolation function.
 * Falls back to the first scheme in the given map if the name is unknown.
 * @param {string|undefined} name
 * @param {Record<string, (t: number) => string>} schemes
 * @returns {(t: number) => string}
 */
function resolveScheme(name, schemes) {
	if (!name) return Object.values(schemes)[0]
	const key = name.toLowerCase().replace(/[-_\s]/g, '')
	return schemes[key] ?? Object.values(schemes)[0]
}

/**
 * Builds a sequential color scale for continuous numeric data.
 * Maps data values to a gradient from light to dark.
 *
 * @param {Object[]} data
 * @param {string} field
 * @param {Object} [opts]
 * @param {string} [opts.colorScheme] - Named scheme (e.g. 'blues', 'viridis')
 * @param {[number, number]} [opts.colorDomain] - Explicit [min, max]
 * @returns {{ scale: (v: number) => string, domain: [number, number], type: 'sequential' }}
 */
export function buildSequentialScale(data, field, opts = {}) {
	const values = data.map((d) => d[field]).filter((v) => v !== null && v !== undefined).map(Number)
	const domain = opts.colorDomain ?? extent(values)
	const interpolator = resolveScheme(opts.colorScheme, SEQUENTIAL_SCHEMES)
	const scale = scaleSequential(interpolator).domain(domain)
	return { scale, domain, type: 'sequential' }
}

/**
 * Builds a diverging color scale for numeric data centered on a midpoint.
 * Maps data values to a gradient diverging from a center color.
 *
 * @param {Object[]} data
 * @param {string} field
 * @param {Object} [opts]
 * @param {string} [opts.colorScheme] - Named scheme (e.g. 'rdbu', 'spectral')
 * @param {number} [opts.colorMidpoint] - Center value (default 0)
 * @param {[number, number, number]} [opts.colorDomain] - Explicit [min, mid, max]
 * @returns {{ scale: (v: number) => string, domain: [number, number, number], type: 'diverging' }}
 */
export function buildDivergingScale(data, field, opts = {}) {
	const values = data.map((d) => d[field]).filter((v) => v !== null && v !== undefined).map(Number)
	const [min, max] = extent(values)
	const mid = opts.colorMidpoint ?? 0
	const domain = opts.colorDomain ?? [min ?? 0, mid, max ?? 0]
	const interpolator = resolveScheme(opts.colorScheme, DIVERGING_SCHEMES)
	const scale = scaleDiverging(interpolator).domain(domain)
	return { scale, domain, type: 'diverging' }
}
