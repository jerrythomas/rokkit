import { describe, it, expect } from 'vitest'
import { PALETTE_FAMILIES, zenSumi } from '@rokkit/unocss/palettes'
import learnConfig from '../rokkit.config.js'
import { skinDefinitions, getPaletteColor } from '../src/lib/data/skins.js'

/**
 * The learn site wears rokkit's exported palette families — it imports them, it does not copy
 * them — and its skin switcher lists them by name.
 */
const families = Object.values(PALETTE_FAMILIES)
/** The skin id a family takes on the site: zen-sumi is the default (`:root`) skin. */
const skinId = (name: string) => (name === 'zen-sumi' ? 'default' : name)

describe('learn rokkit.config.js', () => {
	it('uses each family skin as is', () => {
		expect(learnConfig.skins.default).toBe(zenSumi.skin)
		for (const family of families) expect(learnConfig.skins[skinId(family.name)]).toBe(family.skin)
	})

	it('carries every family palette, unchanged', () => {
		for (const family of families)
			for (const [name, shades] of Object.entries(family.palettes))
				expect(learnConfig.palettes[name], name).toBe(shades)
	})
})

describe('skin switcher', () => {
	it('lists the families by name', () => {
		expect(skinDefinitions.map((s) => s.name)).toEqual(families.map((f) => skinId(f.name)))
		expect(skinDefinitions.map((s) => s.label)).toEqual([
			'Zen Sumi',
			'Sea Glass',
			'Sakura Ember',
			'Fuji Dusk',
			'Moss Garden'
		])
	})

	it('swatches a family palette from the family values', () => {
		expect(getPaletteColor('shu')).toBe(`oklch(${zenSumi.palettes.shu[500]})`)
		expect(getPaletteColor('umi')).toBe(`oklch(${PALETTE_FAMILIES['sea-glass'].palettes.umi[500]})`)
	})
})
