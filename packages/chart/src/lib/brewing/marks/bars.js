/**
 * @param {Object[]} data
 * @param {{ x: string, y: string, fill?: string, color?: string, pattern?: string }} channels
 *   `fill` drives the bar interior color. `color` drives the border stroke; falls back to fill.
 * @param {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map} colors - value→{fill,stroke}
 * @param {Map} [patternMap] - value→patternName
 * @returns {Array}
 */
import { toPatternId } from '../patterns.js'

export function buildBars(data, channels, xScale, yScale, colors, patternMap) {
  const { x: xf, y: yf, fill: ff, color: cf, pattern: pf } = channels
  const barWidth = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 10
  const innerHeight = yScale.range()[0]

  return data.map((d) => {
    const xVal = d[xf]
    const fillKey = ff ? d[ff] : xVal           // fill channel drives interior color
    const strokeKey = cf ? d[cf] : null          // color channel drives border; null = no border
    const colorEntry = colors?.get(fillKey) ?? { fill: '#888', stroke: '#444' }
    const strokeEntry = colors?.get(strokeKey) ?? colorEntry
    const patternKey = pf ? d[pf] : null
    const patternName = patternKey !== null && patternKey !== undefined ? patternMap?.get(patternKey) : null
    // When fill and pattern are different fields, bars need a composite pattern def id
    // so each (region, category) pair gets its uniquely colored+textured pattern.
    const compositePatternKey = (ff && pf && ff !== pf && patternKey !== null && patternKey !== undefined)
      ? `${d[ff]}::${patternKey}`
      : patternKey
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
      stroke: strokeKey !== null ? strokeEntry.stroke : null,
      colorKey: fillKey,
      patternKey,
      patternId: patternName ? toPatternId(compositePatternKey) : null
    }
  })
}
