import { applyGeomStat } from './lib/plot/stat.js'
import { inferFieldType, inferOrientation, buildUnifiedXScale, buildUnifiedYScale, inferColorScaleType } from './lib/plot/scales.js'
import { resolvePreset } from './lib/plot/preset.js'
import { resolveFormat, resolveTooltip, resolveGeom } from './lib/plot/helpers.js'

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
  #xDomain       = $state(undefined)
  #yDomain       = $state(undefined)
  #width         = $state(600)
  #height        = $state(400)
  #margin        = $state({ top: 20, right: 20, bottom: 40, left: 50 })

  #geoms = $state([])

  axisOrigin = $state([undefined, undefined])

  #innerWidth  = $derived(this.#width  - this.#margin.left - this.#margin.right)
  #innerHeight = $derived(this.#height - this.#margin.top  - this.#margin.bottom)

  orientation = $derived.by(() => {
    const xField = this.#channels.x
    const yField = this.#channels.y
    if (!xField || !yField) return 'none'
    const xType = inferFieldType(this.#data, xField)
    const yType = inferFieldType(this.#data, yField)
    return inferOrientation(xType, yType)
  })

  colorScaleType = $derived.by(() => {
    const field = this.#channels.color
    if (!field) return 'categorical'
    return inferColorScaleType(this.#data, field, {
      colorScale: this.#colorSpec,
      colorMidpoint: this.#colorMidpoint
    })
  })

  xScale = $derived.by(() => {
    const field = this.#channels.x
    if (!field) return null
    const datasets = this.#geoms.length > 0
      ? this.#geoms.map((g) => this.geomData(g.id))
      : [this.#rawData]
    const includeZero = this.orientation === 'horizontal'
    return buildUnifiedXScale(datasets, field, this.#innerWidth, {
      domain: this.#xDomain,
      includeZero
    })
  })

  yScale = $derived.by(() => {
    const field = this.#channels.y
    if (!field) return null
    const datasets = this.#geoms.length > 0
      ? this.#geoms.map((g) => this.geomData(g.id))
      : [this.#rawData]
    const includeZero = this.orientation === 'vertical'
    return buildUnifiedYScale(datasets, field, this.#innerHeight, {
      domain: this.#yDomain,
      includeZero
    })
  })

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
    this.#xDomain       = config.xDomain
    this.#yDomain       = config.yDomain
    this.#width         = config.width         ?? 600
    this.#height        = config.height        ?? 400
  }

  update(config) {
    if (config.data          !== undefined) { this.#rawData = config.data; this.#data = config.data }
    if (config.channels      !== undefined) this.#channels      = config.channels
    if (config.labels        !== undefined) this.#labels        = config.labels
    if (config.helpers       !== undefined) this.#helpers       = config.helpers
    if (config.preset        !== undefined) this.#presetName    = config.preset
    if (config.colorMidpoint !== undefined) this.#colorMidpoint = config.colorMidpoint
    if (config.colorScale    !== undefined) this.#colorSpec     = config.colorScale
    this.#xDomain = config.xDomain
    this.#yDomain = config.yDomain
    if (config.width         !== undefined) this.#width         = config.width
    if (config.height        !== undefined) this.#height        = config.height
  }

  registerGeom(config) {
    const id = `geom-${nextId++}`
    this.#geoms = [...this.#geoms, { id, ...config }]
    return id
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

  get margin()      { return this.#margin }
  get innerWidth()  { return this.#innerWidth }
  get innerHeight() { return this.#innerHeight }
}
