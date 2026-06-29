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

	it('should generate [data-skin] preflight blocks from config skins (multi-skin mode)', () => {
		const preset = presetRokkit({
			skins: {
				default: { primary: 'orange', surface: 'slate' },
				vibrant: { primary: 'blue', secondary: 'purple' }
			}
		})
		const css = preset.preflights.map((p) => p.getCSS()).join('\n')
		expect(css).toContain("[data-skin='vibrant']")
		// The resolved default skin lives in :root, not a [data-skin] block.
		expect(css).not.toContain("[data-skin='default']")
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

	it('should NOT generate stroke-surface-z4 z-tone shortcut (removed in Z3)', () => {
		const preset = presetRokkit()
		const shortcuts = preset.shortcuts
		const found = shortcuts.some(
			(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0] === 'stroke-surface-z4'
		)
		expect(found).toBe(false)
	})

	it('should NOT generate fill-primary-z5 z-tone shortcut (removed in Z3)', () => {
		const preset = presetRokkit()
		const shortcuts = preset.shortcuts
		const found = shortcuts.some(
			(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0] === 'fill-primary-z5'
		)
		expect(found).toBe(false)
	})

	describe('preflights — dark mode CSS block', () => {
		it('should not generate a [data-mode="dark"] block when all colors are plain strings', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()
			expect(css).toContain(':root, [data-mode="light"]{')
			expect(css).not.toContain('[data-mode="dark"]')
		})

		it('should generate a [data-mode="dark"] block when any color uses dual-palette syntax', () => {
			const preset = presetRokkit({
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain(':root, [data-mode="light"]{')
			expect(css).toContain('[data-mode="dark"]{')
		})

		it(':root should use the light palette for dual-palette roles', () => {
			// slate-500 = #64748b → rgb(100, 116, 139)
			const preset = presetRokkit({
				tokens: 'extended',
				skin: { surface: { light: 'slate', dark: 'zinc' } }
			})
			const css = preset.preflights[0].getCSS()
			const lightBlock = css.split('[data-mode="dark"]')[0]
			expect(lightBlock).toContain('--color-surface-500:rgb(100, 116, 139)')
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
			// Dark block should include surface named-token vars (different palette resolves different values)
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--paper:')
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
			const lightBlock = css.split('[data-mode="dark"]')[0]
			expect(lightBlock).toContain('--color-surface-500:rgb(113, 113, 122)')  // zinc
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

	describe('preflights — skin blocks', () => {
		function skinCss(config = {}) {
			const preset = presetRokkit(config)
			return preset.preflights.map((p) => p.getCSS()).join('\n')
		}
		it('emits [data-skin="ocean"] for a non-default skin', () => {
			expect(
				skinCss({
					skins: {
						default: { surface: 'slate', primary: 'sky' },
						ocean: { surface: 'slate', primary: 'teal' }
					}
				})
			).toContain("[data-skin='ocean']")
		})
		it('emits a dark selector for a dual-palette skin', () => {
			expect(
				skinCss({
					skins: {
						default: { surface: 'slate', primary: 'sky' },
						duo: { surface: { light: 'slate', dark: 'zinc' }, primary: 'sky' }
					}
				})
			).toMatch(/\[data-mode=['"]dark['"]\]\[data-skin=['"]duo['"]\]/)
		})
		it('built-in skins are available with no skins config', () => {
			expect(skinCss({})).toContain("[data-skin='ocean']")
		})
		it('does not emit a skin-default utility-class shortcut', () => {
			const preset = presetRokkit({ skins: { default: { surface: 'slate', primary: 'sky' } } })
			const names = (preset.shortcuts ?? []).map((s) => (Array.isArray(s) ? s[0] : s))
			expect(names).not.toContain('skin-default')
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
		it('should never produce skin-* utility-class shortcuts (replaced by [data-skin] blocks)', () => {
			const preset = presetRokkit()
			const skinShortcuts = preset.shortcuts.filter(
				(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0].startsWith('skin-')
			)
			expect(skinShortcuts).toHaveLength(0)
		})

		it('should produce a [data-skin] block per non-default skin in multi-skin mode', () => {
			const preset = presetRokkit({
				skins: {
					default: { primary: 'orange', surface: 'slate' },
					ocean:   { primary: 'sky',    surface: 'slate' }
				}
			})
			// No skin-* utility-class shortcuts are emitted any more.
			const skinShortcuts = preset.shortcuts.filter(
				(s) => Array.isArray(s) && typeof s[0] === 'string' && s[0].startsWith('skin-')
			)
			expect(skinShortcuts).toHaveLength(0)
			// Named skins are emitted as [data-skin] preflight blocks; default → :root.
			const css = preset.preflights.map((p) => p.getCSS()).join('\n')
			expect(css).toContain("[data-skin='ocean']")
			expect(css).not.toContain("[data-skin='default']")
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
			const lightRegion = css.split('[data-mode="dark"]')[0]
			expect(lightRegion).toContain('--paper:')
			expect(lightRegion).toContain('--paper-soft:')
			expect(lightRegion).toContain('--paper-mute:')
			expect(lightRegion).toContain('--paper-edge:')
			expect(lightRegion).toContain('--ink:')
			expect(lightRegion).toContain('--ink-mute:')
			expect(lightRegion).toContain('--primary:')
			expect(lightRegion).toContain('--on-primary:')
			expect(lightRegion).toContain('--accent:')
			expect(lightRegion).toContain('--accent-soft:')
			expect(lightRegion).toContain('--focus-ring:')
		})

		it('does not emit z-tone vars (--color-{role}-z{n}) in core or extended mode', () => {
			const core = presetRokkit().preflights.map((p) => p.getCSS()).join('\n')
			const ext = presetRokkit({ tokens: 'extended' }).preflights.map((p) => p.getCSS()).join('\n')
			expect(core).not.toMatch(/--color-[a-z]+-z\d/)
			expect(ext).not.toMatch(/--color-[a-z]+-z\d/)
		})

		it('still emits the bare --color-{role} alias in core mode', () => {
			const css = presetRokkit().preflights.map((p) => p.getCSS()).join('\n')
			expect(css).toContain('--color-surface:')
			expect(css).toContain('--color-primary:')
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

		it('emits [data-mode="dark"] block when an override uses { light, dark }', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' }, sumi: { 900: '#0d0d0d' } },
				overrides: { bleed: { light: 'kami.50', dark: 'sumi.900' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]')
		})

		it('does NOT emit [data-mode="dark"] block when an override has only light side', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				overrides: { canvas: { light: 'kami.50' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).not.toContain('[data-mode="dark"]')
		})

		it('emits [data-mode="dark"] block when an override has dark-only side', () => {
			const preset = presetRokkit({
				palettes: { sumi: { 900: '#0d0d0d' } },
				overrides: { canvas: { dark: 'sumi.900' } }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('[data-mode="dark"]')
		})

		it('emits new (non-reserved) override CSS vars in :root', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				overrides: { canvas: 'kami.50', 'canvas-grid': '#d4d4d4' }
			})
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--canvas:rgb(248, 248, 243)')
			expect(css).toContain('--canvas-grid:#d4d4d4')
		})

		it('reserved-name overrides win over the named-token default in :root', () => {
			const preset = presetRokkit({
				palettes: {
					kami: {
						50: '#ffffff', 100: '#ffffff', 200: '#ffffff', 300: '#ffffff',
						400: '#aaaaaa', 500: '#ffffff', 600: '#ffffff', 700: '#ffffff',
						800: '#222222', 900: '#000000', 950: '#000000'
					}
				},
				overrides: { 'paper-edge': 'kami.800' }
			})
			const css = preset.preflights[0].getCSS()
			const lightRegion = css.split('[data-mode="dark"]')[0]
			// Override emits AFTER the default named-token assignment, so the
			// rightmost `--paper-edge:` wins.
			expect(lightRegion).toContain('--paper-edge:rgb(34, 34, 34)')
		})

		it('reserved-name override with { light, dark } applies per-mode', () => {
			const preset = presetRokkit({
				palettes: {
					kami: {
						50: '#ffffff', 100: '#ffffff', 200: '#ffffff', 300: '#ffffff',
						400: '#aaaaaa', 500: '#ffffff', 600: '#ffffff', 700: '#ffffff',
						800: '#222222', 900: '#000000', 950: '#000000'
					},
					sumi: {
						50: '#111111', 100: '#111111', 200: '#111111', 300: '#111111',
						400: '#333333', 500: '#111111', 600: '#111111', 700: '#111111',
						800: '#cccccc', 900: '#ffffff', 950: '#ffffff'
					}
				},
				skin: { surface: { light: 'kami', dark: 'sumi' }, ink: { light: 'kami', dark: 'sumi' } },
				overrides: { 'paper-edge': { light: 'kami.400', dark: 'sumi.800' } }
			})
			const css = preset.preflights[0].getCSS()
			const [rootBlock, darkBlock] = css.split('[data-mode="dark"]')
			expect(rootBlock).toContain('--paper-edge:rgb(170, 170, 170)')
			expect(darkBlock).toContain('--paper-edge:rgb(204, 204, 204)')
		})

		it('emits light token vars under :root and [data-mode="light"] so a nested data-mode="light" re-asserts them', () => {
			const preset = presetRokkit()
			const css = preset.preflights[0].getCSS()

			expect(css).toContain(':root, [data-mode="light"]{')
			const lightIdx = css.indexOf('[data-mode="light"]')
			expect(lightIdx).toBeGreaterThan(-1)
			expect(css.slice(lightIdx)).toContain('--paper:')
		})

		it('keeps mode-independent vars (radius/font) under :root only', () => {
			const preset = presetRokkit({ shape: { radius: 'soft' } })
			const css = preset.preflights[0].getCSS()
			const start = css.indexOf(':root, [data-mode="light"]{')
			const lightBlock = css.slice(start, css.indexOf('}', start) + 1)
			expect(lightBlock).not.toContain('--radius-md')
			expect(css).toContain('--radius-md')
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

		it('does not emit z-tone vars in extended mode', () => {
			const preset = presetRokkit({ tokens: 'extended' })
			const css = preset.preflights[0].getCSS()
			// Extended mode emits palette vars + named-token aliases; no z-tone vars.
			expect(css).not.toMatch(/--color-[a-z]+-z\d/)
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

	describe('override-token shortcuts', () => {
		it('emits bg-canvas shortcut for color-valued palette-ref override', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				overrides: { canvas: 'kami.50' }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('bg-canvas')
			expect(keys).toContain('text-canvas')
			expect(keys).toContain('border-canvas')
		})

		it('emits shortcuts for raw color values (oklch, hex, rgb)', () => {
			const preset = presetRokkit({
				overrides: {
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

		it('does NOT emit shortcuts for non-color override values', () => {
			const preset = presetRokkit({
				overrides: { 'grid-size': '8px', fade: '1.2s ease', spacer: '100%' }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).not.toContain('bg-grid-size')
			expect(keys).not.toContain('bg-fade')
			expect(keys).not.toContain('bg-spacer')
		})

		it('emits shortcuts for mode-aware override tokens (uses light value for color check)', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' }, sumi: { 900: '#0d0d0d' } },
				overrides: { bleed: { light: 'kami.50', dark: 'sumi.900' } }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).toContain('bg-bleed')
		})

		it('bg-canvas expansion uses var(--canvas)', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				overrides: { canvas: 'kami.50' }
			})
			const entry = preset.shortcuts.find(s => s[0] === 'bg-canvas')
			expect(entry).toBeDefined()
			expect(entry[1]).toEqual({ 'background-color': 'var(--canvas)' })
		})

		it('does NOT emit ring-canvas for arbitrary override tokens (ring is reserved for *-ring named or focus)', () => {
			const preset = presetRokkit({
				palettes: { kami: { 50: '#f8f8f3' } },
				overrides: { canvas: 'kami.50' }
			})
			const keys = preset.shortcuts.filter(s => typeof s[0] === 'string').map(s => s[0])
			expect(keys).not.toContain('ring-canvas')
		})

		it('emits ring shortcut when override token name ends in -ring', () => {
			const preset = presetRokkit({
				overrides: { 'glow-ring': '#ff0000' }
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

		it('does not emit z-tone vars in per-role mixed mode', () => {
			const preset = presetRokkit({
				tokens: { surface: 'core', primary: 'extended' }
			})
			const css = preset.preflights[0].getCSS()
			// Neither core nor extended roles emit z-tone vars any more.
			expect(css).not.toMatch(/--color-[a-z]+-z\d/)
			// surface (core) → bare alias only
			expect(css).toContain('--color-surface:')
			// primary (extended) → palette vars emitted
			expect(css).toMatch(/--color-primary-500:rgb/)
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

	describe('branch-coverage completions', () => {
		it('typography.ui key emits --font-ui (canonical name, no legacy alias needed)', () => {
			// Exercises the `typography.ui ?? typography.sans` branch when .ui is present
			const preset = presetRokkit({ typography: { ui: 'Geist' } })
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--font-ui:Geist')
		})

		it('typography.display + typography.heading — display wins (heading is skipped via ??)', () => {
			// Exercises the branch where both display and heading are set:
			// `display ?? heading` — the right-hand side (heading) is never evaluated
			// because display is truthy. This hits the "truthy left-hand" branch.
			const preset = presetRokkit({ typography: { display: 'Playfair', heading: 'OldHeading' } })
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--font-display:Playfair')
			// heading should NOT appear because display takes precedence
			expect(css).not.toContain('OldHeading')
		})

		it('checkInkContrast handles missing palette shades gracefully (parseLightness null path)', () => {
			// Sparse palette missing the expected shade keys (100, 300, 700, 900) so
			// parseLightness receives undefined → returns null → diff check is skipped.
			const warnings = []
			const origWarn = console.warn
			console.warn = (msg) => warnings.push(msg)
			try {
				presetRokkit({
					palettes: { sparse: { 500: '0.5 0 0' } },
					colorSpace: 'oklch',
					skins: { default: { surface: 'sparse', ink: 'sparse', primary: 'sparse' } }
				})
			} finally {
				console.warn = origWarn
			}
			// sparse has no shade 100 or 300/700/900 → parseLightness gets undefined →
			// returns null → diff check bails without warning
			expect(warnings.some((w) => /contrast/i.test(w))).toBe(false)
		})

		it('shape.radius as custom object (not a string preset name) injects object values directly', () => {
			// Exercises the `typeof radiusKey === 'string' ? ... : radiusKey` false branch.
			const preset = presetRokkit({ shape: { radius: { sm: '3px', md: '6px', full: '9999px' } } })
			const css = preset.preflights[0].getCSS()
			expect(css).toContain('--radius-sm:3px')
			expect(css).toContain('--radius-md:6px')
		})

		it('override token with non-string, non-object value is not emitted as a shortcut', () => {
			// Exercises the `typeof candidate !== 'string' return false` branch in isOverrideTokenColor.
			// A numeric override value → candidate is a number → not a color string.
			const preset = presetRokkit({ overrides: { 'grid-cols': 12 } })
			const keys = preset.shortcuts.filter((s) => typeof s[0] === 'string').map((s) => s[0])
			expect(keys).not.toContain('bg-grid-cols')
		})

		it('resolveMappingForMode dark mode with only-light dual-palette falls back to light value', () => {
			// Exercises the `value.dark ?? value.light` branch: value.dark is undefined
			// so the ?? takes value.light. Triggered by having a dark block generated for
			// a skin where one role uses only {light}.
			const preset = presetRokkit({
				tokens: 'extended',
				skin: {
					surface: { light: 'slate', dark: 'zinc' },
					primary: { light: 'orange' }   // only-light — dark mode falls back to 'orange'
				}
			})
			const css = preset.preflights[0].getCSS()
			// Both light and dark blocks present; dark block still uses 'orange' palette for primary
			const darkBlock = css.split('[data-mode="dark"]')[1] ?? ''
			expect(darkBlock).toContain('--color-primary-500:')
		})

		it('resolveMappingForMode light mode with only-dark dual-palette falls back to dark value', () => {
			// Exercises the `value.light ?? value.dark ?? null` branch in light mode:
			// value.light is undefined so ?? takes value.dark. Triggered by {dark:'x'} only.
			const preset = presetRokkit({
				tokens: 'extended',
				skin: {
					surface: { light: 'slate', dark: 'zinc' },  // triggers dark block
					primary: { dark: 'amber' }   // only-dark — light mode ?? takes value.dark
				}
			})
			const css = preset.preflights[0].getCSS()
			// Light block uses 'amber' palette for primary (fallback from undefined light)
			const lightBlock = css.split('[data-mode="dark"]')[0]
			expect(lightBlock).toContain('--color-primary-500:')
		})

		// The `?? null` branches at line 76 (branches 8 and 11) require BOTH light and dark
		// to be absent from a dual-palette entry — a configuration error that causes
		// downstream failures, so they are marked /* v8 ignore */ in the source.
	})
})
