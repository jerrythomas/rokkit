import { ChartBrewer } from './chart'
import { ColorBrewer } from './color'
import { ShapeBrewer } from './shape'
import { ThemeBrewer } from './theme'
import { PatternBrewer } from './pattern'

export { toHexString, swatch } from './utils'
export { uniques, slidingWindow } from './rollup'
export { colors } from './color'

export function brewer() {
	return {
		pattern: () => new PatternBrewer(),
		color: () => new ColorBrewer(),
		theme: () => new ThemeBrewer(),
		shape: () => new ShapeBrewer(),
		chart: (data, x, y) => new ChartBrewer(data, x, y),
	}
}
