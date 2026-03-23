import { distinct, assignColors } from './colors.js'
import { assignPatterns, toPatternId, PATTERN_ORDER } from './patterns.js'
import { assignSymbols } from './symbols.js'
import { buildXScale, buildYScale, buildSizeScale } from './scales.js'
import { buildBars } from './marks/bars.js'
import { buildLines } from './marks/lines.js'
import { buildAreas } from './marks/areas.js'
import { buildArcs } from './marks/arcs.js'
import { buildPoints } from './marks/points.js'

const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 }

/**
 * Groups aesthetic channel mappings by field name, merging aesthetics that
 * share the same field into one legend section.
 *
 * @param {{ fill?: string, color?: string, pattern?: string, symbol?: string }} channels
 *   `fill` takes precedence over `color` for polygon charts (bars, areas, pie slices).
 * @param {Map<unknown, {fill:string, stroke:string}>} colorMap
 * @param {Map<unknown, string>} patternMap
 * @param {Map<unknown, string>} symbolMap
 * @returns {{ field: string, items: { label: string, fill: string|null, stroke: string|null, patternId: string|null, shape: string|null }[] }[]}
 */
export function buildLegendGroups(channels, colorMap, patternMap, symbolMap) {
  const cf = channels.fill ?? channels.color
  const { pattern: pf, symbol: sf } = channels
  const byField = new Map()

  if (cf) {
    byField.set(cf, { aesthetics: ['color'], keys: [...colorMap.keys()] })
  }
  if (pf) {
    if (byField.has(pf)) {
      byField.get(pf).aesthetics.push('pattern')
    } else {
      byField.set(pf, { aesthetics: ['pattern'], keys: [...patternMap.keys()] })
    }
  }
  if (sf) {
    if (byField.has(sf)) {
      byField.get(sf).aesthetics.push('symbol')
    } else {
      byField.set(sf, { aesthetics: ['symbol'], keys: [...symbolMap.keys()] })
    }
  }

  return [...byField.entries()].map(([field, { aesthetics, keys }]) => ({
    field,
    items: keys.filter((k) => k !== null && k !== undefined).map((key) => ({
      label: String(key),
      fill: aesthetics.includes('color') ? (colorMap.get(key)?.fill ?? null) : null,
      stroke: aesthetics.includes('color') ? (colorMap.get(key)?.stroke ?? null) : null,
      patternId:
        aesthetics.includes('pattern') && patternMap.has(key) ? toPatternId(key) : null,
      shape: aesthetics.includes('symbol') ? (symbolMap.get(key) ?? 'circle') : null
    }))
  })).filter((group) => group.items.length > 0)
}

export class ChartBrewer {
  #rawData = $state([])
  #channels = $state({})
  #width = $state(600)
  #height = $state(400)
  #mode = $state('light')
  #margin = $state(DEFAULT_MARGIN)
  #layers = $state([])
  #curve = $state(/** @type {'linear'|'smooth'|'step'|undefined} */(undefined))
  #stat = $state('identity')

  /**
   * Override in subclasses to apply stat aggregation.
   * @param {Object[]} data
   * @param {Object} channels
   * @param {string|Function} stat
   * @returns {Object[]}
   */
  transform(data, _channels, _stat) {
    return data
  }

