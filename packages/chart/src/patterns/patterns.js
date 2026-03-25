/**
 * Unified pattern library.
 *
 * Each entry is an array of mark descriptors.  All geometry is in normalized
 * 0–1 coordinates; the renderer scales by `size` at paint time.
 *
 * Mark types
 * ----------
 * circle   { cx, cy, r }
 * line     { x1, y1, x2, y2 }           coordinates may exceed 0–1 for seamless tiling
 * polygon  { points: [x,y][] }
 * rect     { x, y, w, h }
 * path     { d: [cmd, ...args][] }       SVG path commands as nested arrays (H/V take one arg)
 *
 * Appearance
 * ----------
 * fill: true      → element uses fill color (stroke: none)
 * fill: false     → element uses stroke color (fill: none)   ← default
 * fillOpacity: n  → applied as fill-opacity on filled marks
 * opacity: n      → applied as opacity on any mark
 */

/** @typedef {{ type: 'circle',  cx: number, cy: number, r: number,              fill?: boolean, fillOpacity?: number, opacity?: number }} CircleMark */
/** @typedef {{ type: 'line',    x1: number, y1: number, x2: number, y2: number, fill?: false,   strokeWidth?: number }} LineMark */
/** @typedef {{ type: 'polygon', points: [number,number][],                       fill?: boolean, fillOpacity?: number, opacity?: number }} PolygonMark */
/** @typedef {{ type: 'rect',    x: number,  y: number,  w: number,  h: number,  fill?: boolean, fillOpacity?: number, opacity?: number }} RectMark */
/** @typedef {{ type: 'path',    d: (string|number)[][],                          fill?: boolean, fillOpacity?: number, opacity?: number }} PathMark */
/** @typedef {CircleMark | LineMark | PolygonMark | RectMark | PathMark} PatternMark */

