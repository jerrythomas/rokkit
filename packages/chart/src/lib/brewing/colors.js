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
