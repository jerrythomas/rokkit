import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { defaultPreset } from '../../src/lib/preset.js'
import { buildArcMarks } from '../../src/geoms/lib/marks/arc.js'
import { buildAreaMarks } from '../../src/geoms/lib/marks/area.js'
import { buildBarMarks } from '../../src/geoms/lib/marks/bar.js'
import { buildBoxMarks } from '../../src/geoms/lib/marks/box.js'
import { buildCandleMarks } from '../../src/geoms/lib/marks/candlestick.js'
import { buildHeatmapMarks } from '../../src/geoms/lib/marks/heatmap.js'
import { buildHexbinMarks } from '../../src/geoms/lib/marks/hexbin.js'
import { buildJitterMarks } from '../../src/geoms/lib/marks/jitter.js'
import { buildLineMarks } from '../../src/geoms/lib/marks/line.js'
import { buildPointMarks } from '../../src/geoms/lib/marks/point.js'
import { buildViolinMarks } from '../../src/geoms/lib/marks/violin.js'
import { buildWaterfallMarks } from '../../src/geoms/lib/marks/waterfall.js'

/**
 * Every mark builder opens with the same bail-out:
 *
 *     if (!data?.length || !xScale || !yScale) return []
 *
 * It is the contract that keeps a Plot renderable before data arrives, while a
 * scale is still being derived, or when a filter empties the set — the geom
 * components render `marks` directly, so returning anything but an empty array
 * here throws during layout. Twelve builders carried it and none was exercised,
 * so the whole family is table-driven rather than repeated twelve times.
 */

const plot = {
	xScale: scaleBand().domain(['a', 'b']).range([0, 100]),
	yScale: scaleLinear().domain([0, 10]).range([100, 0]),
	colors: new Map(),
	patterns: new Map(),
	continuousColorScale: null,
	chartPreset: defaultPreset
}

const channels = { x: 'x', y: 'y' }
const data = [{ x: 'a', y: 1 }]

const BUILDERS = [
	['arc', buildArcMarks],
	['area', buildAreaMarks],
	['bar', buildBarMarks],
	['box', buildBoxMarks],
	['candlestick', buildCandleMarks],
	['heatmap', buildHeatmapMarks],
	['hexbin', buildHexbinMarks],
	['jitter', buildJitterMarks],
	['line', buildLineMarks],
	['point', buildPointMarks],
	['violin', buildViolinMarks],
	['waterfall', buildWaterfallMarks]
]

describe('mark builders — empty input', () => {
	describe.each(BUILDERS)('%s', (type, build) => {
		it('returns [] for an empty data array', () => {
			expect(build({ data: [], plot, channels, type })).toEqual([])
		})

		it('returns [] when data is undefined', () => {
			expect(build({ data: undefined, plot, channels, type })).toEqual([])
		})

		it('returns [] when data is null', () => {
			expect(build({ data: null, plot, channels, type })).toEqual([])
		})
	})

	// arc is polar and does not consult the cartesian scales, so it is excluded
	// from the missing-scale cases rather than asserted to behave differently.
	describe.each(BUILDERS.filter(([type]) => type !== 'arc'))('%s', (type, build) => {
		it('returns [] when xScale is missing', () => {
			expect(build({ data, plot: { ...plot, xScale: null }, channels, type })).toEqual([])
		})

		it('returns [] when yScale is missing', () => {
			expect(build({ data, plot: { ...plot, yScale: null }, channels, type })).toEqual([])
		})
	})
})
