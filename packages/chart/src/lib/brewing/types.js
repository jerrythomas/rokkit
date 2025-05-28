/**
 * @typedef {Object} ChartMargin
 * @property {number} top - Top margin
 * @property {number} right - Right margin
 * @property {number} bottom - Bottom margin
 * @property {number} left - Left margin
 */

/**
 * @typedef {Object} ChartDimensions
 * @property {number} width - Total chart width
 * @property {number} height - Total chart height
 * @property {ChartMargin} margin - Chart margins
 * @property {number} innerWidth - Chart width without margins
 * @property {number} innerHeight - Chart height without margins
 */

/**
 * @typedef {Object} ChartScales
 * @property {Function} x - X-axis scale function
 * @property {Function} y - Y-axis scale function
 * @property {Function} color - Color scale function
 */

/**
 * @typedef {Object} ScaleFields
 * @property {string} x - X-axis field
 * @property {string} y - Y-axis field
 * @property {string} color - Color field
 */

/**
 * @typedef {Object} TickData
 * @property {*} value - Tick value
 * @property {number} position - Tick position in pixels
 * @property {string} formattedValue - Formatted tick label
 */

/**
 * @typedef {Object} AxisData
 * @property {TickData[]} ticks - Tick data
 * @property {string} label - Axis label
 * @property {string} transform - SVG transform attribute value
 * @property {string} labelTransform - SVG transform for the label
 */

/**
 * @typedef {Object} BarData
 * @property {Object} data - Original data point
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Width of the bar
 * @property {number} height - Height of the bar 
 * @property {string} color - Color of the bar
 */

/**
 * @typedef {Object} LegendItem
 * @property {*} value - Legend item value
 * @property {string} color - Item color
 * @property {number} y - Y position
 * @property {string} shape - Shape type ('rect' or 'circle')
 * @property {number} markerSize - Size of the marker
 */

/**
 * @typedef {Object} LegendData
 * @property {LegendItem[]} items - Legend items
 * @property {string} title - Legend title
 * @property {string} transform - SVG transform attribute value
 */

export {};