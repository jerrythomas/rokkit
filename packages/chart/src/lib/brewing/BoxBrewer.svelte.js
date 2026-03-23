import { quantile, ascending } from 'd3-array'
import { dataset } from '@rokkit/data'
import { ChartBrewer } from './brewer.svelte.js'
import { buildBoxes } from './marks/boxes.js'
import { buildXScale, buildYScale } from './scales.js'

function sortedQuantile(values, p) {
  return quantile([...values].sort(ascending), p)
}

/**
 * Brewer for box plots. Always computes quartile statistics regardless of the stat prop.
 * Groups by x + fill (primary) or x + color (fallback).
 * fill = box interior color, color = whisker/outline stroke.
 */
export class BoxBrewer extends ChartBrewer {
  transform(data, channels) {
    if (!channels.x || !channels.y) return data
    const by = [channels.x, channels.fill ?? channels.color].filter(Boolean)
    return dataset(data)
      .groupBy(...by)
      .summarize((row) => row[channels.y], {
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
   * Override xScale to use processedData (post-transform rows have the x field).
   */
  xScale = $derived(
    this.channels.x && this.processedData.length > 0
      ? buildXScale(this.processedData, this.channels.x, this.innerWidth)
      : null
  )

  /**
   * Override yScale to use iqr_max as the upper bound of the quartile data.
   */
  yScale = $derived(
    this.channels.y && this.processedData.length > 0
      ? buildYScale(this.processedData, 'iqr_max', this.innerHeight)
      : null
  )

  boxes = $derived(
    this.xScale && this.yScale
      ? buildBoxes(this.processedData, this.channels, this.xScale, this.yScale, this.colorMap)
      : []
  )
}
