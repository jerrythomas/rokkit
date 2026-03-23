import { line, curveCatmullRom } from 'd3-shape'

// Relative widths at each stat anchor (fraction of max half-width)
const DENSITY_AT = { iqr_min: 0.08, q1: 0.55, median: 1.0, q3: 0.55, iqr_max: 0.08 }
const ANCHOR_ORDER = ['iqr_max', 'q3', 'median', 'q1', 'iqr_min']

/**
 * Builds a closed violin shape path for each group.
 * Input rows must have { q1, median, q3, iqr_min, iqr_max } from ViolinBrewer.
 *
 * @param {Object[]} data
 * @param {{ x: string, fill?: string, color?: string }} channels
 *   `fill` drives violin interior. `color` drives outline stroke; null = no stroke.
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map} colors
 * @returns {Array}
 */
export function buildViolins(data, channels, xScale, yScale, colors) {
  const { x: xf, fill: ff, color: cf } = channels
  const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 40
  const halfMax = bw * 0.45

  const pathGen = line()
    .x((pt) => pt.x)
    .y((pt) => pt.y)
    .curve(curveCatmullRom.alpha(0.5))

  return data.map((d) => {
    const fillKey = ff ? d[ff] : d[xf]
    const strokeKey = cf ? d[cf] : null
    const colorEntry = colors?.get(fillKey) ?? { fill: '#888', stroke: '#444' }
    const strokeEntry = strokeKey !== null ? (colors?.get(strokeKey) ?? colorEntry) : null
    const cx = (xScale(d[xf]) ?? 0) + (typeof xScale.bandwidth === 'function' ? bw / 2 : 0)

    // Build right-side points (top to bottom), then mirror for left side
    const rightPts = ANCHOR_ORDER.map((key) => ({
      x: cx + halfMax * DENSITY_AT[key],
      y: yScale(d[key])
    }))
    const leftPts = [...ANCHOR_ORDER].reverse().map((key) => ({
      x: cx - halfMax * DENSITY_AT[key],
      y: yScale(d[key])
    }))
    const pts = [...rightPts, ...leftPts, rightPts[0]]

    return {
      data: d,
      cx,
      d:      pathGen(pts),
      fill:   colorEntry.fill,
      stroke: strokeEntry ? strokeEntry.stroke : null
    }
  })
}
