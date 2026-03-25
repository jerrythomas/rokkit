import { untrack } from 'svelte'
import { applyGeomStat } from './lib/plot/stat.js'
import { inferFieldType, inferOrientation, buildUnifiedXScale, buildUnifiedYScale, inferColorScaleType } from './lib/plot/scales.js'
import { resolvePreset } from './lib/plot/preset.js'
import { resolveFormat, resolveTooltip, resolveGeom } from './lib/plot/helpers.js'
import { distinct, assignColors } from './lib/brewing/colors.js'
import { assignPatterns } from './lib/brewing/patterns.js'
import { assignSymbols } from './lib/brewing/marks/points.js'

let nextId = 0

export class PlotState {
  #data          = $state([])
  #rawData       = []
  #channels      = $state({})
  #labels        = $state({})
  #helpers       = $state({})
  #presetName    = $state(undefined)
  #colorMidpoint = $state(undefined)
  #colorSpec     = $state(undefined)
  #colorDomain   = $state(undefined)
  #xDomain       = $state(undefined)
  #yDomain       = $state(undefined)
  #width         = $state(600)
  #height        = $state(400)
  #margin        = $state({ top: 20, right: 20, bottom: 40, left: 50 })
  #marginOverride = $state(undefined)

  #geoms   = $state([])
  #mode    = $state('light')
  #hovered = $state(null)

  axisOrigin = $state([undefined, undefined])

  #effectiveMargin = $derived(this.#marginOverride ?? this.#margin)
  #innerWidth  = $derived(this.#width  - this.#effectiveMargin.left - this.#effectiveMargin.right)
  #innerHeight = $derived(this.#height - this.#effectiveMargin.top  - this.#effectiveMargin.bottom)

