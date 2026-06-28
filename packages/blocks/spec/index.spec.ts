/**
 * Coverage for src/index.ts
 *
 * The barrel re-exports plugin objects (each { language, component }) and the
 * config utilities. Importing it is sufficient to cover every statement.
 * We also assert the shape of each plugin to guard against silent regressions.
 */
import { describe, it, expect } from 'vitest'
import {
	PlotPlugin,
	TablePlugin,
	SparklinePlugin,
	MermaidPlugin,
	FormPlugin,
	ListPlugin,
	StepperPlugin,
	pluginDisplay,
	configurePluginDisplay
} from '../src/index.js'

describe('blocks barrel — plugin objects', () => {
	it('PlotPlugin has language "plot" and a component', () => {
		expect(PlotPlugin.language).toBe('plot')
		expect(PlotPlugin.component).toBeDefined()
	})

	it('TablePlugin has language "table" and a component', () => {
		expect(TablePlugin.language).toBe('table')
		expect(TablePlugin.component).toBeDefined()
	})

	it('SparklinePlugin has language "sparkline" and a component', () => {
		expect(SparklinePlugin.language).toBe('sparkline')
		expect(SparklinePlugin.component).toBeDefined()
	})

	it('MermaidPlugin has language "mermaid" and a component', () => {
		expect(MermaidPlugin.language).toBe('mermaid')
		expect(MermaidPlugin.component).toBeDefined()
	})

	it('FormPlugin has language "form" and a component', () => {
		expect(FormPlugin.language).toBe('form')
		expect(FormPlugin.component).toBeDefined()
	})

	it('ListPlugin has language "list" and a component', () => {
		expect(ListPlugin.language).toBe('list')
		expect(ListPlugin.component).toBeDefined()
	})

	it('StepperPlugin has language "stepper" and a component', () => {
		expect(StepperPlugin.language).toBe('stepper')
		expect(StepperPlugin.component).toBeDefined()
	})
})

describe('blocks barrel — config re-exports', () => {
	it('re-exports pluginDisplay singleton', () => {
		expect(pluginDisplay).toBeDefined()
		expect(typeof pluginDisplay.codeVisible).toBe('boolean')
	})

	it('re-exports configurePluginDisplay function', () => {
		expect(typeof configurePluginDisplay).toBe('function')
	})
})
