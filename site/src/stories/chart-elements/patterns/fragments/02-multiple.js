// @ts-nocheck
// Create multiple patterns for multi-series charts
import { swatch } from '@rokkit/chart/lib'

const chartPatterns = [
	{
		id: 'series-1-stripes',
		component: swatch.patterns.stripe,
		fill: swatch.palette.blue[300],
		stroke: swatch.palette.blue[500]
	},
	{
		id: 'series-2-dots',
		component: swatch.patterns.dot,
		fill: swatch.palette.green[300],
		stroke: swatch.palette.green[500]
	},
	{
		id: 'series-3-cross',
		component: swatch.patterns.cross,
		fill: swatch.palette.orange[300],
		stroke: swatch.palette.orange[500]
	}
]