  // Effective channels: prefer top-level channels; fall back to first geom's channels
  // for the declarative API where no spec is provided.
  #effectiveChannels = $derived.by(() => {
    const tc = this.#channels
    if (tc.x && tc.y) return tc
    const firstGeom = this.#geoms[0]
    if (!firstGeom) return tc
    return {
      x:       tc.x       ?? firstGeom.channels?.x,
      y:       tc.y       ?? firstGeom.channels?.y,
      color:   tc.color   ?? firstGeom.channels?.color,
      pattern: tc.pattern ?? firstGeom.channels?.pattern,
      symbol:  tc.symbol  ?? firstGeom.channels?.symbol,
    }
  })

  orientation = $derived.by(() => {
    const xField = this.#effectiveChannels.x
    const yField = this.#effectiveChannels.y
    if (!xField || !yField) return 'none'
    const rawXType = inferFieldType(this.#data, xField)
    const yType = inferFieldType(this.#data, yField)
    // Bar geoms treat numeric X as categorical (e.g. year on X → vertical bars).
    const hasBarGeom = this.#geoms.some((g) => g.type === 'bar')
    const xType = (hasBarGeom && rawXType === 'continuous' && yType === 'continuous') ? 'band' : rawXType
    return inferOrientation(xType, yType)
  })

  colorScaleType = $derived.by(() => {
    const field = this.#effectiveChannels.color
    if (!field) return 'categorical'
    return inferColorScaleType(this.#data, field, {
      colorScale: this.#colorSpec,
      colorMidpoint: this.#colorMidpoint
    })
  })

  xScale = $derived.by(() => {
    const field = this.#effectiveChannels.x
    if (!field) return null
    const datasets = this.#geoms.length > 0
      ? this.#geoms.map((g) => this.geomData(g.id))
      : [this.#rawData]
    const includeZero = this.orientation === 'horizontal'
    // For vertical bar charts, force scaleBand even when X values are numeric (e.g. year).
    // Horizontal bar charts keep X as a continuous value axis.
    const hasBarGeom = this.#geoms.some((g) => g.type === 'bar')
    const bandX = hasBarGeom && this.orientation !== 'horizontal'
    return buildUnifiedXScale(datasets, field, this.#innerWidth, {
      domain: this.#xDomain,
      includeZero,
      band: bandX
    })
  })

  yScale = $derived.by(() => {
    const field = this.#effectiveChannels.y
    if (!field) return null
    const datasets = this.#geoms.length > 0
      ? this.#geoms.map((g) => this.geomData(g.id))
      : [this.#rawData]
    const includeZero = this.orientation === 'vertical'

    // For stacked bars, the y domain must cover the per-x column *total*, not the
    // per-row max — otherwise bars overflow the plot area.
    // For box/violin geoms, the processed data has iqr_min/iqr_max instead of raw y values.
    let yDomain = this.#yDomain
    if (!yDomain) {
      const boxGeom = this.#geoms.find((g) => g.type === 'box' || g.type === 'violin')
      if (boxGeom) {
        const boxData = this.geomData(boxGeom.id)
        const mins = boxData.map((d) => d.iqr_min).filter((v) => v !== null && v !== undefined && !isNaN(v))
        const maxs = boxData.map((d) => d.iqr_max).filter((v) => v !== null && v !== undefined && !isNaN(v))
        if (mins.length > 0 && maxs.length > 0) {
          yDomain = [Math.min(...mins), Math.max(...maxs)]
        }
      }
    }
    if (!yDomain) {
      const stackGeom = this.#geoms.find((g) => g.options?.stack)
      if (stackGeom) {
        const xField = this.#effectiveChannels.x
        const stackData = this.geomData(stackGeom.id)
        if (xField && stackData.length > 0) {
          // Mirror buildStackedBars/subBandFields: stack dimension is the first
          // non-x field among [color, pattern]. Summing all raw rows (stat=identity)
          // would overcount when multiple rows share the same (x, stack) key.
          const colorField = this.#effectiveChannels.color
          const patternField = this.#effectiveChannels.pattern
          const stackField = [colorField, patternField].find((f) => f && f !== xField) ?? colorField
          const lookup = new Map()
          for (const d of stackData) {
            const xVal = d[xField]
            const cKey = stackField ? String(d[stackField]) : '_'
            if (!lookup.has(xVal)) lookup.set(xVal, new Map())
            lookup.get(xVal).set(cKey, Number(d[field]) || 0)
          }
          const totals = new Map()
          for (const [xVal, colorMap] of lookup) {
            totals.set(xVal, [...colorMap.values()].reduce((s, v) => s + v, 0))
          }
          const maxStack = Math.max(0, ...totals.values())
          yDomain = [0, maxStack]
        }
      }
    }

    return buildUnifiedYScale(datasets, field, this.#innerHeight, {
      domain: yDomain,
      includeZero
    })
  })

  // Colors: Map<colorKey, { fill, stroke }> for all distinct color field values.
  // If a colorDomain is provided (e.g. from FacetPlot for cross-panel consistency),
  // use it instead of deriving distinct values from the local panel data.
  colors = $derived.by(() => {
    const field = this.#effectiveChannels.color
    const values = this.#colorDomain ?? distinct(this.#data, field)
    return assignColors(values, this.#mode)
  })

  // Patterns: Map<patternKey, patternName> — only populated when a pattern channel is set
  // and the pattern field is categorical (continuous fields can't be discretely patterned).
  patterns = $derived.by(() => {
    const pf = this.#effectiveChannels.pattern
    if (!pf) return new Map()
    if (inferFieldType(this.#data, pf) === 'continuous') return new Map()
    return assignPatterns(distinct(this.#data, pf))
  })

  // Symbols: Map<symbolKey, shapeName> — only populated when a symbol channel is set.
  symbols = $derived.by(() => {
    const sf = this.#effectiveChannels.symbol
    if (!sf) return new Map()
    return assignSymbols(distinct(this.#data, sf))
  })

  // Expose effective channel fields for consumers (e.g. Legend)
  colorField = $derived(this.#effectiveChannels.color)
  patternField = $derived(this.#effectiveChannels.pattern)
  symbolField = $derived(this.#effectiveChannels.symbol)

  // Set of geom types currently registered (used by Legend to pick swatch style)
  geomTypes = $derived(new Set(this.#geoms.map((g) => g.type)))

  xAxisY = $derived.by(() => {
    if (!this.yScale || typeof this.yScale !== 'function') return this.#innerHeight
    const crossVal = this.axisOrigin[1]
    if (crossVal !== undefined) return this.yScale(crossVal)
    const domain = this.yScale.domain?.()
    return domain ? this.yScale(domain[0]) : this.#innerHeight
  })

  yAxisX = $derived.by(() => {
    if (!this.xScale || typeof this.xScale !== 'function') return 0
    const crossVal = this.axisOrigin[0]
    if (crossVal !== undefined) return this.xScale(crossVal)
    const domain = this.xScale.domain?.()
    return domain ? this.xScale(domain[0]) : 0
  })

  constructor(config = {}) {
    this.#rawData       = config.data          ?? []
    this.#data          = config.data          ?? []
    this.#channels      = config.channels      ?? {}
    this.#labels        = config.labels        ?? {}
    this.#helpers       = config.helpers       ?? {}
    this.#presetName    = config.preset
    this.#colorMidpoint = config.colorMidpoint
    this.#colorSpec     = config.colorScale
    this.#colorDomain   = config.colorDomain
    this.#xDomain       = config.xDomain
    this.#yDomain       = config.yDomain
    this.#width         = config.width         ?? 600
    this.#height        = config.height        ?? 400
    this.#mode          = config.mode          ?? 'light'
    this.#marginOverride = config.margin       ?? undefined
  }

  update(config) {
    if (config.data          !== undefined) { this.#rawData = config.data; this.#data = config.data }
    if (config.channels      !== undefined) this.#channels      = config.channels
    if (config.labels        !== undefined) this.#labels        = config.labels
    if (config.helpers       !== undefined) this.#helpers       = config.helpers
    if (config.preset        !== undefined) this.#presetName    = config.preset
    if (config.colorMidpoint !== undefined) this.#colorMidpoint = config.colorMidpoint
    if (config.colorScale    !== undefined) this.#colorSpec     = config.colorScale
    this.#colorDomain = config.colorDomain
    this.#xDomain = config.xDomain
    this.#yDomain = config.yDomain
    if (config.width         !== undefined) this.#width         = config.width
    if (config.height        !== undefined) this.#height        = config.height
    if (config.mode          !== undefined) this.#mode          = config.mode
    this.#marginOverride = config.margin ?? undefined
  }

  registerGeom(config) {
    const id = `geom-${nextId++}`
    this.#geoms = [...this.#geoms, { id, ...config }]
    return id
  }

  updateGeom(id, config) {
    // untrack the read of #geoms to avoid effect_update_depth_exceeded when
    // called from a geom's $effect (which would otherwise track #geoms as a dependency)
    this.#geoms = untrack(() => this.#geoms).map((g) => g.id === id ? { ...g, ...config } : g)
  }

  unregisterGeom(id) {
    this.#geoms = this.#geoms.filter((g) => g.id !== id)
  }

  geomData(id) {
    const geom = this.#geoms.find((g) => g.id === id)
    if (!geom) return []
    const stat = geom.stat ?? 'identity'
    if (stat === 'identity') return this.#rawData
    const mergedChannels = { ...this.#channels, ...geom.channels }
    return applyGeomStat(this.#rawData, { stat, channels: mergedChannels }, this.#helpers)
  }

  label(field) {
    return this.#labels?.[field] ?? field
  }

  format(field)       { return resolveFormat(field, this.#helpers) }
  tooltip()           { return resolveTooltip(this.#helpers) }
  geomComponent(type) { return resolveGeom(type, this.#helpers) }
  preset()            { return resolvePreset(this.#presetName, this.#helpers) }

  get margin()      { return this.#effectiveMargin }
  get innerWidth()  { return this.#innerWidth }
  get innerHeight() { return this.#innerHeight }
  get mode()        { return this.#mode }
  get hovered()     { return this.#hovered }

  setHovered(data)  { this.#hovered = data }
  clearHovered()    { this.#hovered = null }
}
