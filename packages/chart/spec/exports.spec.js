import { describe, it, expect } from 'vitest'
import { Plot, GeomHighlight, GeomTrend, GeomBox, GeomViolin, GeomJitter } from '../src/index.js'

describe('chart exports', () => {
	it('exposes Highlight + Trend on the Plot namespace and as Geom*', () => {
		expect(Plot.Highlight).toBeTruthy()
		expect(Plot.Trend).toBeTruthy()
		expect(GeomHighlight).toBeTruthy()
		expect(GeomTrend).toBeTruthy()
	})

	it('exposes Box/Violin/Jitter on the Plot namespace', () => {
		expect(Plot.Box).toBeTruthy()
		expect(Plot.Violin).toBeTruthy()
		expect(Plot.Jitter).toBeTruthy()
	})

	it('exposes GeomBox/GeomViolin/GeomJitter aliases', () => {
		expect(GeomBox).toBeTruthy()
		expect(GeomViolin).toBeTruthy()
		expect(GeomJitter).toBeTruthy()
	})
})
