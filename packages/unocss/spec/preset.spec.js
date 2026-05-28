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
				tokens: 'extended',
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			const rootBlock = css.split('[data-mode')[0]
			expect(rootBlock).toContain('--color-surface-500:rgb(100, 116, 139)')
		})

		it('[data-mode="dark"] should use the dark palette for dual-palette roles', () => {
			// zinc-500 = #71717a → rgb(113, 113, 122)
			const preset = presetRokkit({
				tokens: 'extended',
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--color-surface-500:rgb(113, 113, 122)')
		})

		it('should fall back to light palette in dark block when only light is specified', () => {
			// slate-500 = #64748b → rgb(100, 116, 139) — used in both blocks
			const preset = presetRokkit({
				tokens: 'extended',
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
			const preset = presetRokkit({ tokens: 'extended', skin: { surface: { dark: 'zinc' } } })
			const css = preset.preflights[0].getCSS()
			const rootBlock = css.split('[data-mode')[0]
			expect(rootBlock).toContain('--color-surface-500:rgb(113, 113, 122)')  // zinc
		})

		it('should use dark palette in dark block when only dark property is specified', () => {
			const preset = presetRokkit({ tokens: 'extended', skin: { surface: { dark: 'zinc' } } })
			const css = preset.preflights[0].getCSS()
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--color-surface-500:rgb(113, 113, 122)')  // zinc
		})

		it('should include typography vars in :root when typography is set', () => {
			const preset = presetRokkit({ typography: { sans: 'Inter', mono: 'JetBrains Mono' } })
			const css = preset.preflights[0].getCSS()
			// New canonical names + legacy --font-sans alias for backward compat.
			expect(css).toContain('--font-ui:Inter')
			expect(css).toContain('--font-sans:var(--font-ui)')
			expect(css).toContain('--font-mono:JetBrains Mono')
		})

		it('emits --font-display when typography.display is set', () => {
			const preset = presetRokkit({ typography: { display: 'Fraunces' } })
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--font-display:Fraunces')
			expect(css).toContain('--font-heading:var(--font-display)')
		})

		it('accepts legacy typography.heading config and maps to --font-display', () => {
			const preset = presetRokkit({ typography: { heading: 'Cal Sans' } })
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--font-display:Cal Sans')
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
			expect(css).toContain('--font-ui:Inter')
			expect(css).toContain('--radius-md:0.5rem')
		})

		it('should include no font vars when typography is not set', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			expect(css).not.toContain('--font-ui')
			expect(css).not.toContain('--font-display')
			expect(css).not.toContain('--font-mono')
			// Legacy aliases also absent when nothing to alias.
			expect(css).not.toContain('--font-sans:var')
			expect(css).not.toContain('--font-heading:var')
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
			const preset = presetRokkit({ tokens: 'extended' })
			const css = preset.preflights[0].getCSS()
			// rgb values should be wrapped: rgb(R, G, B) not bare R,G,B
			expect(css).toMatch(/--color-primary-500:rgb\(\d+, \d+, \d+\)/)
		})

		it('preflight CSS variables should contain wrapped color values for oklch', () => {
			const preset = presetRokkit({ tokens: 'extended', colorSpace: 'oklch' })
			const css = preset.preflights[0].getCSS()
			// oklch values should be wrapped: oklch(L C H) not bare L C H
			expect(css).toMatch(/--color-primary-500:oklch\([\d.]+ [\d.]+ [\d.]+\)/)
		})

		it('preflight CSS variables should contain wrapped color values for hsl', () => {
			const preset = presetRokkit({ tokens: 'extended', colorSpace: 'hsl' })
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

		it('should register rokkit / semantic / glyph icon collections by default', () => {
			const preset = presetRokkit()
			const iconsPreset = preset.presets.find((p) => p && p.name === '@unocss/preset-icons')
			const collections = iconsPreset.options.collections
			expect(collections.rokkit).toBeDefined()
			expect(collections.semantic).toBeDefined()
			expect(collections.glyph).toBeDefined()
		})

		it('should auto-safelist user-defined icon override keys', () => {
			const preset = presetRokkit({
				icons: {
					overrides: {
						'brand-logo': 'i-custom:logo',
						pizza: 'i-fluent-emoji:pizza'
					}
				}
			})
			expect(preset.safelist).toContain('brand-logo')
			expect(preset.safelist).toContain('pizza')
		})
	})

	describe('contrast warnings', () => {
		it('should warn when ink and surface have low contrast at z1', () => {
			const warnings = []
			const origWarn = console.warn
			console.warn = (msg) => warnings.push(msg)

			try {
				presetRokkit({
					palettes: {
						flat: {
							50: '0.5 0 0', 100: '0.5 0 0', 200: '0.5 0 0', 300: '0.5 0 0',
							400: '0.5 0 0', 500: '0.5 0 0', 600: '0.5 0 0', 700: '0.5 0 0',
							800: '0.5 0 0', 900: '0.5 0 0', 950: '0.5 0 0'
						}
					},
					colorSpace: 'oklch',
					skins: {
						default: {
							surface: 'flat',
							ink: 'flat',
							primary: 'flat'
						}
					}
				})
			} finally {
				console.warn = origWarn
			}

			expect(warnings.some(w => /contrast/i.test(w))).toBe(true)
		})

		it('should not warn when ink and surface have good contrast', () => {
			const warnings = []
			const origWarn = console.warn
			console.warn = (msg) => warnings.push(msg)

			try {
				// Default preset uses slate for both ink and surface,
				// but ink's z-scale is inverted so contrast is good
				presetRokkit()
			} finally {
				console.warn = origWarn
			}

			expect(warnings.some(w => /contrast/i.test(w))).toBe(false)
		})
	})

	describe('preflights — core mode (default)', () => {
		it('emits the 18+ named tokens in :root', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			const rootBlock = css.split('[data-mode')[0]
			expect(rootBlock).toContain('--paper:')
			expect(rootBlock).toContain('--paper-soft:')
			expect(rootBlock).toContain('--paper-mute:')
			expect(rootBlock).toContain('--paper-edge:')
			expect(rootBlock).toContain('--ink:')
			expect(rootBlock).toContain('--ink-mute:')
			expect(rootBlock).toContain('--primary:')
			expect(rootBlock).toContain('--on-primary:')
			expect(rootBlock).toContain('--accent:')
			expect(rootBlock).toContain('--accent-soft:')
			expect(rootBlock).toContain('--focus-ring:')
		})

		it('emits z-aliases pointing at named layer (no palette indirection)', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--color-surface-z0:var(--paper)')
			expect(css).toContain('--color-surface-z1:var(--paper-soft)')
			expect(css).toContain('--color-surface-z2:var(--paper-mute)')
			expect(css).toContain('--color-surface-z3:var(--paper-mute)')
			expect(css).toContain('--color-surface-z4:var(--paper-edge)')
		})

		it('does NOT emit raw palette vars in core mode', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			expect(css).not.toMatch(/--color-surface-50:rgb/)
			expect(css).not.toMatch(/--color-surface-900:rgb/)
		})

		it('emits [data-mode="dark"] block when skin uses dual-palette', () => {
			const preset = presetRokkit({
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]{')
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--paper:')
		})

		it('emits [data-mode="dark"] block when custom uses { light, dark }', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' }, sumi: { 900: '#0d0d0d' } },
				custom: { bleed: { light: 'kami.50', dark: 'sumi.900' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]')
		})

		it('does NOT emit [data-mode="dark"] block when custom has only light side', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				custom: { canvas: { light: 'kami.50' } }  // no dark key
			})
			const css = preset.preflights[0].getCSS()
			expect(css).not.toContain('[data-mode="dark"]')
		})

		it('emits [data-mode="dark"] block when custom has dark-only side', () => {
			// dark-only intentionally emits dark block — light cascade can pick a default
			const preset = presetRokkit({
				palettes: { sumi: { 900: '#0d0d0d' } },
				custom: { canvas: { dark: 'sumi.900' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]')
		})

		it('throws when a custom token name collides with a reserved name', () => {
			expect(() => presetRokkit({ custom: { paper: '#fff' } })).toThrow(/reserved/i)
		})

		it('emits custom CSS vars in :root', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				custom: { canvas: 'kami.50', 'canvas-grid': '#d4d4d4' }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--canvas:rgb(248, 248, 243)')
			expect(css).toContain('--canvas-grid:#d4d4d4')
		})
	})

	describe('preflights — extended mode', () => {
		it('emits the full palette + named-as-aliases', () => {
			const preset = presetRokkit({ tokens: 'extended' })
			const css = preset.preflights[0].getCSS()
			expect(css).toMatch(/--color-surface-50:rgb/)
			expect(css).toMatch(/--color-surface-900:rgb/)
			expect(css).toContain('--paper:var(--color-surface-50)')
			expect(css).toContain('--ink:var(--color-ink-900)')
		})

		it('emits z-aliases in extended mode (today\'s behavior)', () => {
			const preset = presetRokkit({ tokens: 'extended' })
			const css = preset.preflights[0].getCSS()
			// Extended mode keeps the original getZScaleCSS-style z scale,
			// but with named tokens layered on top.
			expect(css).toContain('--paper:var(--color-surface-50)')
		})
	})

	describe('shortcuts — named layer', () => {
		it('emits bg-paper, bg-paper-soft, bg-paper-mute, bg-paper-edge', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('bg-paper')
			expect(keys).toContain('bg-paper-soft')
			expect(keys).toContain('bg-paper-mute')
			expect(keys).toContain('bg-paper-edge')
		})

		it('emits text-ink, text-ink-mute, text-ink-soft, text-ink-faint', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('text-ink')
			expect(keys).toContain('text-ink-mute')
			expect(keys).toContain('text-ink-soft')
			expect(keys).toContain('text-ink-faint')
		})

		it('emits text-on-primary but not bg-on-primary', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('text-on-primary')
			expect(keys).not.toContain('bg-on-primary')
		})

		it('emits status soft shortcuts: bg-success-soft, bg-warning-soft, bg-danger-soft', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('bg-success-soft')
			expect(keys).toContain('bg-warning-soft')
			expect(keys).toContain('bg-danger-soft')
		})

		it('emits border-paper-edge for hairline borders', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('border-paper-edge')
			expect(keys).toContain('border-t-paper-edge')
			expect(keys).toContain('border-b-paper-edge')
		})

		it('emits ring-focus-ring but not bg-focus-ring', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('ring-focus-ring')
			expect(keys).not.toContain('bg-focus-ring')
			expect(keys).not.toContain('text-focus-ring')
		})

		it('does NOT emit shortcuts for shadow-tint', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).not.toContain('bg-shadow-tint')
			expect(keys).not.toContain('text-shadow-tint')
			expect(keys).not.toContain('border-shadow-tint')
		})

		it('bg-paper expands to background: var(--paper)', () => {
			const preset = presetRokkit()
			const entry = preset.shortcuts.find(s => s[0] === 'bg-paper')
			expect(entry).toBeDefined()
			const expansion = entry[1]
			const str = typeof expansion === 'string' ? expansion : JSON.stringify(expansion)
			expect(str).toContain('--paper')
		})

		it('bg-* shortcuts use background-color (not the background shorthand)', () => {
			const preset = presetRokkit()
			const entry = preset.shortcuts.find(s => s[0] === 'bg-paper')
			expect(entry).toBeDefined()
			const expansion = entry[1]
			// expansion is a CSS-properties object; key should be background-color
			expect(expansion).toHaveProperty('background-color')
			expect(expansion).not.toHaveProperty('background')
		})

		it('emits fill- and stroke- shortcuts for chart use', () => {
			const preset = presetRokkit()
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('fill-primary')
			expect(keys).toContain('stroke-accent')
		})
	})

	describe('custom-token shortcuts', () => {
		it('emits bg-canvas shortcut for color-valued palette-ref custom token', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				custom: { canvas: 'kami.50' }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('bg-canvas')
			expect(keys).toContain('text-canvas')
			expect(keys).toContain('border-canvas')
		})

		it('emits shortcuts for raw color values (oklch, hex, rgb)', () => {
			const preset = presetRokkit({
				custom: {
					primary2: 'oklch(0.5 0.1 30)',
					edge: '#d4d4d4',
					flag: 'rgb(255, 0, 0)'
				}
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('bg-primary2')
			expect(keys).toContain('bg-edge')
			expect(keys).toContain('bg-flag')
		})

		it('does NOT emit shortcuts for non-color custom values', () => {
			const preset = presetRokkit({
				custom: { 'grid-size': '8px', fade: '1.2s ease', spacer: '100%' }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).not.toContain('bg-grid-size')
			expect(keys).not.toContain('bg-fade')
			expect(keys).not.toContain('bg-spacer')
		})

		it('emits shortcuts for mode-aware custom tokens (uses light value for color check)', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' }, sumi: { 900: '#0d0d0d' } },
				custom: { bleed: { light: 'kami.50', dark: 'sumi.900' } }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('bg-bleed')
		})

		it('bg-canvas expansion uses var(--canvas)', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				custom: { canvas: 'kami.50' }
			})
			const entry = preset.shortcuts.find(s => s[0] === 'bg-canvas')
			expect(entry).toBeDefined()
			expect(entry[1]).toEqual({ 'background-color': 'var(--canvas)' })
		})

		it('does NOT emit ring-canvas for arbitrary tokens (ring is reserved for *-ring named or focus)', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				custom: { canvas: 'kami.50' }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).not.toContain('ring-canvas')
		})

		it('emits ring shortcut when custom token name ends in -ring', () => {
			const preset = presetRokkit({
				custom: { 'glow-ring': '#ff0000' }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('ring-glow-ring')
		})
	})

	describe('preflights — per-role tokens mode', () => {
		it('emits palette vars only for extended roles', () => {
			const preset = presetRokkit({
				tokens: { surface: 'core', primary: 'extended' }
			})
			const css = preset.preflights[0].getCSS()
			// primary is extended → full palette emitted
			expect(css).toMatch(/--color-primary-50:rgb/)
			expect(css).toMatch(/--color-primary-500:rgb/)
			// surface is core → no raw palette vars
			expect(css).not.toMatch(/--color-surface-50:rgb/)
			expect(css).not.toMatch(/--color-surface-900:rgb/)
			// surface named layer is inlined
			expect(css).toMatch(/--paper:rgb/)
			expect(css).toMatch(/--paper-soft:rgb/)
		})

		it('emits named tokens as palette aliases for extended roles', () => {
			const preset = presetRokkit({
				tokens: { primary: 'extended' }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--primary:var(--color-primary-500)')
		})

		it('emits named tokens inlined for core roles in mixed mode', () => {
			const preset = presetRokkit({
				tokens: { primary: 'extended' }   // surface defaults to 'core'
			})
			const css = preset.preflights[0].getCSS()
			// --paper resolves to a concrete color, not a var()
			expect(css).toMatch(/--paper:rgb\(\d+, \d+, \d+\)/)
			// should NOT be var()-form
			expect(css).not.toMatch(/--paper:var\(/)
		})

		it('emits z-aliases respecting per-role mode', () => {
			const preset = presetRokkit({
				tokens: { surface: 'core', primary: 'extended' }
			})
			const css = preset.preflights[0].getCSS()
			// surface (core) → z-aliases point at named layer
			expect(css).toContain('--color-surface-z1:var(--paper-soft)')
			// primary (extended) → z-aliases point at palette vars
			expect(css).toContain('--color-primary-z5:var(--color-primary-500)')
		})

		it('extended global mode still works (regression check)', () => {
			const preset = presetRokkit({ tokens: 'extended' })
			const css = preset.preflights[0].getCSS()
			expect(css).toMatch(/--color-surface-50:rgb/)
			expect(css).toMatch(/--color-primary-50:rgb/)
			expect(css).toContain('--paper:var(--color-surface-50)')
		})

		it('core global mode still works (regression check)', () => {
			const preset = presetRokkit({ tokens: 'core' })
			const css = preset.preflights[0].getCSS()
			expect(css).not.toMatch(/--color-surface-50:rgb/)
			expect(css).toMatch(/--paper:rgb/)
		})
	})
})
