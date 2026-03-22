import { pie, arc } from 'd3-shape'

/**
 * Builds arc geometry for pie/donut charts.
 * @param {Object[]} data
 * @param {{ label: string, y: string }} channels  — label used as color key
 * @param {Map} colors
 * @param {number} width
 * @param {number} height
 * @param {{ innerRadius?: number }} opts
 */
export function buildArcs(data, channels, colors, width, height, opts = {}) {
  const { label: lf, y: yf } = channels
  const radius = Math.min(width, height) / 2
  const innerRadius = opts.innerRadius ?? 0
  const pieGen = pie().value((d) => Number(d[yf]))
  const arcGen = arc().innerRadius(innerRadius).outerRadius(radius)
  return pieGen(data).map((slice) => {
    const key = slice.data[lf]
    const colorEntry = colors?.get(key) ?? { fill: '#888', stroke: '#fff' }
    return {
      d: arcGen(slice),
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      key,
      data: slice.data
    }
  })
}
