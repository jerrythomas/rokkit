import masterPalette from '../palette.json'
import { defaultPreset } from '../preset.js'

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
