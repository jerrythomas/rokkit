/**
 * Shared JSDoc type definitions for chart component props.
 * Import these in chart components with:
 *   @type {import('./lib/plot/chartProps.js').ChartProps}
 */

/**
 * @typedef {Object} ChartProps
 * Common props shared by all high-level chart wrappers.
 *
 * @property {Object[]} [data=[]]        - Data array to visualize
 * @property {string}   [x]              - Field name for the X axis
 * @property {string}   [y]              - Field name for the Y axis
 * @property {string}   [fill]           - Field name for fill color grouping (alias for color)
 * @property {string}   [color]          - Field name for color grouping
 * @property {string}   [pattern]        - Field name for pattern fill grouping
 * @property {string}   [stat='identity']- Aggregation stat: 'identity' | 'sum' | 'mean' | 'count' | 'min' | 'max' | 'median' | 'boxplot'
 * @property {number}   [width=600]      - SVG width in pixels
 * @property {number}   [height=400]     - SVG height in pixels
 * @property {string}   [mode='light']   - Color mode: 'light' | 'dark'
 * @property {boolean}  [grid=true]      - Whether to show grid lines
 * @property {boolean}  [legend=false]   - Whether to show the legend
 */

/**
 * @typedef {Object} BarChartProps
 * @extends ChartProps
 * @property {boolean} [stack=false]     - Stack bars (true) or group them (false)
 */

/**
 * @typedef {Object} PieChartProps
 * @property {Object[]} [data=[]]        - Data array to visualize
 * @property {string}   [label]          - Field name for slice labels (drives color key)
 * @property {string}   [y]              - Field name for slice values (theta)
 * @property {string}   [fill]           - Alternative to label for color grouping
 * @property {number}   [innerRadius=0]  - Inner radius as fraction of outer (0=pie, 0.5=donut)
 * @property {string}   [stat='sum']     - Aggregation stat (default sum for pie charts)
 * @property {number}   [width=400]      - SVG width in pixels
 * @property {number}   [height=400]     - SVG height in pixels
 * @property {string}   [mode='light']   - Color mode: 'light' | 'dark'
 * @property {boolean}  [legend=false]   - Whether to show the legend
 */

/**
 * @typedef {Object} BoxViolinChartProps
 * @property {Object[]} [data=[]]        - Data array to visualize
 * @property {string}   [x]              - Field name for the category axis (groups)
 * @property {string}   [y]              - Field name for the value axis (raw observations)
 * @property {string}   [fill]           - Field name for interior fill color; when different from x, sub-groups within each x-band (like grouped bars)
 * @property {string}   [color]          - Field name for whisker/outline stroke color (optional, independent of fill)
 * @property {number}   [width=600]      - SVG width in pixels
 * @property {number}   [height=400]     - SVG height in pixels
 * @property {string}   [mode='light']   - Color mode: 'light' | 'dark'
 * @property {boolean}  [grid=true]      - Whether to show grid lines
 * @property {boolean}  [legend=false]   - Whether to show the legend
 */

/**
 * @typedef {Object} ScatterBubbleChartProps
 * @property {Object[]} [data=[]]        - Data array to visualize
 * @property {string}   [x]              - Field name for X position
 * @property {string}   [y]              - Field name for Y position
 * @property {string}   [color]          - Field name for color grouping
 * @property {string}   [size]           - Field name for point radius (BubbleChart: required)
 * @property {number}   [width=600]      - SVG width in pixels
 * @property {number}   [height=400]     - SVG height in pixels
 * @property {string}   [mode='light']   - Color mode: 'light' | 'dark'
 * @property {boolean}  [grid=true]      - Whether to show grid lines
 * @property {boolean}  [legend=false]   - Whether to show the legend
 */

/**
 * @typedef {Object} LineAreaChartProps
 * @extends ChartProps
 * @property {string}   [curve]          - Line interpolation: 'linear' | 'smooth' | 'step'
 */
