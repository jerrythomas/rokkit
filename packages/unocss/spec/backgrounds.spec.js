import { describe, it, expect } from 'vitest'
import { presetBackgrounds } from '../src/backgrounds'

const BACKGROUND_NAMES = [
	'bg-graph-paper',
	'bg-grid-paper',
	'bg-ruled-paper',
	'bg-pattern-diagonal',
	'bg-pattern-diagonal-reverse',
	'bg-pattern-vertical',
	'bg-pattern-horizontal',
	'bg-pattern-crosshatch',
	'bg-pattern-dots',
	'bg-pattern-checker'
]

describe('presetBackgrounds', () => {
	it('should return a valid preset', () => {
		const preset = presetBackgrounds()
		expect(preset.name).toBe('rokkit-backgrounds')
		expect(preset.rules).toBeDefined()
	})

	it('should include all background rules', () => {
		const preset = presetBackgrounds()
		const names = preset.rules.map((r) => r[0])
		for (const name of BACKGROUND_NAMES) {
			expect(names).toContain(name)
		}
	})

	it('should include bg-graph-paper rule with var() fallbacks', () => {
		const preset = presetBackgrounds()
		const rule = preset.rules.find((r) => r[0] === 'bg-graph-paper')
		expect(rule).toBeDefined()
		expect(rule[1]['background-image']).toContain('var(--graph-paper-color, currentColor)')
		expect(rule[1]['background-image']).toContain('var(--minor-grid, 0.5px)')
		expect(rule[1]['background-image']).toContain('var(--major-grid, 0.5px)')
		expect(rule[1]['background-size']).toContain('var(--unit, 0.5rem)')
		expect(rule[1]['background-position']).toContain('var(--minor-grid, 0.5px)')
	})

	it('should include bg-grid-paper rule with var() fallbacks', () => {
		const preset = presetBackgrounds()
		const rule = preset.rules.find((r) => r[0] === 'bg-grid-paper')
		expect(rule).toBeDefined()
		expect(rule[1]['background-image']).toContain('var(--grid-paper-color, currentColor)')
		expect(rule[1]['background-image']).toContain('var(--grid-line, 0.5px)')
		expect(rule[1]['background-size']).toContain('var(--unit, 0.5rem)')
		expect(rule[1]['background-position']).toContain('var(--grid-line, 0.5px)')
	})

	it('should include bg-ruled-paper rule with var() fallbacks', () => {
		const preset = presetBackgrounds()
		const rule = preset.rules.find((r) => r[0] === 'bg-ruled-paper')
		expect(rule).toBeDefined()
		expect(rule[1]['background-image']).toContain('var(--ruled-paper-color, currentColor)')
		expect(rule[1]['background-image']).toContain('var(--rule-size, 0.5px)')
		expect(rule[1]['background-size']).toContain('var(--unit, 1.5rem)')
		expect(rule[1]['background-position']).toContain('var(--rule-size, 0.5px)')
	})

	it('all pattern rules should use --fg-pattern and --bg-pattern variables', () => {
		const preset = presetBackgrounds()
		const patternRules = preset.rules.filter((r) => r[0].startsWith('bg-pattern-'))
		expect(patternRules.length).toBe(7)
		for (const [, css] of patternRules) {
			const values = Object.values(css).join(' ')
			expect(values).toContain('var(--pattern-color, currentColor)')
			expect(values).toContain('var(--pattern-fill, transparent)')
		}
	})

	it('all pattern rules should use --pattern-size and --pattern-line variables', () => {
		const preset = presetBackgrounds()
		const patternRules = preset.rules.filter((r) => r[0].startsWith('bg-pattern-'))
		for (const [, css] of patternRules) {
			const values = Object.values(css).join(' ')
			expect(values).toMatch(/var\(--pattern-(size|line)/)
		}
	})
})
