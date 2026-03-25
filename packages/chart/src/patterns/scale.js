/**
 * Mark geometry scaling and attribute resolution utilities.
 *
 * All pattern coordinates are stored normalized 0–1.  `scaleMark` multiplies
 * every geometric value by `size`.  `resolveMarkAttrs` then folds in the
 * runtime fill/stroke colors and produces a plain object whose keys are
 * valid SVG attribute names, ready for spread (`{...attrs}`).
 *
 * Path `A` (arc) commands: indices 2, 3, 4 are xRotation, largeArcFlag, and
 * sweepFlag — NOT coordinates — and are never scaled.
 *
 * Source → SVG name mappings applied by scaleMark:
 *   rect  w → width,  h → height
 *   polygon  points [[x,y]…] → SVG points string
 *   path  d [[cmd,…]…] → SVG d string
 */

/** @import { PatternMark } from './patterns.js' */

/**
 * Scale a single SVG path command by `size`.
 * @param {(string|number)[]} cmd
 * @param {number} size
 * @returns {(string|number)[]}
 */
function scalePathCmd(cmd, size) {
  const [op, ...args] = cmd
  if (op === 'A' || op === 'a') {
    return [op, args[0] * size, args[1] * size, args[2], args[3], args[4], args[5] * size, args[6] * size]
  }
  return [op, ...args.map((v) => (typeof v === 'number' ? v * size : v))]
}

/**
 * Scale all geometric coordinates in a mark by `size`.
 * Renames rect `w`/`h` to `width`/`height` and converts polygon/path to strings.
 * @param {PatternMark} mark
 * @param {number} size
 * @returns {object}
 */
export function scaleMark(mark, size) {
  switch (mark.type) {
    case 'line':
      return { ...mark, x1: mark.x1 * size, y1: mark.y1 * size, x2: mark.x2 * size, y2: mark.y2 * size }
    case 'circle':
      return { ...mark, cx: mark.cx * size, cy: mark.cy * size, r: mark.r * size }
    case 'rect': {
      const { w, h, ...rest } = mark
      return { ...rest, x: mark.x * size, y: mark.y * size, width: w * size, height: h * size }
    }
    case 'polygon':
      return { ...mark, points: mark.points.map(([x, y]) => `${x * size},${y * size}`).join(' ') }
    case 'path':
      return { ...mark, d: mark.d.map((cmd) => scalePathCmd(cmd, size)).map((cmd) => cmd.join(' ')).join(' ') }
    default:
      return mark
  }
}

/**
 * Resolve a scaled mark into SVG-ready `{ type, attrs }`.
 * `attrs` can be spread directly onto the SVG element.
 *
 * Per-mark overrides respected:
 *   mark.strokeWidth  → `stroke-width` (takes precedence over `thickness`)
 *   mark.fillOpacity  → `fill-opacity`
 *   mark.opacity      → `opacity`
 *
 * @param {object} scaledMark  Output of scaleMark
 * @param {{ fill: string, stroke: string, thickness: number }} appearance
 * @returns {{ type: string, attrs: object }}
 */
export function resolveMarkAttrs(scaledMark, { fill, stroke, thickness }) {
  const { type, fill: isFill, strokeWidth, fillOpacity, opacity, fillRule, ...geometry } = scaledMark

  const attrs = {
    ...geometry,
    fill: isFill ? fill : 'none',
    stroke: isFill ? 'none' : stroke,
    'stroke-width': isFill ? 0 : (strokeWidth ?? thickness),
  }
  if (fillOpacity !== null && fillOpacity !== undefined) attrs['fill-opacity'] = fillOpacity
  if (opacity !== null && opacity !== undefined) attrs.opacity = opacity
  if (fillRule !== null && fillRule !== undefined) attrs['fill-rule'] = fillRule

  return { type, attrs }
}
