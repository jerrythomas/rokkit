import { describe, it, expect } from 'vitest'
import { relativeLuminance, pickOnColor, ColorSpace } from '@rokkit/core'
import { PALETTE_FAMILIES, zenSumi } from '../src/palette-families.js'
import { loadConfig } from '../src/config.js'
import { inkContrast, inkRampProblems, tokenValue } from '../src/contrast.js'
import { presetRokkit } from '../src/preset.js'

/**
 * Every exported palette family is a ready skin: its text ramp reads at AA, its status colours
 * are distinct from each other and from primary, its primary fill takes a readable on-colour,
 * and its status text reads at AA on paper and paper-soft, in both modes.
 */
const AA = 4.5
const ROLES = ['surface', 'ink', 'primary', 'secondary', 'tertiary', 'accent', 'success', 'warning', 'danger', 'error', 'info']
const DISTINCT = ['primary', 'success', 'warning', 'danger', 'info']
const STATUS = ['success', 'warning', 'danger', 'error', 'info']
const MODES = ['light', 'dark']

const oklch = ColorSpace.create('oklch')
const Y = (value) => relativeLuminance(value, 'oklch')
const ratio = (a, b) => (Math.max(Y(a), Y(b)) + 0.05) / (Math.min(Y(a), Y(b)) + 0.05)
/** OKLab distance between two bare `L C H` values. */
function deltaE(a, b) {
	const lab = (v) => {
		const [L, C, H] = v.split(/\s+/).map(Number)
		return [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)]
	}
	const [p, q] = [lab(a), lab(b)]
	return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
}

describe.each(Object.entries(PALETTE_FAMILIES))('palette family %s', (name, family) => {
	const config = loadConfig({ palettes: family.palettes, colorSpace: 'oklch', skin: family.skin })
	const value = (token, mode) => tokenValue(config, family.skin, token, mode)

	it('names itself, describes its mood, and maps every role to its own palettes', () => {
		expect(family.name).toBe(name)
		expect(family.description.length).toBeGreaterThan(10)
		for (const role of ROLES) expect(family.skin, role).toHaveProperty(role)
		const used = ROLES.flatMap((role) => {
			const v = family.skin[role]
			return typeof v === 'string' ? [v] : [v.light, v.dark]
		})
		for (const palette of used) expect(family.palettes, palette).toHaveProperty(palette)
	})

	it('holds bare OKLCH components, 50–950', () => {
		for (const [palette, shades] of Object.entries(family.palettes)) {
			expect(Object.keys(shades), palette).toEqual(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'])
			for (const v of Object.values(shades)) expect(v).toMatch(/^[\d.]+ [\d.]+ [\d.]+$/)
		}
	})

	it.each(MODES)('reads its ink ramp at AA on paper and paper-soft in %s', (mode) => {
		expect(inkRampProblems(inkContrast(config, family.skin, mode))).toEqual([])
	})

	it('keeps primary and the status colours apart', () => {
		const fills = DISTINCT.map((role) => [role, family.palettes[family.skin[role]][500]])
		expect(new Set(DISTINCT.map((role) => family.skin[role])).size, 'one palette per role').toBe(DISTINCT.length)
		for (let i = 0; i < fills.length; i++)
			for (let j = i + 1; j < fills.length; j++)
				expect(deltaE(fills[i][1], fills[j][1]), `${fills[i][0]} vs ${fills[j][0]}`).toBeGreaterThanOrEqual(0.07)
	})

	it('puts a readable on-colour on its primary fill', () => {
		const fill = family.palettes[family.skin.primary][500]
		const on = oklch.fromHex(pickOnColor(Y(fill)))
		expect(ratio(fill, on)).toBeGreaterThanOrEqual(AA)
	})

	it.each(MODES)('reads status text at AA on paper and paper-soft in %s', (mode) => {
		const problems = STATUS.flatMap((role) => {
			const text = value(role, mode)
			return [
				['paper', value('paper', mode)],
				['paper-soft', value('paper-soft', mode)]
			]
				.filter(([, bg]) => ratio(text, bg) < AA)
				.map(([bg, v]) => `${role} on ${bg}: ${ratio(text, v).toFixed(2)}`)
		})
		expect(problems).toEqual([])
	})

	it('builds a preset', () => {
		const css = presetRokkit({ palettes: family.palettes, colorSpace: 'oklch', skin: family.skin })
			.preflights.map((p) => p.getCSS())
			.join('')
		expect(css).toContain('[data-mode="dark"]')
	})
})

describe('zen-sumi', () => {
	it('is the learn site and rokkit init palette: shu 500 is the vermillion brand', () => {
		expect(zenSumi.palettes.shu[500]).toBe('0.641 0.190 36')
		expect(zenSumi.skin.danger).toBe('beni')
		expect(zenSumi.skin.info).toBe('ai')
	})
})

describe('exports', () => {
	it('are importable from the package root and from @rokkit/unocss/palettes', async () => {
		const root = await import('@rokkit/unocss')
		const sub = await import('@rokkit/unocss/palettes')
		expect(root.PALETTE_FAMILIES).toBe(PALETTE_FAMILIES)
		expect(sub.zenSumi).toBe(zenSumi)
		expect(Object.keys(sub.PALETTE_FAMILIES)).toEqual(['zen-sumi', 'sea-glass', 'sakura-ember', 'fuji-dusk', 'moss-garden'])
	})
})
