/**
 * Spec for Plot/index.js — re-exports Root, Axis, Bar, Legend, Grid, Line, Area, Point, Arc.
 * Importing it ensures the module barrel is tracked as covered by v8.
 */
import { describe, it, expect } from 'vitest'
import * as PlotExports from '../../src/Plot/index.js'

describe('Plot/index.js — barrel exports', () => {
	it('exports Root component', () => {
		expect(PlotExports.Root).toBeDefined()
	})

	it('exports Axis component', () => {
		expect(PlotExports.Axis).toBeDefined()
	})

	it('exports Bar component', () => {
		expect(PlotExports.Bar).toBeDefined()
	})

	it('exports Legend component', () => {
		expect(PlotExports.Legend).toBeDefined()
	})

	it('exports Grid component', () => {
		expect(PlotExports.Grid).toBeDefined()
	})

	it('exports Line component', () => {
		expect(PlotExports.Line).toBeDefined()
	})

	it('exports Area component', () => {
		expect(PlotExports.Area).toBeDefined()
	})

	it('exports Point component', () => {
		expect(PlotExports.Point).toBeDefined()
	})

	it('exports Arc component', () => {
		expect(PlotExports.Arc).toBeDefined()
	})
})
