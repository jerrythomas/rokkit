import { describe, it, expect } from 'vitest'
import { fontVars, typeScaleVars, radiusVars, rootExtraVars } from '../src/typography.js'

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

describe('typeScaleVars', () => {
	it('derives sizes from base × ratio^step, with leading and weight per level', () => {
		const vars = typeScaleVars(undefined)
		expect(vars).toContain('--text-body:1rem')
		expect(vars).toContain('--text-h1:2.441rem')
		expect(vars).toContain('--text-small:0.8rem')
		expect(vars).toContain('--leading-h1:1.1')
		expect(vars).toContain('--weight-body:400')
		expect(vars).toHaveLength(18)
	})
	it('honours ratio, base and per-level overrides; ignores a non-positive ratio', () => {
		expect(typeScaleVars({ ratio: 2, base: 1 })).toContain('--text-h4:2rem')
		expect(typeScaleVars({ base: 2 })).toContain('--text-body:2rem')
		expect(typeScaleVars({ levels: { h1: '3rem' } })).toContain('--text-h1:3rem')
		expect(typeScaleVars({ ratio: 0 })).toContain('--text-h4:1.25rem')
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
	it('is fonts, then the type scale, then radius', () => {
		const vars = rootExtraVars({ typography: { mono: 'M' }, shape: { radius: { md: '4px' } } })
		expect(vars[0]).toBe('--font-mono:M')
		expect(vars.at(-1)).toBe('--radius-md:4px')
		expect(vars).toHaveLength(1 + 18 + 1)
	})
})
