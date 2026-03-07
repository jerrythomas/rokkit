import { describe, it, expect } from 'vitest'
import { presetBackgrounds } from '../src/backgrounds'

const PATTERN_NAMES = [
	'bg-pattern-diagonal',
	'bg-pattern-diagonal-reverse',
	'bg-pattern-vertical',
	'bg-pattern-horizontal',
	'bg-pattern-crosshatch',
	'bg-pattern-dots',
	'bg-pattern-checker'
]

describe('pattern rules in presetBackgrounds', () => {
	it('should include all pattern rules', () => {
		const preset = presetBackgrounds()
		const names = preset.rules.map((r) => r[0])
		for (const name of PATTERN_NAMES) {
			expect(names).toContain(name)
		}
	})

	it('all rules should use --fg-pattern and --bg-pattern variables', () => {
		const preset = presetBackgrounds()
		const patternRules = preset.rules.filter((r) => PATTERN_NAMES.includes(r[0]))
		for (const [, css] of patternRules) {
			const values = Object.values(css).join(' ')
			expect(values).toContain('var(--fg-pattern, currentColor)')
			expect(values).toContain('var(--bg-pattern, transparent)')
		}
	})

	it('all rules should use --pattern-size and --pattern-line variables', () => {
		const preset = presetBackgrounds()
		const patternRules = preset.rules.filter((r) => PATTERN_NAMES.includes(r[0]))
		for (const [, css] of patternRules) {
			const values = Object.values(css).join(' ')
			expect(values).toMatch(/var\(--pattern-(size|line)/)
		}
	})
})
