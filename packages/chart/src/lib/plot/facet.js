import { extent } from 'd3-array'

/**
 * Splits data into a Map of panels keyed by facet field value.
 * Preserves insertion order of first occurrence.
 *
 * @param {Object[]} data
 * @param {string} field
 * @returns {Map<unknown, Object[]>}
 */
export function splitByField(data, field) {
  const map = new Map()
  for (const row of data) {
    const key = row[field]
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(row)
  }
  return map
}

/**
 * Computes x/y domains for each panel.
 *
 * @param {Map<unknown, Object[]>} panels
 * @param {{ x: string, y: string }} channels
 * @param {'fixed'|'free'|'free_x'|'free_y'} scalesMode
 * @returns {Map<unknown, { xDomain: unknown[], yDomain: [number, number] }>}
 */
export function getFacetDomains(panels, channels, scalesMode = 'fixed') {
  const { x: xf, y: yf } = channels
  const allData = [...panels.values()].flat()

  // Determine if x is categorical (string) or numeric
  const sampleXVal = allData.find(d => d[xf] !== null && d[xf] !== undefined)?.[xf]
  const xIsCategorical = typeof sampleXVal === 'string'

  // Global domains (for fixed mode)
  const globalXDomain = xIsCategorical
    ? [...new Set(allData.map((d) => d[xf]))]
    : extent(allData, (d) => Number(d[xf]))
  const globalYDomain = extent(allData, (d) => Number(d[yf]))

  const result = new Map()
  for (const [key, rows] of panels.entries()) {
    const freeX = scalesMode === 'free' || scalesMode === 'free_x'
    const freeY = scalesMode === 'free' || scalesMode === 'free_y'

    const xDomain = freeX
      ? (xIsCategorical ? [...new Set(rows.map((d) => d[xf]))] : extent(rows, (d) => Number(d[xf])))
      : globalXDomain
    const yDomain = freeY
      ? extent(rows, (d) => Number(d[yf]))
      : globalYDomain

    result.set(key, { xDomain, yDomain })
  }
  return result
}
