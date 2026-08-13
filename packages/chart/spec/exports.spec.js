import { describe, it, expect } from 'vitest'
import { Plot, GeomHighlight, GeomTrend } from '../src/index.js'

describe('chart exports', () => {
	it('exposes Highlight + Trend on the Plot namespace and as Geom*', () => {
		expect(Plot.Highlight).toBeTruthy()
		expect(Plot.Trend).toBeTruthy()
		expect(GeomHighlight).toBeTruthy()
		expect(GeomTrend).toBeTruthy()
	})
})
