import { describe, it, expect } from 'vitest'
import { categoricalPalette } from '@rokkit/core'
import { createGraphPreset, defaultGraphPreset, resolveGroupStyles } from '../src/preset.js'

describe('createGraphPreset', () => {
	it('returns the defaults when given no overrides', () => {
		expect(createGraphPreset()).toEqual(defaultGraphPreset)
	})

	it('merges shades key-by-key so a partial override keeps the rest', () => {
		const preset = createGraphPreset({ shades: { light: { fill: '200' } } })

		expect(preset.shades.light.fill).toBe('200')
		expect(preset.shades.light.stroke).toBe(defaultGraphPreset.shades.light.stroke)
		expect(preset.shades.dark).toEqual(defaultGraphPreset.shades.dark)
	})

	it('carries no `kinds` map — node kinds are themed in CSS, not here', () => {
		// The two vocabularies are split on purpose: a kind is a closed set known at build
		// time and lives in `[data-node-kind='…']` rules per style; a group name is open-ended,
		// which is why this preset exists at all. An earlier draft had a `kinds` field that
		// nothing read.
		expect('kinds' in defaultGraphPreset).toBe(false)
	})

	it('replaces the groups ramp wholesale — order is the assignment', () => {
		const preset = createGraphPreset({ groups: ['teal', 'gold'] })

		expect(preset.groups).toEqual(['teal', 'gold'])
	})

	it('defaults `using` to color', () => {
		expect(defaultGraphPreset.using).toBe('color')
	})

	it('names only families that exist in the categorical palette', () => {
		// A typo here is invisible: resolveGroupStyles would index `undefined` and throw only
		// for the group unlucky enough to land on that ramp position.
		const named = [...defaultGraphPreset.groups]

		expect(named.length).toBeGreaterThan(0)
		for (const family of named) {
			expect(categoricalPalette[family], family).toBeDefined()
		}
	})

	it('names only shades that exist on a family', () => {
		const blue = categoricalPalette.blue

		for (const mode of ['light', 'dark'] as const) {
			for (const shade of Object.values(defaultGraphPreset.shades[mode])) {
				expect(blue[shade], `${mode} ${shade}`).toBeDefined()
			}
		}
	})
})

describe('resolveGroupStyles', () => {
	it('assigns families in ramp order and returns CSS custom properties', () => {
		const styles = resolveGroupStyles(
			['public', 'audit'],
			'light',
			createGraphPreset({ groups: ['blue', 'emerald'] })
		)

		expect(Object.keys(styles.get('public') ?? {})).toEqual([
			'--group-fill',
			'--group-stroke',
			'--group-label'
		])
	})

	it('gives two groups different fills', () => {
		const styles = resolveGroupStyles(
			['public', 'audit'],
			'light',
			createGraphPreset({ groups: ['blue', 'emerald'] })
		)

		expect(styles.get('public')?.['--group-fill']).not.toBe(styles.get('audit')?.['--group-fill'])
	})

	it('resolves to the palette hex the preset names, not merely to something distinct', () => {
		// The distinctness assertions above pass for any injective function. This pins the
		// actual value, so a ramp read with the wrong shade key cannot slip through.
		const preset = createGraphPreset({ groups: ['blue'] })
		const styles = resolveGroupStyles(['a'], 'light', preset)

		expect(styles.get('a')).toEqual({
			'--group-fill': categoricalPalette.blue[preset.shades.light.fill],
			'--group-stroke': categoricalPalette.blue[preset.shades.light.stroke],
			'--group-label': categoricalPalette.blue[preset.shades.light.label]
		})
	})

	it('wraps the ramp when there are more groups than families', () => {
		const preset = createGraphPreset({ groups: ['blue'] })
		const styles = resolveGroupStyles(['a', 'b'], 'light', preset)

		expect(styles.get('a')).toEqual(styles.get('b'))
	})

	it('picks different shades in dark mode than light', () => {
		const preset = createGraphPreset({ groups: ['blue'] })
		const light = resolveGroupStyles(['a'], 'light', preset)
		const dark = resolveGroupStyles(['a'], 'dark', preset)

		expect(light.get('a')?.['--group-fill']).not.toBe(dark.get('a')?.['--group-fill'])
	})

	it('assigns by sorted group name so colour is stable across arrange order', () => {
		const preset = createGraphPreset({ groups: ['blue', 'emerald'] })
		const forward = resolveGroupStyles(['audit', 'public'], 'light', preset)
		const reversed = resolveGroupStyles(['public', 'audit'], 'light', preset)

		expect(forward.get('public')).toEqual(reversed.get('public'))
	})

	it('de-duplicates repeated group names', () => {
		// Every node carries its group, so the caller passes one name per NODE. Without the
		// Set the ramp would advance per node and two nodes in the same group would disagree.
		const preset = createGraphPreset({ groups: ['blue', 'emerald'] })
		const styles = resolveGroupStyles(['public', 'public', 'audit'], 'light', preset)

		expect(styles.size).toBe(2)
		expect(styles.get('public')).toEqual(
			resolveGroupStyles(['audit', 'public'], 'light', preset).get('public')
		)
	})

	it('emits pattern ids instead of colours when using = pattern', () => {
		const preset = createGraphPreset({ using: 'pattern', groups: ['blue', 'emerald'] })
		const styles = resolveGroupStyles(['a', 'b'], 'light', preset)

		expect(styles.get('a')?.['--group-pattern']).toBeDefined()
		expect(styles.get('a')?.['--group-pattern']).not.toBe(styles.get('b')?.['--group-pattern'])
	})

	it('uses the default preset when none is passed', () => {
		const styles = resolveGroupStyles(['a'], 'light')

		expect(styles.get('a')?.['--group-fill']).toBe(
			categoricalPalette[defaultGraphPreset.groups[0]][defaultGraphPreset.shades.light.fill]
		)
	})

	it('returns an empty map for no groups', () => {
		expect(resolveGroupStyles([], 'light', createGraphPreset()).size).toBe(0)
	})
})
