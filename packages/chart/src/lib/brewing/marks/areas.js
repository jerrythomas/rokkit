import { area } from 'd3-shape'

export function buildAreas(data, channels, xScale, yScale, colors) {
  const { x: xf, y: yf, color: cf } = channels
  const innerHeight = yScale.range()[0]
  const xPos = (d) => typeof xScale.bandwidth === 'function'
    ? xScale(d[xf]) + xScale.bandwidth() / 2
    : xScale(d[xf])

  if (!cf) {
    const areaGen = area().x(xPos).y0(innerHeight).y1((d) => yScale(d[yf]))
    const colorEntry = colors?.values().next().value ?? { fill: '#888', stroke: '#444' }
    return [{ d: areaGen(data), fill: colorEntry.fill, stroke: 'none' }]
  }
  const groups = groupBy(data, cf)
  return [...groups.entries()].map(([key, rows]) => {
    const areaGen = area().x(xPos).y0(innerHeight).y1((d) => yScale(d[yf]))
    const colorEntry = colors?.get(key) ?? { fill: '#888', stroke: '#444' }
    return { d: areaGen(rows), fill: colorEntry.fill, stroke: 'none', key }
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
