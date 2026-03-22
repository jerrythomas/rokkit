/**
 * Builds point geometry for scatter/bubble charts.
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, size?: string, symbol?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {Function|null} sizeScale
 * @param {Map} symbolMap
 * @param {number} defaultRadius
 */
export function buildPoints(data, channels, xScale, yScale, colors, sizeScale, symbolMap, defaultRadius = 5) {
  const { x: xf, y: yf, color: cf, size: sf, symbol: symf } = channels
  return data.map((d) => {
    const colorKey = cf ? d[cf] : null
    const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#444' }
    const r = sf && sizeScale ? sizeScale(d[sf]) : defaultRadius
    const shape = symf ? (symbolMap?.get(d[symf]) ?? 'circle') : 'circle'
    return {
      data: d,
      cx: xScale(d[xf]),
      cy: yScale(d[yf]),
      r,
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      shape,
      key: colorKey
    }
  })
}
