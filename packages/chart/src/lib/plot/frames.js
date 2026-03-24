import { extent } from 'd3-array'

/**
 * Extracts animation frames from data, keyed by time field value.
 * Preserves insertion order of time values.
 *
 * @param {Object[]} data
 * @param {string} timeField
 * @returns {Map<unknown, Object[]>}
 */
export function extractFrames(data, timeField) {
  const map = new Map()
  for (const row of data) {
    const key = row[timeField]
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(row)
  }
  return map
}

/**
 * Ensures all (x, color) combinations exist in the frame data.
 * Missing combinations are filled with y=0 so the animation
 * starts/ends smoothly without bars jumping in from nowhere.
 *
 * @param {Object[]} frameData - rows for a single frame
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {unknown[]} allXValues - all x values across all frames
 * @param {unknown[] | null} allColorValues - all color values across frames (null if no color)
 * @returns {Object[]}
 */
export function normalizeFrame(frameData, channels, allXValues, allColorValues) {
  const { x: xf, y: yf, color: cf } = channels

  if (cf && !allColorValues?.length) {
    throw new Error('normalizeFrame: allColorValues must be provided when color channel is set')
  }

  // Build lookup of existing (x, color?) keys
  const existing = new Set(
    frameData.map((d) => (cf ? `${d[xf]}::${d[cf]}` : String(d[xf])))
  )

  const filled = [...frameData]

  const colorValues = cf && allColorValues ? allColorValues : [null]

  for (const xVal of allXValues) {
    for (const colorVal of colorValues) {
      const key = cf ? `${xVal}::${colorVal}` : String(xVal)
      if (!existing.has(key)) {
        const row = { [xf]: xVal, [yf]: 0 }
        if (cf && colorVal !== null) row[cf] = colorVal
        filled.push(row)
      }
    }
  }

  return filled
}

/**
 * Computes static x/y domains across all frames combined.
 * These domains stay constant throughout the animation so bars
 * can be compared across frames by absolute height.
 *
 * NOTE: y domain is pinned to [0, max] — assumes bar chart semantics where
 * the baseline is always 0. If used with scatter or line charts where y can
 * be negative, pass an explicit `yDomain` override instead.
 *
 * @param {Map<unknown, Object[]>} frames
 * @param {{ x: string, y: string }} channels
 * @returns {{ xDomain: unknown[], yDomain: [number, number] }}
 */
export function computeStaticDomains(frames, channels) {
  const { x: xf, y: yf } = channels
  const allData = [...frames.values()].flat()

  const sampleX = allData[0]?.[xf]
  const xIsCategorical = typeof sampleX === 'string'

  const xDomain = xIsCategorical
    ? [...new Set(allData.map((d) => d[xf]))]
    : extent(allData, (d) => Number(d[xf]))

  const [, yMax] = extent(allData, (d) => Number(d[yf]))
  const yDomain = [0, yMax ?? 0]   // pin to 0 (bar chart default)

  return { xDomain, yDomain }
}
