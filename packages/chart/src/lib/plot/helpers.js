const BUILT_IN_GEOMS = new Set(['bar', 'line', 'area', 'point', 'box', 'violin', 'arc'])

export function resolveFormat(field, helpers = {}) {
  return helpers?.format?.[field] ?? ((v) => String(v))
}

export function resolveTooltip(helpers = {}) {
  return helpers?.tooltip ?? null
}

export function resolveGeom(type, helpers = {}) {
  if (BUILT_IN_GEOMS.has(type)) return null
  return helpers?.geoms?.[type] ?? null
}