/** @type {Record<string, PatternMark[]>} */
export const PATTERNS = {
  // ── Line-based ──────────────────────────────────────────────────────────────

  brick: [
    { type: 'line', x1: 0,   y1: 0.25, x2: 0.5, y2: 0.25 },
    { type: 'line', x1: 0.5, y1: 0.75, x2: 1,   y2: 0.75 },
    { type: 'line', x1: 0,   y1: 0,    x2: 0,   y2: 1    },
    { type: 'line', x1: 1,   y1: 0,    x2: 1,   y2: 1    },
    { type: 'line', x1: 0.5, y1: 0,    x2: 0.5, y2: 1    }
  ],

  hatch: [
    { type: 'line', x1: 0,    y1: 0.25, x2: 1,    y2: 0.25 },
    { type: 'line', x1: 0,    y1: 0.5,  x2: 1,    y2: 0.5  },
    { type: 'line', x1: 0,    y1: 0.75, x2: 1,    y2: 0.75 },
    { type: 'line', x1: 0.25, y1: 0,    x2: 0.25, y2: 1    },
    { type: 'line', x1: 0.5,  y1: 0,    x2: 0.5,  y2: 1    },
    { type: 'line', x1: 0.75, y1: 0,    x2: 0.75, y2: 1    }
  ],

  // Coordinates intentionally exceed 0–1 so lines tile seamlessly at tile edges
  diagonal: [
    { type: 'line', x1: -0.5, y1: 0.5,  x2: 0.5,  y2: -0.5 },
    { type: 'line', x1:  0,   y1: 1,    x2: 1,    y2:  0   },
    { type: 'line', x1:  0.5, y1: 1.5,  x2: 1.5,  y2:  0.5 }
  ],

  // Two sets of diagonals crossing to form a diamond lattice
  diamonds: [
    { type: 'line', x1:  0,   y1: 1,    x2: 1,    y2:  0   },
    { type: 'line', x1: -0.5, y1: 0.5,  x2: 0.5,  y2: -0.5 },
    { type: 'line', x1:  0.5, y1: 1.5,  x2: 1.5,  y2:  0.5 },
    { type: 'line', x1:  0,   y1: 0,    x2: 1,    y2:  1   },
    { type: 'line', x1: -0.5, y1: 0.5,  x2: 0.5,  y2:  1.5 },
    { type: 'line', x1:  0.5, y1: -0.5, x2: 1.5,  y2:  0.5 }
  ],

  tile: [
    { type: 'line', x1: 0,   y1: 0.5, x2: 1,   y2: 0.5 },
    { type: 'line', x1: 0.5, y1: 0,   x2: 0.5, y2: 1   }
  ],

  // ── Path-based ──────────────────────────────────────────────────────────────

  swell: [
    { type: 'path', d: [['M', 0, 0.3], ['A', 0.6, 0.5, 0, 0, 0, 1, 0.3]] }
  ],

  waves: [
    { type: 'path', d: [['M', 0, 0.5], ['L', 0.25, 0], ['L', 0.75, 1], ['L', 1, 0.5]] }
  ],

  // ── Circle-based ────────────────────────────────────────────────────────────

  // Small filled dots in an X pattern across the tile
  dots: [
    { type: 'circle', cx: 0.2, cy: 0.2, r: 0.08, fill: true },
    { type: 'circle', cx: 0.4, cy: 0.4, r: 0.08, fill: true },
    { type: 'circle', cx: 0.6, cy: 0.6, r: 0.08, fill: true },
    { type: 'circle', cx: 0.8, cy: 0.8, r: 0.08, fill: true },
    { type: 'circle', cx: 0.8, cy: 0.2, r: 0.08, fill: true },
    { type: 'circle', cx: 0.6, cy: 0.4, r: 0.08, fill: true },
    { type: 'circle', cx: 0.4, cy: 0.6, r: 0.08, fill: true },
    { type: 'circle', cx: 0.2, cy: 0.8, r: 0.08, fill: true }
  ],

  // Outlined diamond (rotated square)
  lattice: [
    { type: 'polygon', points: [[0.5, 0.22], [0.78, 0.5], [0.5, 0.78], [0.22, 0.5]] }
  ],

  // Fish-scale geometry as stroke only — same circles as petals, no fill
  scales: [
    {
      type: 'path',
      d: [
        ['M', -0.7071, 0],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        ['M',  0.2929, 0],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        ['M', -0.2071, 0.5],  ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        ['M', -0.7071, 1],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        ['M',  0.2929, 1],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
      ]
    }
  ],

  // Filled circles at tile corners + center (5-point dice pattern)
  circles: [
    { type: 'circle', cx: 0.5, cy: 0.5, r: 0.2, fill: true },
    { type: 'circle', cx: 0,   cy: 0,   r: 0.2, fill: true },
    { type: 'circle', cx: 1,   cy: 0,   r: 0.2, fill: true },
    { type: 'circle', cx: 0,   cy: 1,   r: 0.2, fill: true },
    { type: 'circle', cx: 1,   cy: 1,   r: 0.2, fill: true }
  ],

  // Diagonal cross strokes with a filled circle at the center
  pip: [
    { type: 'line',   x1: 0, y1: 0, x2: 1, y2: 1 },
    { type: 'line',   x1: 0, y1: 1, x2: 1, y2: 0 },
    { type: 'circle', cx: 0.5, cy: 0.5, r: 0.22, fill: true }
  ],

  // Two outlined circles + two filled circles in a 2×2 grid
  rings: [
    { type: 'circle', cx: 0.25, cy: 0.25, r: 0.2              },
    { type: 'circle', cx: 0.75, cy: 0.75, r: 0.2              },
    { type: 'circle', cx: 0.25, cy: 0.75, r: 0.2, fill: true },
    { type: 'circle', cx: 0.75, cy: 0.25, r: 0.2, fill: true }
  ],

  // Fish-scale: circles centered at corners + tile center, r = 0.5√2 so each
  // circle passes through its adjacent neighbors' centers. Even-odd fill produces
  // the scallop/petal pattern where overlapping regions alternate filled/clear.
  petals: [
    {
      type: 'path', fill: true, fillRule: 'evenodd',
      d: [
        // center (0, 0)   r=0.7071  leftmost = (-0.7071, 0)
        ['M', -0.7071, 0],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        // center (1, 0)   leftmost = (0.2929, 0)
        ['M',  0.2929, 0],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        // center (0.5, 0.5)  leftmost = (-0.2071, 0.5)
        ['M', -0.2071, 0.5],  ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        // center (0, 1)   leftmost = (-0.7071, 1)
        ['M', -0.7071, 1],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
        // center (1, 1)   leftmost = (0.2929, 1)
        ['M',  0.2929, 1],    ['a', 0.7071, 0.7071, 0, 1, 0,  1.4142, 0], ['a', 0.7071, 0.7071, 0, 1, 0, -1.4142, 0],
      ]
    }
  ],

  // ── Polygon-based ───────────────────────────────────────────────────────────

  // Three filled triangles tiling the corners + center of the tile
  triangles: [
    { type: 'polygon', points: [[0, 0.5], [0.5, 1], [0, 1]],     fill: true },
    { type: 'polygon', points: [[0.5, 0], [0, 0],   [0, 0.5]],   fill: true },
    { type: 'polygon', points: [[1, 0],   [0.5, 0.5], [1, 1]],   fill: true }
  ],

  // Two filled triangles scattered at opposite corners
  shards: [
    { type: 'polygon', points: [[0.25, 0.017], [0, 0.417], [0.5, 0.417]], fill: true },
    { type: 'polygon', points: [[0.5, 0.583], [1, 0.583], [0.75, 0.983]], fill: true }
  ],

  // Diagonal corner split — two-tone polygon division
  wedge: [
    { type: 'polygon', points: [[1, 1], [0.45, 1], [0, 0.55], [0, 0]],                 fill: true },
    { type: 'polygon', points: [[1, 0], [0, 0], [1, 1]],               fill: true, fillOpacity: 0.55 }
  ],

  // Two triangles pointing inward from top and bottom edges
  argyle: [
    { type: 'polygon', points: [[1, 0], [0.5, 0.5], [0, 0]],   fill: true },
    { type: 'polygon', points: [[1, 1], [0.5, 0.5], [0, 1]],   fill: true }
  ],

  // triangles pattern rotated 90° clockwise: (x,y) → (1−y, x)
  chevrons: [
    { type: 'polygon', points: [[0, 0], [0.5, 0], [0, 0.5]],   fill: true },
    { type: 'polygon', points: [[0.5, 0], [1, 0], [1, 0.5]],   fill: true },
    { type: 'polygon', points: [[0, 1], [1, 1], [0.5, 0.5]],   fill: true }
  ],

  // ── Rect-based ──────────────────────────────────────────────────────────────

  checkerboard: [
    { type: 'rect', x: 0,   y: 0,   w: 0.5, h: 0.5, fill: true },
    { type: 'rect', x: 0.5, y: 0.5, w: 0.5, h: 0.5, fill: true }
  ],

  // Quarter-circle filled shape (bottom-left corner) with two accent dots
  shell: [
    { type: 'path', d: [['M', 0, 1], ['V', 0], ['H', 0.6], ['V', 0.4], ['A', 0.6, 0.6, 0, 0, 1, 0, 1]], fill: true },
    { type: 'circle', cx: 0.798, cy: 0.298, r: 0.081, fill: true },
    { type: 'circle', cx: 0.798, cy: 0.702, r: 0.081, fill: true }
  ],
}
