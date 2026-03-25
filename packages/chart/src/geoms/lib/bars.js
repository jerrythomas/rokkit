import { scaleBand } from 'd3-scale'
import { stack } from 'd3-shape'
import { toPatternId } from '../../lib/brewing/patterns.js'

/**
 * Returns a band scale suitable for bar x-positioning.
 * When xScale is already a band scale, returns it unchanged.
 * When xScale is a linear scale (numeric x field like year/month),
 * derives a band scale from the distinct values in the data.
 */
function ensureBandX(xScale, data, xField) {
  if (typeof xScale?.bandwidth === 'function') return xScale
  const [r0, r1] = xScale.range()
  const domain = [...new Set(data.map((d) => d[xField]))]
  return scaleBand().domain(domain).range([r0, r1]).padding(0.2)
}

export function buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns) {
  const { x: xf, y: yf, color: cf } = channels

  const bandScale = ensureBandX(xScale, data, xf)
  const colorKeys = cf ? [...new Set(data.map((d) => d[cf]))] : []
  const subScale = colorKeys.length > 1
    ? scaleBand().domain(colorKeys).range([0, bandScale.bandwidth()]).padding(0.05)
    : null

  return data.map((d, i) => {
    const xVal = d[xf]
    const colorKey = cf ? d[cf] : null
    const colorEntry = colors?.get(colorKey) ?? colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
    const patternId = patterns?.has(colorKey) ? toPatternId(String(colorKey)) : null

    const bandX = bandScale(xVal) ?? 0
    const subX = subScale ? (subScale(colorKey) ?? 0) : 0
    const barX = bandX + subX
    const barWidth = subScale ? subScale.bandwidth() : bandScale.bandwidth()
    const barY = yScale(d[yf])
    const barHeight = innerHeight - barY

    return {
      data: d,
      key: `${String(xVal)}::${String(colorKey ?? '')}::${i}`,
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

export function buildStackedBars(data, channels, xScale, yScale, colors, innerHeight, patterns) {
  const { x: xf, y: yf, color: cf } = channels
  if (!cf) return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)

  const bandScale = ensureBandX(xScale, data, xf)
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
    const patternId = patterns?.has(colorKey) ? toPatternId(String(colorKey)) : null
    for (const point of layer) {
      const [y0, y1] = point
      const xVal = point.data[xf]
      bars.push({
        data: point.data,
        key: `${String(xVal)}::${String(colorKey)}`,
        x: bandScale(xVal) ?? 0,
        y: yScale(y1),
        width: bandScale.bandwidth(),
        height: yScale(y0) - yScale(y1),
        fill: colorEntry.fill,
        stroke: colorEntry.stroke,
        patternId
      })
    }
  }
  return bars
}

export function buildHorizontalBars(data, channels, xScale, yScale, colors, _innerHeight) {
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
