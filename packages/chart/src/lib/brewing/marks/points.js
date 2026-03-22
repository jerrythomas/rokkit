/**
 * Builds point geometry for scatter/bubble charts.
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, size?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {Function|null} sizeScale
 * @param {number} defaultRadius
 */
export function buildPoints(data, channels, xScale, yScale, colors, sizeScale, defaultRadius = 5) {
  const { x: xf, y: yf, color: cf, size: sf } = channels
  return data.map((d) => {
    const key = cf ? d[cf] : null
    const colorEntry = colors?.get(key) ?? { fill: '#888', stroke: '#444' }
    const r = sf && sizeScale ? sizeScale(d[sf]) : defaultRadius
    return {
      data: d,
      cx: xScale(d[xf]),
      cy: yScale(d[yf]),
      r,
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      key
    }
  })
}
