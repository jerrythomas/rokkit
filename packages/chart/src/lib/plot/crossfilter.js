/**
 * Applies dimming state to data rows using crossfilter instance.
 * Maps each row to { data: row, dimmed: boolean }.
 *
 * @param {Object[]} data - raw data array
 * @param {Object} cf - crossfilter instance (from createCrossFilter)
 * @param {Object} channels - { x, y, color, ... } field name mapping
 * @returns {{ data: Object, dimmed: boolean }[]}
 */
export function applyDimming(data, cf, channels) {
  const fields = Object.values(channels).filter(Boolean)
  return data.map((row) => {
    const dimmed = fields.some((field) => cf.isDimmed(field, row[field]))
    return { data: row, dimmed }
  })
}
