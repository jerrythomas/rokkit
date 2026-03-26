import { sum, mean, min, max, quantile, ascending } from 'd3-array'
import { dataset } from '@rokkit/data'

function sortedQuantile(values, p) {
  return quantile([...values].sort(ascending), p)
}

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
 * Computes box plot quartile statistics grouped by x (and optionally color).
 * Output rows have { q1, median, q3, iqr_min, iqr_max } replacing the raw y values.
 *
 * @param {Object[]} data
 * @param {{ x?: string, y?: string, color?: string }} channels
 * @returns {Object[]}
 */
export function applyBoxStat(data, channels) {
  const { x: xf, y: yf, color: cf } = channels
  if (!xf || !yf) return data
  const by = [xf, cf].filter(Boolean)
  return dataset(data)
    .groupBy(...by)
    .summarize((row) => row[yf], {
      q1:      (v) => sortedQuantile(v, 0.25),
      median:  (v) => sortedQuantile(v, 0.5),
      q3:      (v) => sortedQuantile(v, 0.75),
      iqr_min: (v) => { const q1 = sortedQuantile(v, 0.25); const q3 = sortedQuantile(v, 0.75); return q1 - 1.5 * (q3 - q1) },
      iqr_max: (v) => { const q1 = sortedQuantile(v, 0.25); const q3 = sortedQuantile(v, 0.75); return q3 + 1.5 * (q3 - q1) }
    })
    .rollup()
    .select()
}

/**
 * Aggregates data by one or more grouping fields, reducing the value field
 * using the given stat. Accepts a built-in name or a custom function.
 *
 * @param {Object[]} data
 * @param {{ by: string[], value: string, stat: string|Function }} opts
 * @returns {Object[]}
 */
function isIdentityOrEmpty(stat, by, value) {
  return stat === 'identity' || by.length === 0 || value === null || value === undefined
}

export function applyAggregate(data, { by, value, stat }) {
  if (isIdentityOrEmpty(stat, by, value)) return data
  const fn = typeof stat === 'function' ? stat : STAT_FNS[stat]
  if (fn === null || fn === undefined) return data
  return dataset(data)
    .groupBy(...by)
    .summarize((row) => row[value], { [value]: fn })
    .rollup()
    .select()
}
