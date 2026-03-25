import { line, curveCatmullRom } from 'd3-shape'

// Relative widths at each stat anchor (fraction of max half-width)
const DENSITY_AT = { iqr_min: 0.08, q1: 0.55, median: 1.0, q3: 0.55, iqr_max: 0.08 }
const ANCHOR_ORDER = ['iqr_max', 'q3', 'median', 'q1', 'iqr_min']

/**
 * Builds a closed violin shape path for each group.
 * Input rows must have { q1, median, q3, iqr_min, iqr_max } from applyBoxStat.
 *
 * When `fill` differs from `x`, violins are sub-grouped within each x-band
 * (one narrower violin per fill value per x category, like grouped bars).
 * Violin body uses the lighter fill shade; outline uses the darker stroke shade.
 *
 * @param {Object[]} data
 * @param {{ x: string, fill?: string }} channels
 *   `fill` drives violin interior and outline (defaults to x-field).
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map} colors
 * @returns {Array}
 */
export function buildViolins(data, channels, xScale, yScale, colors) {
  const { x: xf, fill: ff } = channels
  const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 40
  const grouped = ff && ff !== xf

  const pathGen = line()
    .x((pt) => pt.x)
    .y((pt) => pt.y)
    .curve(curveCatmullRom.alpha(0.5))

  if (grouped) {
    const fillValues = [...new Set(data.map((d) => d[ff]))]
    const n = fillValues.length
    const subBandWidth = bw / n
    const halfMax = subBandWidth * 0.45

    return data.map((d) => {
      const fillVal = d[ff]
      const subIndex = fillValues.indexOf(fillVal)
      const bandStart = xScale(d[xf]) ?? 0
      const cx = bandStart + subIndex * subBandWidth + subBandWidth / 2
      const colorEntry = colors?.get(fillVal) ?? { fill: '#aaa', stroke: '#666' }

      const rightPts = ANCHOR_ORDER.map((key) => ({
        x: cx + halfMax * DENSITY_AT[key],
        y: yScale(d[key])
      }))
      const leftPts = [...ANCHOR_ORDER].reverse().map((key) => ({
        x: cx - halfMax * DENSITY_AT[key],
        y: yScale(d[key])
      }))

      return {
        data: d,
        cx,
        d:      pathGen([...rightPts, ...leftPts, rightPts[0]]),
        fill:   colorEntry.fill,
        stroke: colorEntry.stroke
      }
    })
  }

  // Non-grouped: one violin per x category
  const halfMax = bw * 0.45

  return data.map((d) => {
    const fillKey = ff ? d[ff] : d[xf]
    const colorEntry = colors?.get(fillKey) ?? { fill: '#aaa', stroke: '#666' }
    const cx = (xScale(d[xf]) ?? 0) + (typeof xScale.bandwidth === 'function' ? bw / 2 : 0)

    const rightPts = ANCHOR_ORDER.map((key) => ({
      x: cx + halfMax * DENSITY_AT[key],
      y: yScale(d[key])
    }))
    const leftPts = [...ANCHOR_ORDER].reverse().map((key) => ({
      x: cx - halfMax * DENSITY_AT[key],
      y: yScale(d[key])
    }))

    return {
      data: d,
      cx,
      d:      pathGen([...rightPts, ...leftPts, rightPts[0]]),
      fill:   colorEntry.fill,
      stroke: colorEntry.stroke
    }
  })
}
