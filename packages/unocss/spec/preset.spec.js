import { describe, it, expect } from 'vitest'
import { presetRokkit } from '../src/preset.js'

describe('presetRokkit', () => {
	it('should return a valid UnoCSS preset object', () => {
		const preset = presetRokkit()
		expect(preset).toHaveProperty('name', 'rokkit')
		expect(preset).toHaveProperty('presets')
		expect(preset).toHaveProperty('shortcuts')
		expect(preset).toHaveProperty('theme')
		expect(preset).toHaveProperty('extractors')
		expect(preset).toHaveProperty('rules')
	})

	it('should include presetWind3 and presetIcons in nested presets', () => {
		const preset = presetRokkit()
		expect(preset.presets.length).toBeGreaterThanOrEqual(2)
		const names = preset.presets.map((p) => p.name)
		expect(names).toContain('@unocss/preset-wind3')
		expect(names).toContain('@unocss/preset-icons')
	})

	it('should generate icon shortcuts from DEFAULT_ICONS', () => {
		const preset = presetRokkit()
		const iconEntries = preset.shortcuts.filter(
			(s) => Array.isArray(s) && typeof s[0] === 'string' && typeof s[1] === 'string'
		)
		const iconNames = iconEntries.map(([k]) => k)
		expect(iconNames).toContain('accordion-opened')
		expect(iconNames).toContain('checkbox-checked')
	})

	it('should map accordion-opened to i-semantic by default', () => {
		const preset = presetRokkit()
		const entry = preset.shortcuts.find((s) => Array.isArray(s) && s[0] === 'accordion-opened')
		expect(entry[1]).toBe('i-semantic:accordion-opened')
	})

	it('should apply icons.overrides to replace specific semantic shortcuts', () => {
		const preset = presetRokkit({
			icons: { overrides: { 'folder-open': 'i-phosphor:folder-open' } }
		})
		const entry = preset.shortcuts.find((s) => Array.isArray(s) && s[0] === 'folder-open')
		expect(entry[1]).toBe('i-phosphor:folder-open')
	})

	it('should leave non-overridden shortcuts pointing to i-semantic', () => {
		const preset = presetRokkit({
			icons: { overrides: { 'folder-open': 'i-phosphor:folder-open' } }
		})
		const entry = preset.shortcuts.find((s) => Array.isArray(s) && s[0] === 'accordion-opened')
		expect(entry[1]).toBe('i-semantic:accordion-opened')
	})

	it('should apply icon style variant suffix', () => {
		const preset = presetRokkit({ icons: { style: 'solid' } })
		const entry = preset.shortcuts.find((s) => Array.isArray(s) && s[0] === 'accordion-opened')
		expect(entry[1]).toBe('i-semantic:accordion-opened-solid')
	})

	it('should use custom icon collection when specified', () => {
		const preset = presetRokkit({ icons: { collection: 'phosphor' } })
		const entry = preset.shortcuts.find((s) => Array.isArray(s) && s[0] === 'accordion-opened')
		expect(entry[1]).toBe('i-phosphor:accordion-opened')
	})

	it('should generate skin shortcuts from config skins (multi-skin mode)', () => {
		const preset = presetRokkit({
			skins: {
				default: { primary: 'orange', surface: 'slate' },
				vibrant: { primary: 'blue', secondary: 'purple' }
			}
		})
		const skinEntry = preset.shortcuts.find((s) => Array.isArray(s) && s[0] === 'skin-vibrant')
		expect(skinEntry).toBeDefined()
		expect(typeof skinEntry[1]).toBe('object')
	})

	it('should include font families in theme', () => {
		const preset = presetRokkit()
		expect(preset.theme.fontFamily).toHaveProperty('body')
		expect(preset.theme.fontFamily).toHaveProperty('mono')
		expect(preset.theme.fontFamily).toHaveProperty('heading')
	})

	it('should generate color rules in theme.colors', () => {
		const preset = presetRokkit()
		expect(preset.theme.colors).toHaveProperty('primary')
		expect(preset.theme.colors).toHaveProperty('surface')
		expect(preset.theme.colors.primary).toHaveProperty('500')
	})

	it('should respect inline skin overrides', () => {
		const preset = presetRokkit({ skin: { surface: 'zinc' } })
		expect(preset.theme.colors).toHaveProperty('surface')
		expect(preset.theme.colors.surface).toHaveProperty('500')
	})

	it('should accept colors as backward-compatible alias for skin', () => {
		const preset = presetRokkit({ colors: { surface: 'zinc' } })
		expect(preset.theme.colors).toHaveProperty('surface')
		expect(preset.theme.colors.surface).toHaveProperty('500')
	})

	it('should include safelist with DEFAULT_ICONS and palette colors', () => {
		const preset = presetRokkit()
		expect(preset.safelist).toBeDefined()
		expect(preset.safelist.length).toBeGreaterThan(0)
		expect(preset.safelist).toContain('accordion-opened')
	})

	it('should include svelte extractor', () => {
		const preset = presetRokkit()
		expect(preset.extractors.length).toBeGreaterThan(0)
	})

	it('should include transformers', () => {
		const preset = presetRokkit()
		expect(preset.transformers.length).toBe(2)
	})

	it('should include the hidden rule', () => {
		const preset = presetRokkit()
		const hiddenRule = preset.rules.find((r) => r[0] === 'hidden')
		expect(hiddenRule).toBeDefined()
		expect(hiddenRule[1]).toEqual({ display: 'none' })
	})

	it('should NOT include bg-graph-paper (opt-in via presetBackgrounds)', () => {
		const preset = presetRokkit()
		const rule = preset.rules.find((r) => r[0] === 'bg-graph-paper')
		expect(rule).toBeUndefined()
	})

	it('should include custom palette in theme.colors', () => {
		const preset = presetRokkit({
			palettes: {
				brand: { 50: '#f0f4ff', 500: '#0f4c81', 950: '#071c30' }
			},
			skin: { primary: 'brand' }
		})
		// Verify the custom palette key was injected into theme.colors
		expect(preset.theme.colors).toHaveProperty('brand')
		expect(preset.theme.colors.brand).toEqual(
			expect.objectContaining({
				50: '#f0f4ff',
				500: '#0f4c81',
				950: '#071c30'
			})
		)
		// Verify it can be used as a semantic mapping (primary maps to brand)
		expect(preset.theme.colors).toHaveProperty('primary')
		expect(preset.theme.colors.primary).toHaveProperty('500')
	})

	it('should generate stroke-surface-z4 shortcut', () => {
		const preset = presetRokkit()
		const shortcuts = preset.shortcuts
		const found = shortcuts.some(
			(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0] === 'stroke-surface-z4'
		)
		expect(found).toBe(true)
	})

	it('should generate fill-primary-z5 shortcut', () => {
		const preset = presetRokkit()
		const shortcuts = preset.shortcuts
		const found = shortcuts.some(
			(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0] === 'fill-primary-z5'
		)
		expect(found).toBe(true)
	})

	describe('preflights — dark mode CSS block', () => {
		it('should not generate a [data-mode="dark"] block when all colors are plain strings', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			expect(css).toContain(':root{')
			expect(css).not.toContain('[data-mode="dark"]')
		})

		it('should generate a [data-mode="dark"] block when any color uses dual-palette syntax', () => {
			const preset = presetRokkit({
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain(':root{')
			expect(css).toContain('[data-mode="dark"]{')
		})

		it(':root should use the light palette for dual-palette roles', () => {
			// slate-500 = #64748b → rgb(100, 116, 139)
			const preset = presetRokkit({
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			const rootBlock = css.split('[data-mode')[0]
			expect(rootBlock).toContain('--color-surface-500:rgb(100, 116, 139)')
		})

		it('[data-mode="dark"] should use the dark palette for dual-palette roles', () => {
			// zinc-500 = #71717a → rgb(113, 113, 122)
			const preset = presetRokkit({
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--color-surface-500:rgb(113, 113, 122)')
		})

		it('should fall back to light palette in dark block when only light is specified', () => {
			// slate-500 = #64748b → rgb(100, 116, 139) — used in both blocks
			const preset = presetRokkit({
				skin: { surface: { light: 'slate' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]{')
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--color-surface-500:rgb(100, 116, 139)')
		})

		it('should only generate dark block for custom dual-palette, not for all roles', () => {
			// When surface uses dual-palette, primary still uses plain string
			const preset = presetRokkit({
				skin: { surface: { light: 'slate', dark: 'zinc' }, primary: 'orange' }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]{')
			// Dark block should include surface vars (different palette)
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--color-surface-')
		})

		it('should generate dark block when all roles use dual-palette syntax', () => {
			const preset = presetRokkit({
				skin: {
					surface: { light: 'slate', dark: 'zinc' },
					primary: { light: 'blue', dark: 'indigo' }
				}
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]{')
		})

		it('should fall back to dark palette in light :root when only dark property is specified', () => {
			// surface: { dark: 'zinc' } — no light → resolveMappingForMode('light') falls back to 'zinc'
			// zinc-500 → rgb(113, 113, 122)
			const preset = presetRokkit({ skin: { surface: { dark: 'zinc' } } })
			const css = preset.preflights[0].getCSS()
			const rootBlock = css.split('[data-mode')[0]
			expect(rootBlock).toContain('--color-surface-500:rgb(113, 113, 122)')  // zinc
		})

		it('should use dark palette in dark block when only dark property is specified', () => {
			const preset = presetRokkit({ skin: { surface: { dark: 'zinc' } } })
			const css = preset.preflights[0].getCSS()
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--color-surface-500:rgb(113, 113, 122)')  // zinc
		})

		it('should include typography vars in :root when typography is set', () => {
			const preset = presetRokkit({ typography: { sans: 'Inter', mono: 'JetBrains Mono' } })
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--font-sans:Inter')
			expect(css).toContain('--font-mono:JetBrains Mono')
		})

		it('should include radius vars in :root when a named shape preset is set', () => {
			const preset = presetRokkit({ shape: { radius: 'soft' } })
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--radius-sm:0.125rem')
			expect(css).toContain('--radius-md:0.375rem')
			expect(css).toContain('--radius-full:9999px')
		})

		it('should include no radius vars when shape radius is an unknown preset name', () => {
			const preset = presetRokkit({ shape: { radius: 'nonexistent' } })
			const css = preset.preflights[0].getCSS()
			expect(css).not.toContain('--radius-')
		})

		it('should include both typography and radius vars when both are set', () => {
			const preset = presetRokkit({
				typography: { sans: 'Inter' },
				shape: { radius: 'rounded' }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--font-sans:Inter')
			expect(css).toContain('--radius-md:0.5rem')
		})

		it('should include no font vars when typography is not set', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			expect(css).not.toContain('--font-sans')
			expect(css).not.toContain('--font-mono')
		})
	})

	describe('color-mix alpha — opacity modifiers produce correct percentages', () => {
		it('theme.colors should use calc(<alpha-value> * 100%) for rgb color space', () => {
			const preset = presetRokkit()
			const primary500 = preset.theme.colors.primary[500]
			expect(primary500).toContain('calc(<alpha-value> * 100%)')
			expect(primary500).toContain('color-mix(in srgb,')
			expect(primary500).toContain('transparent)')
		})

		it('theme.colors should use calc(<alpha-value> * 100%) for oklch color space', () => {
			const preset = presetRokkit({ colorSpace: 'oklch' })
			const primary500 = preset.theme.colors.primary[500]
			expect(primary500).toContain('calc(<alpha-value> * 100%)')
			expect(primary500).toContain('color-mix(in oklch,')
		})

		it('theme.colors should use calc(<alpha-value> * 100%) for hsl color space', () => {
			const preset = presetRokkit({ colorSpace: 'hsl' })
			const primary500 = preset.theme.colors.primary[500]
			expect(primary500).toContain('calc(<alpha-value> * 100%)')
			expect(primary500).toContain('color-mix(in srgb,')
		})

		it('preflight CSS variables should contain wrapped color values for rgb', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			// rgb values should be wrapped: rgb(R, G, B) not bare R,G,B
			expect(css).toMatch(/--color-primary-500:rgb\(\d+, \d+, \d+\)/)
		})

		it('preflight CSS variables should contain wrapped color values for oklch', () => {
			const preset = presetRokkit({ colorSpace: 'oklch' })
			const css = preset.preflights[0].getCSS()
			// oklch values should be wrapped: oklch(L C H) not bare L C H
			expect(css).toMatch(/--color-primary-500:oklch\([\d.]+ [\d.]+ [\d.]+\)/)
		})

		it('preflight CSS variables should contain wrapped color values for hsl', () => {
			const preset = presetRokkit({ colorSpace: 'hsl' })
			const css = preset.preflights[0].getCSS()
			// hsl values should be wrapped: hsl(H S% L%) not bare H S% L%
			expect(css).toMatch(/--color-primary-500:hsl\(\d+ \d+% \d+%\)/)
		})
	})

	describe('alias and custom role support', () => {
		it('should generate semantic shortcuts for alias roles', () => {
			const preset = presetRokkit({
				skins: {
					default: {
						surface: 'slate',
						primary: 'orange',
						paper: { alias: 'surface' }
					}
				}
			})
			// paper shortcuts should exist
			const shortcuts = preset.shortcuts
			const hasPaperShortcut = shortcuts.some((s) => {
				if (typeof s === 'string') return s.includes('paper')
				if (Array.isArray(s)) {
					if (s[0] instanceof RegExp) return s[0].source.includes('paper')
					if (typeof s[0] === 'string') return s[0].includes('paper')
				}
				return false
			})
			expect(hasPaperShortcut).toBe(true)
		})

		it('should generate color rules for alias that reference target CSS vars', () => {
			const preset = presetRokkit({
				skins: {
					default: {
						surface: 'slate',
						primary: 'orange',
						paper: { alias: 'surface' }
					}
				}
			})
			const colors = preset.theme.colors
			expect(colors).toHaveProperty('paper')
			// paper's shade 500 should reference --color-surface-500 (the target)
			expect(colors.paper[500]).toContain('--color-surface-500')
		})

		it('should NOT generate CSS variable preflights for aliases', () => {
			const preset = presetRokkit({
				skins: {
					default: {
						surface: 'slate',
						primary: 'orange',
						paper: { alias: 'surface' }
					}
				}
			})
			const css = preset.preflights[0].getCSS()
			// paper should NOT have its own CSS variables
			expect(css).not.toContain('--color-paper')
			// surface SHOULD have CSS variables
			expect(css).toContain('--color-surface')
		})

		it('should generate full color rules for custom roles', () => {
			const preset = presetRokkit({
				skins: {
					default: {
						surface: 'slate',
						primary: 'orange',
						canvas: 'stone'
					}
				}
			})
			const colors = preset.theme.colors
			expect(colors).toHaveProperty('canvas')
			// canvas should reference its OWN CSS vars (not another role's)
			expect(colors.canvas[500]).toContain('--color-canvas-500')
		})

		it('should include ink in default preset color rules', () => {
			const preset = presetRokkit()
			const colors = preset.theme.colors
			expect(colors).toHaveProperty('ink')
			expect(colors.ink[500]).toContain('--color-ink-500')
		})
	})

	describe('generalized dual-palette', () => {
		it('should generate dark overrides for any dual-palette role', () => {
			const preset = presetRokkit({
				palettes: {},
				skins: {
					default: {
						surface: 'slate',
						primary: { light: 'orange', dark: 'amber' }
					}
				}
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]')
			expect(css).toContain('--color-primary')
		})
	})

	describe('shortcuts — skin and icon coverage', () => {
		it('should produce no skin-* shortcuts when skins is empty', () => {
			const preset = presetRokkit()
			const skinShortcuts = preset.shortcuts.filter(
				(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0].startsWith('skin-')
			)
			expect(skinShortcuts).toHaveLength(0)
		})

		it('should produce one skin-* shortcut per skin in multi-skin mode', () => {
			const preset = presetRokkit({
				skins: {
					default: { primary: 'orange', surface: 'slate' },
					ocean:   { primary: 'sky',    surface: 'slate' }
				}
			})
			const skinShortcuts = preset.shortcuts.filter(
				(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0].startsWith('skin-')
			)
			expect(skinShortcuts).toHaveLength(2)
			expect(skinShortcuts.map(([k]) => k)).toContain('skin-default')
			expect(skinShortcuts.map(([k]) => k)).toContain('skin-ocean')
		})

		it('should merge icon overrides with base shortcuts without duplicating non-overridden icons', () => {
			const preset = presetRokkit({
				icons: { overrides: { 'accordion-opened': 'i-custom:accordion' } }
			})
			const entry = preset.shortcuts.find(
				(s) => Array.isArray(s) && s[0] === 'accordion-opened'
			)
			expect(entry[1]).toBe('i-custom:accordion')
			// Non-overridden icons still use the default collection
			const checkboxEntry = preset.shortcuts.find(
				(s) => Array.isArray(s) && s[0] === 'checkbox-checked'
			)
			expect(checkboxEntry[1]).toBe('i-semantic:checkbox-checked')
		})

		it('should produce icon shortcuts with i-semantic prefix when no overrides are set', () => {
			const preset = presetRokkit()
			const entry = preset.shortcuts.find((s) => Array.isArray(s) && s[0] === 'accordion-opened')
			// No overrides → uses default collection
			expect(entry[1]).toBe('i-semantic:accordion-opened')
		})
	})
})
