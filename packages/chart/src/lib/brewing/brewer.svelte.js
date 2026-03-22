import { distinct, assignColors } from './colors.js'
import { assignPatterns } from './patterns.js'
import { buildXScale, buildYScale, buildSizeScale } from './scales.js'
import { buildBars } from './marks/bars.js'
import { buildLines } from './marks/lines.js'
import { buildAreas } from './marks/areas.js'
import { buildArcs } from './marks/arcs.js'
import { buildPoints } from './marks/points.js'

const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 }

export class ChartBrewer {
  #data = $state([])
  #channels = $state({})
  #width = $state(600)
  #height = $state(400)
  #mode = $state('light')
  #margin = $state(DEFAULT_MARGIN)
  #layers = $state([])
  #curve = $state(/** @type {'linear'|'smooth'|'step'|undefined} */(undefined))

  /** @type {Map<unknown, {fill:string,stroke:string}>} */
  colorMap = $derived(
    this.#channels.color
      ? assignColors(distinct(this.#data, this.#channels.color), this.#mode)
      : new Map()
  )

  /** @type {Map<unknown, string>} */
  patternMap = $derived(
    this.#channels.pattern
      ? assignPatterns(distinct(this.#data, this.#channels.pattern))
      : new Map()
  )

  get innerWidth()  { return this.#width  - this.#margin.left - this.#margin.right }
  get innerHeight() { return this.#height - this.#margin.top  - this.#margin.bottom }

  xScale = $derived(
    this.#channels.x
      ? buildXScale(this.#data, this.#channels.x, this.innerWidth)
      : null
  )

  yScale = $derived(
    this.#channels.y
      ? buildYScale(this.#data, this.#channels.y, this.innerHeight, this.#layers)
      : null
  )

  sizeScale = $derived(
    this.#channels.size
      ? buildSizeScale(this.#data, this.#channels.size)
      : null
  )

  bars = $derived(
    this.xScale && this.yScale
      ? buildBars(this.#data, this.#channels, this.xScale, this.yScale, this.colorMap)
      : []
  )

  lines = $derived(
    this.xScale && this.yScale
      ? buildLines(this.#data, this.#channels, this.xScale, this.yScale, this.colorMap, this.#curve)
      : []
  )

  areas = $derived(
    this.xScale && this.yScale
      ? buildAreas(this.#data, this.#channels, this.xScale, this.yScale, this.colorMap, this.#curve)
      : []
  )

  arcs = $derived(
    this.#channels.y
      ? buildArcs(this.#data, this.#channels, this.colorMap, this.#width, this.#height)
      : []
  )

  points = $derived(
    this.xScale && this.yScale
      ? buildPoints(this.#data, this.#channels, this.xScale, this.yScale, this.colorMap, this.sizeScale)
      : []
  )

  get margin()  { return this.#margin }
  get width()   { return this.#width }
  get height()  { return this.#height }
  get mode()    { return this.#mode }

  /**
   * @param {{ data?: Object[], channels?: Object, width?: number, height?: number, mode?: string, margin?: Object, layers?: Object[] }} opts
   */
  update(opts = {}) {
    if (opts.data     !== undefined) this.#data     = opts.data
    if (opts.channels !== undefined) this.#channels = opts.channels
    if (opts.width    !== undefined) this.#width    = opts.width
    if (opts.height   !== undefined) this.#height   = opts.height
    if (opts.mode     !== undefined) this.#mode     = opts.mode
    if (opts.margin   !== undefined) this.#margin   = { ...DEFAULT_MARGIN, ...opts.margin }
    if (opts.layers   !== undefined) this.#layers   = opts.layers
    if (opts.curve    !== undefined) this.#curve    = opts.curve
  }
}
