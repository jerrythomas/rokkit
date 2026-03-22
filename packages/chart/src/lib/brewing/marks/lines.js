import { line, curveCatmullRom, curveStep } from 'd3-shape'

/**
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @returns {{ d: string, fill: string, stroke: string, points: {x:number, y:number, data:Object}[], key?: unknown }[]}
 */
export function buildLines(data, channels, xScale, yScale, colors, curve) {
  const { x: xf, y: yf, color: cf } = channels
  const xPos = (d) => typeof xScale.bandwidth === 'function'
    ? xScale(d[xf]) + xScale.bandwidth() / 2
    : xScale(d[xf])
  const makeGen = () => {
    const gen = line().x(xPos).y((d) => yScale(d[yf]))
    if (curve === 'smooth') gen.curve(curveCatmullRom)
    else if (curve === 'step') gen.curve(curveStep)
    return gen
  }
  const toPoints = (rows) => rows.map((d) => ({ x: xPos(d), y: yScale(d[yf]), data: d }))

  if (!cf) {
    const stroke = colors?.values().next().value?.stroke ?? '#888'
    return [{ d: makeGen()(data), fill: 'none', stroke, points: toPoints(data) }]
  }
  const groups = groupBy(data, cf)
  return [...groups.entries()].map(([key, rows]) => {
    const colorEntry = colors?.get(key) ?? { fill: 'none', stroke: '#888' }
    return { d: makeGen()(rows), fill: 'none', stroke: colorEntry.stroke, points: toPoints(rows), key }
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
