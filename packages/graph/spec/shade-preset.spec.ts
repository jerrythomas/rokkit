/* #164 — a share in 0..1 becomes a step on a sequential ramp, with a label measured against
 * the fill it sits on. The contrast is computed here from the WCAG formula, independently of
 * the code under test, on every step of the ramp in both modes.
 */
import { describe, it, expect } from 'vitest'
import { categoricalPalette } from '@rokkit/core'
import { createGraphPreset, defaultGraphPreset, resolveShade } from '../src/preset.js'

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
	const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const contrast = (a: string, b: string) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}
const gray = categoricalPalette.gray

describe('the shade ramp', () => {
	it('defaults to gray 50 → 900, and can be set like any preset key', () => {
		expect(defaultGraphPreset.shade).toEqual({ family: 'gray', from: '50', to: '900' })
		expect(createGraphPreset({ shade: { family: 'blue', from: '100', to: '800' } }).shade.family).toBe('blue')
	})

	it('runs from the light end at 0 to the dark end at 1, in light mode', () => {
		expect(resolveShade(0, 'light')['--group-fill']).toBe(gray['50'])
		expect(resolveShade(1, 'light')['--group-fill']).toBe(gray['900'])
	})

	it('runs the other way in dark mode, so more is always more ink', () => {
		expect(resolveShade(0, 'dark')['--group-fill']).toBe(gray['900'])
		expect(resolveShade(1, 'dark')['--group-fill']).toBe(gray['50'])
	})

	it('moves monotonically through the steps as the share grows', () => {
		const fills = [0, 0.25, 0.5, 0.75, 1].map((t) => luminance(resolveShade(t, 'light')['--group-fill']))
		for (let i = 1; i < fills.length; i++) expect(fills[i]).toBeLessThanOrEqual(fills[i - 1])
	})

	it.each(['light', 'dark'] as const)('puts a readable label on every step of the ramp (%s)', (mode) => {
		for (let step = 0; step <= 20; step++) {
			const styles = resolveShade(step / 20, mode)
			expect(contrast(styles['--group-label'], styles['--group-fill']), `share ${step / 20}`).toBeGreaterThanOrEqual(4.5)
		}
	})

	it('reads a ramp from the family the preset names', () => {
		const blue = createGraphPreset({ shade: { family: 'blue', from: '100', to: '800' } })
		expect(resolveShade(1, 'light', blue)['--group-fill']).toBe(categoricalPalette.blue['800'])
	})
})
