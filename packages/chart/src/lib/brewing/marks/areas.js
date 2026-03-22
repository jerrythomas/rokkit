import { area, curveCatmullRom, curveStep } from 'd3-shape'

/**
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 */
export function buildAreas(data, channels, xScale, yScale, colors, curve) {
  const { x: xf, y: yf, color: cf } = channels
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
    return [{ d: makeGen()(data), fill: colorEntry.fill, stroke: 'none' }]
  }
  const groups = groupBy(data, cf)
  return [...groups.entries()].map(([key, rows]) => {
    const colorEntry = colors?.get(key) ?? { fill: '#888', stroke: '#444' }
    return { d: makeGen()(rows), fill: colorEntry.fill, stroke: 'none', key }
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
