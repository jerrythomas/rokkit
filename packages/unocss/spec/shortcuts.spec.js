import { describe, it, expect } from 'vitest'
import { DEFAULT_ICONS } from '@rokkit/core'
import { loadConfig, resolveColormap } from '../src/config.js'
import { themeFor } from '../src/colors.js'
import { overrideTokenShortcuts, iconShortcutEntries, safelist, shortcuts, iconCollectionsFor } from '../src/shortcuts.js'

const names = (entries) => entries.map(([name]) => name)

describe('overrideTokenShortcuts', () => {
	it('emits colour utilities for a colour-valued custom token, ring only for a -ring name', () => {
		const config = loadConfig({
			overrides: { glow: 'oklch(0.7 0.1 30)', 'glow-ring': { light: '#fff', dark: '#000' } },
			palettes: {}
		})
		const out = names(overrideTokenShortcuts(config))
		expect(out).toContain('bg-glow')
		expect(out).toContain('text-glow')
		expect(out).not.toContain('ring-glow')
		expect(out).toContain('ring-glow-ring')
	})

	it('maps each utility to the token var', () => {
		const config = loadConfig({ overrides: { glow: '#abcdef' } })
		const bg = overrideTokenShortcuts(config).find(([name]) => name === 'bg-glow')
		expect(Object.values(bg[1])).toEqual(['var(--glow)'])
	})

	it('skips a reserved named token and a non-colour value; takes a palette ref as a colour', () => {
		const config = loadConfig({
			overrides: { 'paper-edge': '#fff', 'size-gap': '4px', tint: 'kami.50' },
			palettes: { kami: { 50: '0.9 0.01 90' } }
		})
		const out = names(overrideTokenShortcuts(config))
		expect(out.some((n) => n.endsWith('-paper-edge'))).toBe(false)
		expect(out.some((n) => n.endsWith('-size-gap'))).toBe(false)
		expect(out).toContain('bg-tint')
	})
})

describe('iconShortcutEntries', () => {
	it('maps every default icon into the semantic collection unless one is configured', () => {
		const entries = Object.fromEntries(iconShortcutEntries(loadConfig({})))
		expect(Object.keys(entries)).toEqual(expect.arrayContaining(DEFAULT_ICONS))
		expect(String(entries[DEFAULT_ICONS[0]])).toContain('i-semantic')
		const phosphor = Object.fromEntries(iconShortcutEntries(loadConfig({ icons: { collection: 'phosphor' } })))
		expect(String(phosphor[DEFAULT_ICONS[0]])).toContain('i-phosphor')
	})
	it('lets icons.overrides replace or add a shortcut', () => {
		const entries = Object.fromEntries(
			iconShortcutEntries(loadConfig({ icons: { overrides: { [DEFAULT_ICONS[0]]: 'i-x:y', mine: 'i-a:b' } } }))
		)
		expect(entries[DEFAULT_ICONS[0]]).toBe('i-x:y')
		expect(entries.mine).toBe('i-a:b')
	})
})

describe('safelist', () => {
	it('keeps the default icons, the icon override names and every palette background', () => {
		const list = safelist(loadConfig({ icons: { overrides: { mine: 'i-a:b' } } }))
		expect(list).toEqual(expect.arrayContaining([...DEFAULT_ICONS, 'mine']))
		expect(list.some((c) => /^bg-\w+-\d+$/.test(c))).toBe(true)
		expect(list.some((c) => /^bg-\w+-\d+\/50$/.test(c))).toBe(true)
	})
})

describe('shortcuts', () => {
	it('is semantic, then named, then override-token, then icon shortcuts', () => {
		const config = loadConfig({ overrides: { glow: '#abcdef' } })
		const colormap = resolveColormap(config)
		const all = names(shortcuts(themeFor(colormap, config, 'light'), colormap, config).filter(Array.isArray))
		const glow = all.indexOf('bg-glow')
		const icon = all.indexOf(DEFAULT_ICONS[0])
		expect(glow).toBeGreaterThan(0)
		expect(icon).toBeGreaterThan(glow)
	})
})

describe('iconCollectionsFor', () => {
	it('loads the built-in and configured collections, never the icon settings keys', () => {
		const icons = loadConfig({ icons: { collection: 'phosphor', style: 'fill', overrides: { a: 'i-x:y' }, mine: './mine.json' } }).icons
		const collections = Object.keys(iconCollectionsFor(icons))
		expect(collections).toEqual(expect.arrayContaining(['rokkit', 'semantic', 'glyph', 'app', 'mine']))
		expect(collections).not.toContain('collection')
		expect(collections).not.toContain('style')
		expect(collections).not.toContain('overrides')
	})
})
