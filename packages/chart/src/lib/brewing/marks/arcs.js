import { pie, arc } from 'd3-shape'
import { toPatternId } from '../../brewing/patterns.js'

/**
 * Builds arc geometry for pie/donut charts.
 * @param {Object[]} data
 * @param {{ color: string, y: string, pattern?: string }} channels
 * @param {Map} colors
 * @param {number} width
 * @param {number} height
 * @param {{ innerRadius?: number }} opts
 * @param {Map<unknown, string>} [patterns]
 */
export function buildArcs(data, channels, colors, width, height, opts = {}, patterns) {
  const { color: lf, y: yf } = channels
  const radius = Math.min(width, height) / 2
  const innerRadius = opts.innerRadius ?? 0
  const pieGen = pie().value((d) => Number(d[yf]))
  const arcGen = arc().innerRadius(innerRadius).outerRadius(radius)
  return pieGen(data).map((slice) => {
    const key = slice.data[lf]
    const colorEntry = colors?.get(key) ?? { fill: '#888', stroke: '#fff' }
    const patternId = key !== null && key !== undefined && patterns?.has(key)
      ? toPatternId(String(key)) : null
    return {
      d: arcGen(slice),
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      key,
      patternId,
      data: slice.data
    }
  })
}
