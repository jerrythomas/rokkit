import { line } from 'd3-shape'

/**
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @returns {{ d: string, fill: string, stroke: string }[]}
 */
export function buildLines(data, channels, xScale, yScale, colors) {
  const { x: xf, y: yf, color: cf } = channels
  if (!cf) {
    const lineGen = line()
      .x((d) => (typeof xScale.bandwidth === 'function' ? xScale(d[xf]) + xScale.bandwidth() / 2 : xScale(d[xf])))
      .y((d) => yScale(d[yf]))
    return [{ d: lineGen(data), fill: 'none', stroke: colors?.values().next().value?.stroke ?? '#888' }]
  }
  const groups = groupBy(data, cf)
  return [...groups.entries()].map(([key, rows]) => {
    const lineGen = line()
      .x((d) => (typeof xScale.bandwidth === 'function' ? xScale(d[xf]) + xScale.bandwidth() / 2 : xScale(d[xf])))
      .y((d) => yScale(d[yf]))
    const colorEntry = colors?.get(key) ?? { fill: 'none', stroke: '#888' }
    return { d: lineGen(rows), fill: 'none', stroke: colorEntry.stroke, key }
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
