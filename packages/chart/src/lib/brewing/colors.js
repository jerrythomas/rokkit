import palette from './palette.json'

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
 * @returns {Map<unknown, {fill: string, stroke: string}>}
 */
export function assignColors(values, mode = 'light') {
  return new Map(values.map((v, i) => [v, palette[i % palette.length].shades[mode]]))
}
