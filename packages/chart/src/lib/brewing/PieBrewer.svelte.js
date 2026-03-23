import { ChartBrewer } from './brewer.svelte.js'
import { applyAggregate } from './stats.js'

/**
 * Brewer for pie charts. Always aggregates by the label field.
 * 'identity' is not meaningful for pie charts — falls back to 'sum'.
 */
export class PieBrewer extends ChartBrewer {
  transform(data, channels, stat) {
    if (!channels.label || !channels.y) return data
    const effectiveStat = stat === 'identity' ? 'sum' : (stat ?? 'sum')
    return applyAggregate(data, { by: [channels.label], value: channels.y, stat: effectiveStat })
  }
}
