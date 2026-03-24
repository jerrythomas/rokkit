import { scaleBand } from 'd3-scale'
import { stack } from 'd3-shape'

export function buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns) {
  const { x: xf, y: yf, color: cf } = channels

  const colorKeys = cf ? [...new Set(data.map((d) => d[cf]))] : []
  const subScale = colorKeys.length > 1
    ? scaleBand().domain(colorKeys).range([0, xScale.bandwidth()]).padding(0.05)
    : null

  return data.map((d) => {
    const xVal = d[xf]
    const colorKey = cf ? d[cf] : null
    const colorEntry = colors?.get(colorKey) ?? colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
    const patternId = patterns?.has(colorKey) ? `pattern-${String(colorKey).replace(/\s/g, '-')}` : null

    const bandX = xScale(xVal) ?? 0
    const subX = subScale ? (subScale(colorKey) ?? 0) : 0
    const barX = bandX + subX
    const barWidth = subScale ? subScale.bandwidth() : xScale.bandwidth()
    const barY = yScale(d[yf])
    const barHeight = innerHeight - barY

    return {
      data: d,
      key: `${String(xVal)}::${String(colorKey ?? '')}`,
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight,
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      patternId
    }
  })
}

export function buildStackedBars(data, channels, xScale, yScale, colors, innerHeight) {
  const { x: xf, y: yf, color: cf } = channels
  if (!cf) return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight)

  const xCategories = [...new Set(data.map((d) => d[xf]))]
  const colorCategories = [...new Set(data.map((d) => d[cf]))]

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

  const stackGen = stack().keys(colorCategories)
  const layers = stackGen(wide)

  const bars = []
  for (const layer of layers) {
    const colorKey = layer.key
    const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#888' }
    for (const point of layer) {
      const [y0, y1] = point
      const xVal = point.data[xf]
      bars.push({
        data: point.data,
        key: `${String(xVal)}::${String(colorKey)}`,
        x: xScale(xVal) ?? 0,
        y: yScale(y1),
        width: xScale.bandwidth(),
        height: yScale(y0) - yScale(y1),
        fill: colorEntry.fill,
        stroke: colorEntry.stroke,
        patternId: null
      })
    }
  }
  return bars
}

export function buildHorizontalBars(data, channels, xScale, yScale, colors, innerHeight) {
  const { x: xf, y: yf, color: cf } = channels
  const colorKeys = cf ? [...new Set(data.map((d) => d[cf]))] : []
  const subScale = colorKeys.length > 1
    ? scaleBand().domain(colorKeys).range([0, yScale.bandwidth()]).padding(0.05)
    : null

  return data.map((d) => {
    const yVal = d[yf]
    const colorKey = cf ? d[cf] : null
    const colorEntry = colors?.get(colorKey) ?? colors?.values().next().value ?? { fill: '#888', stroke: '#888' }

    const bandY = yScale(yVal) ?? 0
    const subY = subScale ? (subScale(colorKey) ?? 0) : 0

    return {
      data: d,
      key: `${String(yVal)}::${String(colorKey ?? '')}`,
      x: 0,
      y: bandY + subY,
      width: xScale(d[xf]),
      height: subScale ? subScale.bandwidth() : yScale.bandwidth(),
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      patternId: null
    }
  })
}
