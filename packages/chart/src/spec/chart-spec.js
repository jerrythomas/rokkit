export class ChartSpec {
  constructor(data) {
    this.data = data ?? []
    this.channels = {}
    this.layers = []
    this.options = {}
  }

  x(f)      { this.channels.x = f; return this }
  y(f)      { this.channels.y = f; return this }
  color(f)  { this.channels.color = f; return this }
  pattern(f){ this.channels.pattern = f; return this }
  aes(ch)   { Object.assign(this.channels, ch); return this }

  bar(opts = {})   { this.layers.push({ type: 'bar',   ...opts }); return this }
  line(opts = {})  { this.layers.push({ type: 'line',  ...opts }); return this }
  area(opts = {})  { this.layers.push({ type: 'area',  ...opts }); return this }
  arc(opts = {})   { this.layers.push({ type: 'arc',   ...opts }); return this }
  point(opts = {}) { this.layers.push({ type: 'point', ...opts }); return this }

  grid(opts = {})       { this.options.grid = opts; return this }
  legend(opts = {})     { this.options.legend = opts; return this }
  axis(type, opts = {}) { this.options[`axis_${type}`] = opts; return this }
  size(w, h)            { this.options.width = w; this.options.height = h; return this }
}

export function chart(data, channels = {}) {
  return new ChartSpec(data).aes(channels)
}
