import { describe, it, expect } from 'vitest'
import * as typography from '../src/typography.js'
const { fontVars, radiusVars, rootExtraVars } = typography

describe('fontVars', () => {
	it('emits each configured role, canonical names first, then the legacy aliases', () => {
		expect(fontVars({ display: 'Fraunces', ui: 'Inter', mono: 'JetBrains' })).toEqual([
			'--font-display:Fraunces',
			'--font-ui:Inter',
			'--font-mono:JetBrains',
			'--font-heading:var(--font-display)',
			'--font-sans:var(--font-ui)'
		])
	})
	it('accepts the legacy heading / sans keys, the canonical key winning', () => {
		expect(fontVars({ heading: 'Cal Sans', sans: 'Inter' })).toContain('--font-display:Cal Sans')
		expect(fontVars({ display: 'A', heading: 'B' })).toContain('--font-display:A')
	})
	it('skips an unset or empty role, and nothing without typography', () => {
		expect(fontVars({ mono: 'M' })).toEqual(['--font-mono:M'])
		expect(fontVars({ display: '' })).toEqual([])
		expect(fontVars(undefined)).toEqual([])
	})
})

describe('the type scale', () => {
	it('is gone: no typeScaleVars, and rootExtraVars emits no --text / --leading / --weight', () => {
		expect('typeScaleVars' in typography).toBe(false)
		const vars = rootExtraVars({ typography: { ratio: 2, base: 1, levels: { h1: '3rem' } } })
		expect(vars.some((v) => /^--(text|leading|weight)-/.test(v))).toBe(false)
	})
})

describe('radiusVars', () => {
	it('expands a named preset, or takes an object as given', () => {
		expect(radiusVars({ radius: 'sharp' })).toEqual([
			'--radius-sm:0',
			'--radius-md:0',
			'--radius-lg:0',
			'--radius-xl:0',
			'--radius-full:9999px'
		])
		expect(radiusVars({ radius: { md: '4px' } })).toEqual(['--radius-md:4px'])
	})
	it('is empty without a radius or for an unknown preset', () => {
		expect(radiusVars(undefined)).toEqual([])
		expect(radiusVars({ radius: 'blobby' })).toEqual([])
	})
})

describe('rootExtraVars', () => {
	it('is fonts, then radius — and nothing between', () => {
		const vars = rootExtraVars({ typography: { mono: 'M' }, shape: { radius: { md: '4px' } } })
		expect(vars).toEqual(['--font-mono:M', '--radius-md:4px'])
	})
})
