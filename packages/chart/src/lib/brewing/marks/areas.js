import { area, curveCatmullRom, curveStep } from 'd3-shape'
import { toPatternId } from '../patterns.js'

/**
 * @param {Object[]} data
 * @param {{ x: string, y: string, fill?: string, pattern?: string }} channels
 *   `fill` is the primary aesthetic — drives grouping and interior color.
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @param {Map} [patternMap]
 */
export function buildAreas(data, channels, xScale, yScale, colors, curve, patternMap) {
  const { x: xf, y: yf, pattern: pf } = channels
  const cf = channels.fill   // fill is the primary aesthetic for area charts
  const innerHeight = yScale.range()[0]
  const xPos = (d) => typeof xScale.bandwidth === 'function'
    ? xScale(d[xf]) + xScale.bandwidth() / 2
    : xScale(d[xf])
  const makeGen = () => {
    const gen = area().x(xPos).y0(innerHeight).y1((d) => yScale(d[yf]))
    if (curve === 'smooth') gen.curve(curveCatmullRom)
    else if (curve === 'step') gen.curve(curveStep)
    return gen
  }
  if (!cf) {
    const colorEntry = colors?.values().next().value ?? { fill: '#888', stroke: '#444' }
    return [{ d: makeGen()(data), fill: colorEntry.fill, stroke: 'none', colorKey: null, patternKey: null, patternId: null }]
  }
  const groups = groupBy(data, cf)
  return [...groups.entries()].map(([key, rows]) => {
    const colorEntry = colors?.get(key) ?? { fill: '#888', stroke: '#444' }
    const patternKey = pf ? (pf === cf ? key : rows[0]?.[pf]) : null
    const patternName = patternKey !== null && patternKey !== undefined ? patternMap?.get(patternKey) : null
    return {
      d: makeGen()(rows),
      fill: colorEntry.fill,
      stroke: 'none',
      key,
      colorKey: key,
      patternKey,
      patternId: patternName ? toPatternId(patternKey) : null
    }
  })
}

function groupBy(arr, field) {
  const map = new Map()
  for (const item of arr) {
    const key = item[field]
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return map
}
