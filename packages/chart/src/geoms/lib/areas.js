import { area, curveCatmullRom, curveStep } from 'd3-shape'

/**
 * Builds area path geometry for multi-series area charts.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @returns {{ d: string, fill: string, stroke: string, key: unknown }[]}
 */
export function buildAreas(data, channels, xScale, yScale, colors, curve) {
  const { x: xf, y: yf, color: cf } = channels
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

  if (!cf) {
    const entry = colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
    return [{ d: makeGen()(data), fill: entry.fill, stroke: 'none', key: null }]
  }

  // Group by color field
  const groups = new Map()
  for (const d of data) {
    const key = d[cf]
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(d)
  }
  return [...groups.entries()].map(([key, rows]) => {
    const entry = colors?.get(key) ?? { fill: '#888', stroke: '#888' }
    return { d: makeGen()(rows), fill: entry.fill, stroke: 'none', key }
  })
}
