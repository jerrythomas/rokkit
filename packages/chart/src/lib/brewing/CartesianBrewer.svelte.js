import { ChartBrewer } from './brewer.svelte.js'
import { applyAggregate } from './stats.js'

/**
 * Brewer for cartesian charts (Bar, Line, Area).
 * Groups by x (and fill/color if set) and applies the given stat.
 */
export class CartesianBrewer extends ChartBrewer {
  transform(data, channels, stat) {
    if (stat === 'identity' || !channels.x || !channels.y) return data
    // Group by all mapped aesthetic dimensions so they survive aggregation.
    // e.g. x=region, fill=region, pattern=quarter → by=['region','quarter']
    const by = [...new Set([channels.x, channels.fill, channels.color, channels.pattern].filter(Boolean))]
    return applyAggregate(data, { by, value: channels.y, stat })
  }
}
