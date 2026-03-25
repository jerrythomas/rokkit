import { symbol, symbolCircle, symbolSquare, symbolTriangle, symbolDiamond, symbolCross, symbolStar } from 'd3-shape'

const SYMBOL_TYPES = [symbolCircle, symbolSquare, symbolTriangle, symbolDiamond, symbolCross, symbolStar]
const SYMBOL_NAMES = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star']

/**
 * Returns a Map assigning shape names to distinct values, cycling through available shapes.
 * @param {unknown[]} values
 * @returns {Map<unknown, string>}
 */
export function assignSymbols(values) {
  return new Map(values.map((v, i) => [v, SYMBOL_NAMES[i % SYMBOL_NAMES.length]]))
}

/**
 * Builds an SVG path string for a given shape name and radius.
 * @param {string} shapeName
 * @param {number} r
 * @returns {string}
 */
export function buildSymbolPath(shapeName, r) {
  const idx = SYMBOL_NAMES.indexOf(shapeName)
  const type = idx >= 0 ? SYMBOL_TYPES[idx] : symbolCircle
  return symbol().type(type).size(Math.PI * r * r)() ?? ''
}

/**
 * Builds point geometry for scatter/bubble charts.
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, size?: string, symbol?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {Function|null} sizeScale
 * @param {Map<unknown, string>|null} symbolMap  — maps symbol field value → shape name
 * @param {number} defaultRadius
 */
export function buildPoints(data, channels, xScale, yScale, colors, sizeScale, symbolMap, defaultRadius = 5) {
  const { x: xf, y: yf, color: cf, size: sf, symbol: symf } = channels
  return data.map((d) => {
    const colorKey = cf ? d[cf] : null
    const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#444' }
    const r = sf && sizeScale ? sizeScale(d[sf]) : defaultRadius
    const shapeName = symf && symbolMap ? (symbolMap.get(d[symf]) ?? 'circle') : null
    const symbolPath = shapeName ? buildSymbolPath(shapeName, r) : null
    return {
      data: d,
      cx: xScale(d[xf]),
      cy: yScale(d[yf]),
      r,
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      symbolPath,
      key: colorKey
    }
  })
}
