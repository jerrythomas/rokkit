import { describe, it, expect } from 'vitest'
import { presetPatterns } from '../src/patterns'

const PATTERN_NAMES = [
	'bg-pattern-diagonal',
	'bg-pattern-diagonal-reverse',
	'bg-pattern-vertical',
	'bg-pattern-horizontal',
	'bg-pattern-crosshatch',
	'bg-pattern-dots',
	'bg-pattern-checker'
]

describe('presetPatterns', () => {
	it('should return a valid preset', () => {
		const preset = presetPatterns()
		expect(preset.name).toBe('rokkit-patterns')
		expect(preset.rules).toBeDefined()
	})

	it('should include all pattern rules', () => {
		const preset = presetPatterns()
		const names = preset.rules.map((r) => r[0])
		for (const name of PATTERN_NAMES) {
			expect(names).toContain(name)
		}
	})

	it('all rules should use --fg-pattern and --bg-pattern variables', () => {
		const preset = presetPatterns()
		for (const [, css] of preset.rules) {
			const values = Object.values(css).join(' ')
			expect(values).toContain('var(--fg-pattern, currentColor)')
			expect(values).toContain('var(--bg-pattern, transparent)')
		}
	})

	it('all rules should use --pattern-size and --pattern-line variables', () => {
		const preset = presetPatterns()
		for (const [, css] of preset.rules) {
			const values = Object.values(css).join(' ')
			expect(values).toMatch(/var\(--pattern-(size|line)/)
		}
	})
})
