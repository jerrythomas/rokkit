import { sum, mean, min, max, median } from 'd3-array'
import { applyAggregate } from '../brewing/stats.js'

const BUILT_IN_STATS = {
  sum,
  mean,
  min,
  max,
  count: (values) => values.length,
  median
}

/**
 * Resolves a stat name to an aggregation function.
 * Checks built-ins first, then helpers.stats, then warns and falls back to identity.
 *
 * @param {string} name
 * @param {Object} helpers
 * @returns {Function}
 */
export function resolveStat(name, helpers = {}) {
  if (name === 'identity') return (data) => data
  if (BUILT_IN_STATS[name]) return BUILT_IN_STATS[name]
  if (helpers?.stats?.[name]) return helpers.stats[name]
  console.warn(
    `[Plot] Unknown stat "${name}" — falling back to identity. Add it to helpers.stats to suppress this warning.`
  )
  return (data) => data
}

/**
 * Infers group-by fields from channels by excluding value fields.
 * valueFields may contain channel keys (e.g. ['y', 'size']) OR field values (e.g. ['cty']).
 * A channel's field is excluded if either the channel key OR the field value is in valueFields.
 *
 * @param {Record<string, string|undefined>} channels
 * @param {string[]} valueFields
 * @returns {string[]}
 */
export function inferGroupByFields(channels, valueFields) {
  const seen = new Set()
  const result = []
  for (const [key, field] of Object.entries(channels)) {
    if (!field) continue
    if (valueFields.includes(key) || valueFields.includes(field)) continue
    if (seen.has(field)) continue
    seen.add(field)
    result.push(field)
  }
  return result
}

/**
 * Applies a stat aggregation to data based on a geom config.
 * Returns data unchanged for identity stat.
 *
 * @param {Object[]} data
 * @param {{ stat?: string, channels?: Record<string, string> }} geomConfig
 * @param {Object} helpers
 * @returns {Object[]}
 */
export function applyGeomStat(data, geomConfig, helpers = {}) {
  const { stat = 'identity', channels = {} } = geomConfig
  if (stat === 'identity') return data

  const statFn = resolveStat(stat, helpers)

  const VALUE_CHANNEL_KEYS = ['y', 'size', 'theta']
  const groupByFields = inferGroupByFields(channels, VALUE_CHANNEL_KEYS)
  const primaryKey = VALUE_CHANNEL_KEYS.find((k) => channels[k])
  if (!primaryKey) return data

  let result = applyAggregate(data, {
    by: groupByFields,
    value: channels[primaryKey],
    stat: statFn
  })

  for (const key of VALUE_CHANNEL_KEYS.filter((k) => k !== primaryKey && channels[k])) {
    const extra = applyAggregate(data, { by: groupByFields, value: channels[key], stat: statFn })
    const index = new Map(extra.map((r) => [groupByFields.map((f) => r[f]).join('|'), r]))
    result = result.map((r) => {
      const mapKey = groupByFields.map((f) => r[f]).join('|')
      const extraRow = index.get(mapKey)
      return extraRow ? { ...r, [channels[key]]: extraRow[channels[key]] } : r
    })
  }

  return result
}
