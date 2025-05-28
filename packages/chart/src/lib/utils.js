import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { max } from 'd3-array';

/**
 * Creates appropriate scales based on data and dimensions
 * 
 * @param {Array} data The dataset
 * @param {string} xKey Field to use for x-axis
 * @param {string} yKey Field to use for y-axis
 * @param {Object} dimensions Chart dimensions
 * @param {Object} [options] Additional options
 * @param {string} [options.colorKey] Field to use for color mapping
 * @returns {Object} Object containing xScale, yScale, and colorScale
 */
export function createScales(data, xKey, yKey, dimensions, options = {}) {
  if (!data || data.length === 0) return {};
  
  const xScale = scaleBand()
    .domain(data.map(d => d[xKey]))
    .range([0, dimensions.width])
    .padding(0.2);
  
  const yScale = scaleLinear()
    .domain([0, max(data, d => d[yKey]) * 1.1]) // Add 10% padding on top
    .nice()
    .range([dimensions.height, 0]);
  
  let colorScale = null;
  
  if (options.colorKey) {
    const uniqueCategories = [...new Set(data.map(d => d[options.colorKey]))];
    colorScale = scaleOrdinal()
      .domain(uniqueCategories)
      .range(schemeCategory10);
  }
  
  return { xScale, yScale, colorScale };
}

/**
 * Calculates the actual chart dimensions after applying margins
 * 
 * @param {Object} dimensions Original dimensions
 * @returns {Object} Dimensions with calculated inner width and height
 */
export function calculateChartDimensions(dimensions) {
  const { width, height, margin } = dimensions;
  
  return {
    ...dimensions,
    innerWidth: width - margin.left - margin.right,
    innerHeight: height - margin.top - margin.bottom
  };
}

/**
 * Normalizes data for use with D3 charts
 *
 * @param {Array|Object} inputData Raw data or dataset object
 * @returns {Array} Normalized data array
 */
export function normalizeData(inputData) {
  if (!inputData) return [];
  
  // If it's a dataset class instance, call select() to get the data
  if (inputData.select && typeof inputData.select === 'function') {
    return inputData.select();
  }
  
  // If it's already an array, return as is
  if (Array.isArray(inputData)) {
    return inputData;
  }
  
  return [];
}

/**
 * Generates a unique ID for SVG elements
 * 
 * @param {string} prefix Prefix for the ID
 * @returns {string} A unique ID
 */
export function uniqueId(prefix = 'chart') {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Formats tooltip content for a data point
 * 
 * @param {Object} d Data point
 * @param {Object} options Tooltip format options
 * @returns {string} Formatted tooltip HTML content
 */
export function formatTooltipContent(d, options = {}) {
  if (!d) return '';
  
  const { xKey, yKey, xFormat, yFormat } = options;
  
  if (xKey && yKey) {
    const xValue = d[xKey];
    const yValue = d[yKey];
    
    const xFormatted = xFormat ? xFormat(xValue) : xValue;
    const yFormatted = yFormat ? yFormat(yValue) : yValue;
    
    return `${xKey}: ${xFormatted}<br>${yKey}: ${yFormatted}`;
  }
  
  return Object.entries(d)
    .map(([key, value]) => `${key}: ${value}`)
    .join('<br>');
}

/**
 * Generates a tooltip formatter function
 * 
 * @param {Object} options Tooltip format options
 * @returns {Function} A function that formats tooltip content
 */
export function createTooltipFormatter(options = {}) {
  return (d) => formatTooltipContent(d, options);
}

/**
 * Calculates the transform attribute for SVG elements
 * 
 * @param {number} x X position
 * @param {number} y Y position
 * @returns {string} Transform attribute value
 */
export function transform(x, y) {
  return `translate(${x}, ${y})`;
}