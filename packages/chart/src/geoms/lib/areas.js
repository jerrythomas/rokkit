import { area, stack, curveCatmullRom, curveStep } from 'd3-shape'
import { toPatternId } from '../../lib/brewing/patterns.js'

/**
 * Builds area path geometry for multi-series area charts.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @param {Map<unknown, string>} [patterns]
 * @returns {{ d: string, fill: string, stroke: string, key: unknown, patternId: string|null }[]}
 */
export function buildAreas(data, channels, xScale, yScale, colors, curve, patterns) {
  const { x: xf, y: yf, color: cf, pattern: pf } = channels
  const baseline = yScale.range()[0]   // bottom of the chart (y pixel max)

  const xPos = (d) => typeof xScale.bandwidth === 'function'
    ? xScale(d[xf]) + xScale.bandwidth() / 2
    : xScale(d[xf])

  const makeGen = () => {
    const gen = area()
      .x(xPos)
      .y0(baseline)
      .y1((d) => yScale(d[yf]))
    if (curve === 'smooth') gen.curve(curveCatmullRom)
    else if (curve === 'step') gen.curve(curveStep)
    return gen
  }

  const sortByX = (rows) => [...rows].sort((a, b) => a[xf] < b[xf] ? -1 : a[xf] > b[xf] ? 1 : 0)

  if (!cf) {
    const entry = colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
    const patternKey = pf ? data[0]?.[pf] : null
    const patternId = patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
      ? toPatternId(String(patternKey)) : null
    return [{ d: makeGen()(sortByX(data)), fill: entry.fill, stroke: 'none', key: null, patternId }]
  }

  // Group by color field
  const groups = new Map()
  for (const d of data) {
    const key = d[cf]
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(d)
  }
  // For different-field patterns, assign positionally so each area gets a distinct pattern
  const orderedPatternKeys = pf && pf !== cf ? [...(patterns?.keys() ?? [])] : null

  return [...groups.entries()].map(([key, rows], i) => {
    const entry = colors?.get(key) ?? { fill: '#888', stroke: '#888' }
    // Same field or no pf: look up by colorKey. Different field: assign positionally.
    const patternKey = !pf ? key : pf === cf ? key : (orderedPatternKeys?.[i % orderedPatternKeys.length] ?? null)
    const patternId = patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
      ? toPatternId(String(patternKey)) : null
    return { d: makeGen()(sortByX(rows)), fill: entry.fill, stroke: 'none', key, patternId }
  })
}

/**
 * Builds stacked area paths using d3 stack layout.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @param {Map<unknown, string>} [patterns]
 * @returns {{ d: string, fill: string, stroke: string, key: unknown, patternId: string|null }[]}
 */
export function buildStackedAreas(data, channels, xScale, yScale, colors, curve, patterns) {
  const { x: xf, y: yf, color: cf, pattern: pf } = channels
  if (!cf) return buildAreas(data, channels, xScale, yScale, colors, curve, patterns)

  const xCategories = [...new Set(data.map((d) => d[xf]))]
    .sort((a, b) => a < b ? -1 : a > b ? 1 : 0)
  const colorCategories = [...new Set(data.map((d) => d[cf]))]

  // Build wide-form lookup: xVal → { colorKey: yVal }
  const lookup = new Map()
  for (const d of data) {
    if (!lookup.has(d[xf])) lookup.set(d[xf], {})
    lookup.get(d[xf])[d[cf]] = Number(d[yf])
  }

  const wide = xCategories.map((xVal) => {
    const row = { [xf]: xVal }
    for (const c of colorCategories) row[c] = lookup.get(xVal)?.[c] ?? 0
    return row
  })

  const xPos = (d) => typeof xScale.bandwidth === 'function'
    ? xScale(d.data[xf]) + xScale.bandwidth() / 2
    : xScale(d.data[xf])

  const makeGen = () => {
    const gen = area()
      .x(xPos)
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
    if (curve === 'smooth') gen.curve(curveCatmullRom)
    else if (curve === 'step') gen.curve(curveStep)
    return gen
  }

  const stackGen = stack().keys(colorCategories)
  const layers = stackGen(wide)

  const orderedPatternKeys = pf && pf !== cf ? [...(patterns?.keys() ?? [])] : null

  return layers.map((layer, i) => {
    const colorKey = layer.key
    const entry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#888' }
    // Same field (or no pf): look up by colorKey. Different field: assign positionally.
    const patternKey = !pf ? colorKey : pf === cf ? colorKey : (orderedPatternKeys?.[i % orderedPatternKeys.length] ?? null)
    const patternId = patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
      ? toPatternId(String(patternKey)) : null
    return {
      d: makeGen()(layer) ?? '',
      fill: entry.fill,
      stroke: 'none',
      key: colorKey,
      patternId
    }
  })
}
