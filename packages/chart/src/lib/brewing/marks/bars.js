/**
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map} colors - value→{fill,stroke}
 * @returns {Array}
 */
export function buildBars(data, channels, xScale, yScale, colors) {
  const { x: xf, y: yf, color: cf } = channels
  const barWidth = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 10
  const innerHeight = yScale.range()[0]

  return data.map((d) => {
    const xVal = d[xf]
    const colorKey = cf ? d[cf] : xVal
    const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#444' }
    const barX = typeof xScale.bandwidth === 'function'
      ? xScale(xVal)
      : xScale(xVal) - barWidth / 2
    const barY = yScale(d[yf])
    return {
      data: d,
      x: barX,
      y: barY,
      width: barWidth,
      height: innerHeight - barY,
      fill: colorEntry.fill,
      stroke: colorEntry.stroke
    }
  })
}
