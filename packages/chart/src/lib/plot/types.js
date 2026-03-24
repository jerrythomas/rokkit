// packages/chart/src/lib/plot/types.js
// JSDoc typedefs for the Plot system. No runtime code.

/**
 * @typedef {Object} GeomSpec
 * @property {string} type - Geom type: 'bar'|'line'|'area'|'point'|'box'|'violin'|'arc' or custom
 * @property {string} [x]
 * @property {string} [y]
 * @property {string} [color]
 * @property {string} [fill]
 * @property {string} [size]
 * @property {string} [symbol]
 * @property {string} [pattern]
 * @property {string} [stat] - Built-in or helpers.stats key
 * @property {Record<string, unknown>} [options]
 */

/**
 * @typedef {Object} PlotSpec
 * @property {Record<string, unknown>[]} data
 * @property {string} [x]
 * @property {string} [y]
 * @property {string} [color]
 * @property {string} [fill]
 * @property {string} [size]
 * @property {string} [symbol]
 * @property {string} [pattern]
 * @property {string} [theta]
 * @property {Record<string, string>} [labels]
 * @property {unknown[]} [xDomain]
 * @property {number[]} [yDomain]
 * @property {string} [xLabel]
 * @property {string} [yLabel]
 * @property {[number, number]} [axisOrigin]
 * @property {'categorical'|'sequential'|'diverging'} [colorScale]
 * @property {string} [colorScheme]
 * @property {number} [colorMidpoint]
 * @property {unknown[]} [colorDomain]
 * @property {GeomSpec[]} geoms
 * @property {{ by: string, cols?: number, scales?: 'fixed'|'free'|'free_x'|'free_y' }} [facet]
 * @property {{ by: string, duration?: number, loop?: boolean }} [animate]
 * @property {boolean} [grid]
 * @property {boolean} [legend]
 * @property {boolean} [tooltip]
 * @property {string} [title]
 * @property {string} [preset]
 * @property {number} [width]
 * @property {number} [height]
 * @property {'light'|'dark'} [mode]
 */

/**
 * @typedef {Object} PlotHelpers
 * @property {Record<string, (values: unknown[]) => unknown>} [stats]
 * @property {Record<string, (v: unknown) => string>} [format]
 * @property {(d: Record<string, unknown>) => string} [tooltip]
 * @property {Record<string, unknown>} [geoms]  Svelte components keyed by type name
 * @property {unknown} [colorScale]  d3 scale override
 * @property {{ colors: string[], patterns: string[], symbols: string[] }} [preset]
 * @property {Record<string, { colors: string[], patterns: string[], symbols: string[] }>} [presets]
 * @property {Record<string, unknown>} [patterns]  custom SVG pattern components keyed by name
 * @property {Record<string, unknown>} [symbols]   custom symbol shape components keyed by name
 */

export {}
