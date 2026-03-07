import { describe, it, expect } from 'vitest'
import { presetBackgrounds } from '../src/backgrounds'

describe('presetBackgrounds', () => {
	it('should return a valid preset', () => {
		const preset = presetBackgrounds()
		expect(preset.name).toBe('rokkit-backgrounds')
		expect(preset.rules).toBeDefined()
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
})
