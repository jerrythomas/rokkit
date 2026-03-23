import { sum, mean, min, max } from 'd3-array'
import { dataset } from '@rokkit/data'

/**
 * Built-in reduction functions. Each receives an array of numeric values.
 * @type {Record<string, (values: number[]) => number>}
 */
export const STAT_FNS = {
  sum,
  mean,
  min,
  max,
  count: (values) => values.length
}

/**
 * Aggregates data by one or more grouping fields, reducing the value field
 * using the given stat. Accepts a built-in name or a custom function.
 *
 * @param {Object[]} data
 * @param {{ by: string[], value: string, stat: string|Function }} opts
 * @returns {Object[]}
 */
export function applyAggregate(data, { by, value, stat }) {
  if (stat === 'identity' || by.length === 0 || value === null || value === undefined) return data
  const fn = typeof stat === 'function' ? stat : STAT_FNS[stat]
  if (fn === null || fn === undefined) return data
  return dataset(data)
    .groupBy(...by)
    .summarize((row) => row[value], { [value]: fn })
    .rollup()
    .select()
}
