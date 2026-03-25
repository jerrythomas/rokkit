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

/**
 * Returns the sub-band fields: distinct non-x fields among [color, pattern].
 * These are the fields that cause multiple bars within a single x-band.
 */
function subBandFields(channels) {
  const { x: xf, color: cf, pattern: pf } = channels
  const seen = new Set()
  const out = []
  for (const f of [cf, pf]) {
    if (f && f !== xf && !seen.has(f)) { seen.add(f); out.push(f) }
  }
  return out
}

export function buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns) {
  const { x: xf, y: yf, color: cf, pattern: pf } = channels

  const bandScale = ensureBandX(xScale, data, xf)

  // Sub-banding: only fields that differ from x drive grouping within a band
  const subFields = subBandFields(channels)
  const getSubKey = (d) => subFields.map((f) => String(d[f])).join('::')
  const subDomain = subFields.length > 0 ? [...new Set(data.map(getSubKey))] : []
  const subScale = subDomain.length > 1
    ? scaleBand().domain(subDomain).range([0, bandScale.bandwidth()]).padding(0.05)
    : null

  return data.map((d, i) => {
    const xVal = d[xf]
    const colorKey = cf ? d[cf] : null
    const patternKey = pf ? d[pf] : null
    const subKey = getSubKey(d)

    const colorEntry = colors?.get(colorKey) ?? colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
    const patternId = patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
      ? toPatternId(String(patternKey))
      : null

    const bandX = bandScale(xVal) ?? 0
    const subX = subScale && subKey ? (subScale(subKey) ?? 0) : 0
    const barX = bandX + subX
    const barWidth = subScale ? subScale.bandwidth() : bandScale.bandwidth()
    const barY = yScale(d[yf])
    const barHeight = innerHeight - barY

    return {
      data: d,
      key: `${String(xVal)}::${subKey}::${i}`,
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
  const { x: xf, y: yf, color: cf, pattern: pf } = channels

  const bandScale = ensureBandX(xScale, data, xf)

  // Stack dimension: first non-x grouping field (prefer pattern, then color)
  const subFields = subBandFields(channels)
  if (subFields.length === 0) {
    return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
  }
  const stackField = subFields[0]

  const xCategories = [...new Set(data.map((d) => d[xf]))]
  const stackCategories = [...new Set(data.map((d) => d[stackField]))]

  const lookup = new Map()
  for (const d of data) {
    if (!lookup.has(d[xf])) lookup.set(d[xf], {})
    lookup.get(d[xf])[d[stackField]] = Number(d[yf])
  }

  const wide = xCategories.map((xVal) => {
    const row = { [xf]: xVal }
    for (const sk of stackCategories) row[sk] = lookup.get(xVal)?.[sk] ?? 0
    return row
  })

  const stackGen = stack().keys(stackCategories)
  const layers = stackGen(wide)

  const bars = []
  for (const layer of layers) {
    const stackKey = layer.key

    for (const point of layer) {
      const [y0, y1] = point
      const xVal = point.data[xf]

      // Color lookup: cf may equal xf (= xVal) or stackField (= stackKey)
      const colorKey = cf
        ? (cf === xf ? xVal : cf === stackField ? stackKey : null)
        : null
      const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#888' }

      // Pattern lookup: pf may equal xf (= xVal) or stackField (= stackKey)
      const patternKey = pf
        ? (pf === xf ? xVal : pf === stackField ? stackKey : null)
        : null
      const patternId = patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
        ? toPatternId(String(patternKey))
        : null

      bars.push({
        data: point.data,
        key: `${String(xVal)}::${String(stackKey)}`,
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
