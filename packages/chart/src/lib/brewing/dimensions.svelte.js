import { } from './types.js';

/**
 * @typedef {import('./types').ChartMargin} ChartMargin
 * @typedef {import('./types').ChartDimensions} ChartDimensions
 */

/**
 * Default chart margin
 * @type {ChartMargin}
 */
export const DEFAULT_MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };

/**
 * Creates chart dimensions based on width, height and margins
 * 
 * @param {number} width - Total chart width
 * @param {number} height - Total chart height
 * @param {ChartMargin} margin - Chart margins
 * @returns {ChartDimensions} Chart dimensions
 */
export function createDimensions(width = 600, height = 400, margin = DEFAULT_MARGIN) {
  return {
    width,
    height,
    margin: { ...margin },
    innerWidth: width - margin.left - margin.right,
    innerHeight: height - margin.top - margin.bottom
  };
}

/**
 * Updates existing dimensions with new values
 * 
 * @param {ChartDimensions} dimensions - Current dimensions
 * @param {Object} updates - Values to update
 * @param {number} [updates.width] - New width
 * @param {number} [updates.height] - New height
 * @param {ChartMargin} [updates.margin] - New margin
 * @returns {ChartDimensions} Updated dimensions
 */
export function updateDimensions(dimensions, updates = {}) {
  const newDimensions = { ...dimensions };
  
  if (updates.width !== undefined) newDimensions.width = updates.width;
  if (updates.height !== undefined) newDimensions.height = updates.height;
  if (updates.margin !== undefined) newDimensions.margin = { ...updates.margin };
  
  // Recalculate inner dimensions
  newDimensions.innerWidth = newDimensions.width - newDimensions.margin.left - newDimensions.margin.right;
  newDimensions.innerHeight = newDimensions.height - newDimensions.margin.top - newDimensions.margin.bottom;
  
  return newDimensions;
}