  /** Aggregated data — all derived marks read this, not #rawData */
  processedData = $derived(this.transform(this.#rawData, this.#channels, this.#stat))

  /** Exposes channels to subclasses for use in their own $derived properties */
  get channels() { return this.#channels }

  // Maps are built from rawData so the legend always reflects the full set of
  // original values — independent of whichever stat aggregation is applied.
  // e.g. pattern=quarter with stat=sum still shows all 8 quarters in the legend.

  /** @type {Map<unknown, {fill:string,stroke:string}>} */
  colorMap = $derived(
    (this.#channels.fill ?? this.#channels.color)
      ? assignColors(distinct(this.#rawData, this.#channels.fill ?? this.#channels.color), this.#mode)
      : new Map()
  )

  /** @type {Map<unknown, string>} */
  patternMap = $derived(
    this.#channels.pattern
      ? assignPatterns(distinct(this.#rawData, this.#channels.pattern))
      : new Map()
  )

  /**
   * Unified pattern defs for ChartPatternDefs.
   * When fill and pattern map the same field, pattern key = color key (simple case).
   * When they differ, each unique (fillKey, patternKey) pair gets its own pattern def
   * so bars/areas can have distinct colors per region AND distinct textures per category.
   * @type {Array<{ id: string, name: string, fill: string, stroke: string }>}
   */
  patternDefs = $derived((() => {
    const pf = this.#channels.pattern
    const ff = this.#channels.fill ?? this.#channels.color
    if (!pf || this.patternMap.size === 0) return []
    if (!ff || pf === ff) {
      // Same field: pattern key = fill key — simple 1:1 lookup
      return Array.from(this.patternMap.entries()).map(([key, name]) => {
        const color = this.colorMap.get(key) ?? { fill: '#ddd', stroke: '#666' }
        return { id: toPatternId(key), name, fill: color.fill, stroke: color.stroke }
      })
    }
    // Different fields: need two sets of defs in the SVG:
    // 1. Simple defs (neutral background) — referenced by legend swatches via toPatternId(patternKey)
    // 2. Composite defs (fill-colored background) — referenced by bars via toPatternId(fillKey::patternKey)
    const defs = []
    for (const [pk, name] of this.patternMap.entries()) {
      defs.push({ id: toPatternId(pk), name, fill: '#ddd', stroke: '#666' })
    }
    const seenComposite = new Set()
    for (const d of this.processedData) {
      const fk = d[ff]
      const pk = d[pf]
      if (pk === null || pk === undefined) continue
      const compositeKey = `${fk}::${pk}`
      if (seenComposite.has(compositeKey)) continue
      seenComposite.add(compositeKey)
      const name = this.patternMap.get(pk) ?? PATTERN_ORDER[0]
      const color = this.colorMap.get(fk) ?? { fill: '#ddd', stroke: '#666' }
      defs.push({ id: toPatternId(compositeKey), name, fill: color.fill, stroke: color.stroke })
    }
    return defs
  })())

  /** @type {Map<unknown, string>} */
  symbolMap = $derived(
    this.#channels.symbol
      ? assignSymbols(distinct(this.#rawData, this.#channels.symbol))
      : new Map()
  )

  get innerWidth()  { return this.#width  - this.#margin.left - this.#margin.right }
  get innerHeight() { return this.#height - this.#margin.top  - this.#margin.bottom }

  xScale = $derived(
    this.#channels.x
      ? buildXScale(this.processedData, this.#channels.x, this.innerWidth)
      : null
  )

  yScale = $derived(
    this.#channels.y
      ? buildYScale(this.processedData, this.#channels.y, this.innerHeight, this.#layers)
      : null
  )

  sizeScale = $derived(
    this.#channels.size
      ? buildSizeScale(this.processedData, this.#channels.size)
      : null
  )

  bars = $derived(
    this.xScale && this.yScale
      ? buildBars(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.patternMap)
      : []
  )

  lines = $derived(
    this.xScale && this.yScale
      ? buildLines(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.#curve)
      : []
  )

  areas = $derived(
    this.xScale && this.yScale
      ? buildAreas(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.#curve, this.patternMap)
      : []
  )

  arcs = $derived(
    this.#channels.y
      ? buildArcs(this.processedData, this.#channels, this.colorMap, this.#width, this.#height)
      : []
  )

  points = $derived(
    this.xScale && this.yScale
      ? buildPoints(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.sizeScale, this.symbolMap)
      : []
  )

  legendGroups = $derived(
    buildLegendGroups(this.#channels, this.colorMap, this.patternMap, this.symbolMap)
  )

  get margin()  { return this.#margin }
  get width()   { return this.#width }
  get height()  { return this.#height }
  get mode()    { return this.#mode }

  /**
   * @param {{ data?: Object[], channels?: Object, width?: number, height?: number, mode?: string, margin?: Object, layers?: Object[], curve?: string, stat?: string|Function }} opts
   *   Supported channel keys: `x`, `y`, `fill`, `color`, `pattern`, `symbol`, `size`, `label`.
   *   `frame` is reserved for future animation use (no-op).
   */
  update(opts = {}) {
    if (opts.data     !== undefined) this.#rawData  = opts.data
    if (opts.channels !== undefined) this.#channels = opts.channels
    if (opts.width    !== undefined) this.#width    = opts.width
    if (opts.height   !== undefined) this.#height   = opts.height
    if (opts.mode     !== undefined) this.#mode     = opts.mode
    if (opts.margin   !== undefined) this.#margin   = { ...DEFAULT_MARGIN, ...opts.margin }
    if (opts.layers   !== undefined) this.#layers   = opts.layers
    if (opts.curve    !== undefined) this.#curve    = opts.curve
    if (opts.stat     !== undefined) this.#stat     = opts.stat
  }
}
