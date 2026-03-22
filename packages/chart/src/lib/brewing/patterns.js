export const PATTERN_ORDER = [
  'Dots',
  'CrossHatch',
  'Waves',
  'Brick',
  'Triangles',
  'Circles',
  'Tile',
  'OutlineCircles',
  'CurvedWave'
]

/**
 * Assigns patterns from PATTERN_ORDER to an array of distinct values.
 * @param {unknown[]} values
 * @returns {Map<unknown, string>}
 */
export function assignPatterns(values) {
  return new Map(values.map((v, i) => [v, PATTERN_ORDER[i % PATTERN_ORDER.length]]))
}
