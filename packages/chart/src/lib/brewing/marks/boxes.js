/**
 * Builds box geometry for box plot charts.
 * Input data rows must already contain { q1, median, q3, iqr_min, iqr_max } —
 * computed by applyBoxStat before reaching this function.
 *
 * When `fill` differs from `x`, boxes are sub-grouped within each x-band
 * (one narrower box per fill value per x category, like grouped bars).
 *
 * @param {Object[]} data - Pre-aggregated rows with quartile fields
 * @param {{ x: string, fill?: string, color?: string }} channels
 *   `fill` drives the box interior color. `color` drives whisker/border stroke; null = no stroke.
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map<unknown, {fill:string, stroke:string}>} colors
 * @returns {Array}
 */
export function buildBoxes(data, channels, xScale, yScale, colors) {
  const { x: xf, fill: ff, color: cf } = channels
  const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 20
  const grouped = ff && ff !== xf

  if (grouped) {
    const fillValues = [...new Set(data.map((d) => d[ff]))]
    const n = fillValues.length
    const subBandWidth = bw / n
    const boxWidth = subBandWidth * 0.75
    const whiskerWidth = subBandWidth * 0.4

    return data.map((d) => {
      const fillVal = d[ff]
      const subIndex = fillValues.indexOf(fillVal)
      const bandStart = xScale(d[xf]) ?? 0
      const cx = bandStart + subIndex * subBandWidth + subBandWidth / 2
      const colorEntry = colors?.get(fillVal) ?? { fill: '#888', stroke: '#444' }
      const strokeKey = cf ? d[cf] : null
      const strokeEntry = strokeKey !== null ? (colors?.get(strokeKey) ?? colorEntry) : null

      return {
        data: d,
        cx,
        q1:      yScale(d.q1),
        median:  yScale(d.median),
        q3:      yScale(d.q3),
        iqr_min: yScale(d.iqr_min),
        iqr_max: yScale(d.iqr_max),
        width:   boxWidth,
        whiskerWidth,
        fill:   colorEntry.fill,
        stroke: strokeEntry ? strokeEntry.stroke : null
      }
    })
  }

  // Non-grouped: one box per x category
  const boxWidth = bw * 0.6
  const whiskerWidth = bw * 0.3

  return data.map((d) => {
    const fillKey = ff ? d[ff] : d[xf]
    const strokeKey = cf ? d[cf] : null
    const colorEntry = colors?.get(fillKey) ?? { fill: '#888', stroke: '#444' }
    const strokeEntry = strokeKey !== null ? (colors?.get(strokeKey) ?? colorEntry) : null
    const cx = (xScale(d[xf]) ?? 0) + (typeof xScale.bandwidth === 'function' ? bw / 2 : 0)
    return {
      data: d,
      cx,
      q1:      yScale(d.q1),
      median:  yScale(d.median),
      q3:      yScale(d.q3),
      iqr_min: yScale(d.iqr_min),
      iqr_max: yScale(d.iqr_max),
      width:   boxWidth,
      whiskerWidth,
      fill:   colorEntry.fill,
      stroke: strokeEntry ? strokeEntry.stroke : null
    }
  })
}
