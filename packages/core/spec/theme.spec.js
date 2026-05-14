import { describe, it, expect } from 'vitest'
import { shadesOf, themeRules, semanticShortcuts, Theme } from '../src/theme'
import { INVERTED_ROLES } from '../src/constants'

const palettes = ['primary', 'secondary', 'other']

describe('Theme class', () => {
	it('should include tertiary in default mapping', () => {
		const theme = new Theme()
		expect(theme.mapping).toHaveProperty('tertiary')
	})

	it('should include ink in default mapping', () => {
		const theme = new Theme()
		expect(theme.mapping).toHaveProperty('ink')
	})

	it('should fallback ink to surface palette when not explicitly set', () => {
		const theme = new Theme()
		expect(theme.mapping.ink).toBe('slate')
		expect(theme.mapping.surface).toBe('slate')
	})

	it('should generate tertiary palette rules', () => {
		const theme = new Theme()
		const palette = theme.getPalette()
		expect(palette).toHaveProperty('--color-tertiary')
		expect(palette).toHaveProperty('--color-tertiary-500')
	})

	it('should generate tertiary semantic shortcuts', () => {
		const theme = new Theme()
		const shortcuts = theme.getShortcuts('tertiary')
		expect(shortcuts.length).toBeGreaterThan(0)
	})

	it('should set and get colors using public API only', () => {
		const theme = new Theme()
		const colors = { primary: { 500: 'rgb(1,2,3)' }, secondary: { 500: 'rgb(4,5,6)' } }
		theme.colors = colors
		expect(theme.colors.primary[500]).toBe('rgb(1,2,3)')
		expect(theme.colors.secondary[500]).toBe('rgb(4,5,6)')
	})

	it('should set and get mapping using public API only', () => {
		const theme = new Theme()
		const mapping = { primary: 'red', secondary: 'blue' }
		theme.mapping = mapping
		expect(theme.mapping.primary).toBe('red')
		expect(theme.mapping.secondary).toBe('blue')
	})

	it('should get palette with default and custom mapping', () => {
		const theme = new Theme()
		const paletteDefault = theme.getPalette()
		expect(typeof paletteDefault).toBe('object')
		expect(Object.keys(paletteDefault).length).toBeGreaterThan(0)

		const customMapping = { primary: 'red', secondary: 'blue' }
		const paletteCustom = theme.getPalette(customMapping)
		expect(typeof paletteCustom).toBe('object')
		expect(Object.keys(paletteCustom).length).toBeGreaterThan(0)
		expect(paletteCustom['--color-accent']).toEqual('rgb(56, 189, 248)')
	})

	it('should get semantic shortcuts', () => {
		const theme = new Theme()
		const shortcuts = theme.getShortcuts('secondary')
		expect(Array.isArray(shortcuts)).toBe(true)
		expect(shortcuts.length).toBeGreaterThan(0)
	})

	it('should get colors using shadesOf', () => {
		const theme = new Theme()
		const colors = theme.getColorRules()
		expect(colors).toHaveProperty('primary')
		expect(colors.primary).toHaveProperty('500')
		expect(colors).toHaveProperty('secondary')
		expect(colors.secondary).toHaveProperty('500')
		expect(colors.primary).toEqual({
			1: 'color-mix(in srgb, var(--color-primary-1) calc(<alpha-value> * 100%), transparent)',
			100: 'color-mix(in srgb, var(--color-primary-100) calc(<alpha-value> * 100%), transparent)',
			2: 'color-mix(in srgb, var(--color-primary-2) calc(<alpha-value> * 100%), transparent)',
			200: 'color-mix(in srgb, var(--color-primary-200) calc(<alpha-value> * 100%), transparent)',
			3: 'color-mix(in srgb, var(--color-primary-3) calc(<alpha-value> * 100%), transparent)',
			300: 'color-mix(in srgb, var(--color-primary-300) calc(<alpha-value> * 100%), transparent)',
			4: 'color-mix(in srgb, var(--color-primary-4) calc(<alpha-value> * 100%), transparent)',
			400: 'color-mix(in srgb, var(--color-primary-400) calc(<alpha-value> * 100%), transparent)',
			5: 'color-mix(in srgb, var(--color-primary-5) calc(<alpha-value> * 100%), transparent)',
			50: 'color-mix(in srgb, var(--color-primary-50) calc(<alpha-value> * 100%), transparent)',
			500: 'color-mix(in srgb, var(--color-primary-500) calc(<alpha-value> * 100%), transparent)',
			6: 'color-mix(in srgb, var(--color-primary-6) calc(<alpha-value> * 100%), transparent)',
			600: 'color-mix(in srgb, var(--color-primary-600) calc(<alpha-value> * 100%), transparent)',
			7: 'color-mix(in srgb, var(--color-primary-7) calc(<alpha-value> * 100%), transparent)',
			700: 'color-mix(in srgb, var(--color-primary-700) calc(<alpha-value> * 100%), transparent)',
			8: 'color-mix(in srgb, var(--color-primary-8) calc(<alpha-value> * 100%), transparent)',
			800: 'color-mix(in srgb, var(--color-primary-800) calc(<alpha-value> * 100%), transparent)',
			9: 'color-mix(in srgb, var(--color-primary-9) calc(<alpha-value> * 100%), transparent)',
			900: 'color-mix(in srgb, var(--color-primary-900) calc(<alpha-value> * 100%), transparent)',
			950: 'color-mix(in srgb, var(--color-primary-950) calc(<alpha-value> * 100%), transparent)',
			DEFAULT: 'color-mix(in srgb, var(--color-primary) calc(<alpha-value> * 100%), transparent)'
		})
	})
})

describe('Theme with colorSpace', () => {
	it('should default to rgb color space', () => {
		const theme = new Theme()
		expect(theme.colorSpace).toBe('rgb')
	})

	it('should accept oklch color space', () => {
		const theme = new Theme({ colorSpace: 'oklch' })
		expect(theme.colorSpace).toBe('oklch')
	})

	it('should produce oklch-wrapped color rules', () => {
		const theme = new Theme({ colorSpace: 'oklch' })
		const colors = theme.getColorRules()
		expect(colors.primary.DEFAULT).toBe('color-mix(in oklch, var(--color-primary) calc(<alpha-value> * 100%), transparent)')
		expect(colors.primary[500]).toBe('color-mix(in oklch, var(--color-primary-500) calc(<alpha-value> * 100%), transparent)')
	})

	it('should produce hsl-wrapped color rules', () => {
		const theme = new Theme({ colorSpace: 'hsl' })
		const colors = theme.getColorRules()
		expect(colors.primary.DEFAULT).toBe('color-mix(in srgb, var(--color-primary) calc(<alpha-value> * 100%), transparent)')
		expect(colors.primary[500]).toBe('color-mix(in srgb, var(--color-primary-500) calc(<alpha-value> * 100%), transparent)')
	})

	it('should produce oklch palette values', () => {
		const theme = new Theme({ colorSpace: 'oklch' })
		const palette = theme.getPalette()
		// OKLCH values are wrapped: "oklch(L C H)"
		const val = palette['--color-primary-500']
		expect(val).toMatch(/^oklch\(/)
		const inner = val.replace(/^oklch\(/, '').replace(/\)$/, '')
		expect(inner.split(' ')).toHaveLength(3)
	})

	it('should produce hsl palette values', () => {
		const theme = new Theme({ colorSpace: 'hsl' })
		const palette = theme.getPalette()
		// HSL values are wrapped: "hsl(H S% L%)"
		const val = palette['--color-primary-500']
		expect(val).toMatch(/^hsl\(/)
		const inner = val.replace(/^hsl\(/, '').replace(/\)$/, '')
		expect(inner).toMatch(/%/)
		expect(inner.split(' ')).toHaveLength(3)
	})

	it('should allow changing colorSpace after construction', () => {
		const theme = new Theme()
		expect(theme.colorSpace).toBe('rgb')
		theme.colorSpace = 'oklch'
		expect(theme.colorSpace).toBe('oklch')
		const colors = theme.getColorRules()
		expect(colors.primary.DEFAULT).toBe('color-mix(in oklch, var(--color-primary) calc(<alpha-value> * 100%), transparent)')
	})
})

describe('shadesOf', () => {
	it.each(palettes)('should generate shades using rgb space', (name) => {
		const result = shadesOf(name, 'rgb')
		expect(result).toEqual({
			50: `color-mix(in srgb, var(--color-${name}-50) calc(<alpha-value> * 100%), transparent)`,
			100: `color-mix(in srgb, var(--color-${name}-100) calc(<alpha-value> * 100%), transparent)`,
			200: `color-mix(in srgb, var(--color-${name}-200) calc(<alpha-value> * 100%), transparent)`,
			300: `color-mix(in srgb, var(--color-${name}-300) calc(<alpha-value> * 100%), transparent)`,
			400: `color-mix(in srgb, var(--color-${name}-400) calc(<alpha-value> * 100%), transparent)`,
			500: `color-mix(in srgb, var(--color-${name}-500) calc(<alpha-value> * 100%), transparent)`,
			600: `color-mix(in srgb, var(--color-${name}-600) calc(<alpha-value> * 100%), transparent)`,
			700: `color-mix(in srgb, var(--color-${name}-700) calc(<alpha-value> * 100%), transparent)`,
			800: `color-mix(in srgb, var(--color-${name}-800) calc(<alpha-value> * 100%), transparent)`,
			900: `color-mix(in srgb, var(--color-${name}-900) calc(<alpha-value> * 100%), transparent)`,
			950: `color-mix(in srgb, var(--color-${name}-950) calc(<alpha-value> * 100%), transparent)`,
			DEFAULT: `color-mix(in srgb, var(--color-${name}-500) calc(<alpha-value> * 100%), transparent)`
		})
	})

	it.each(palettes)('should generate shades using hsl space', (name) => {
		const result = shadesOf(name, 'hsl')
		expect(result).toEqual({
			50: `color-mix(in srgb, var(--color-${name}-50) calc(<alpha-value> * 100%), transparent)`,
			100: `color-mix(in srgb, var(--color-${name}-100) calc(<alpha-value> * 100%), transparent)`,
			200: `color-mix(in srgb, var(--color-${name}-200) calc(<alpha-value> * 100%), transparent)`,
			300: `color-mix(in srgb, var(--color-${name}-300) calc(<alpha-value> * 100%), transparent)`,
			400: `color-mix(in srgb, var(--color-${name}-400) calc(<alpha-value> * 100%), transparent)`,
			500: `color-mix(in srgb, var(--color-${name}-500) calc(<alpha-value> * 100%), transparent)`,
			600: `color-mix(in srgb, var(--color-${name}-600) calc(<alpha-value> * 100%), transparent)`,
			700: `color-mix(in srgb, var(--color-${name}-700) calc(<alpha-value> * 100%), transparent)`,
			800: `color-mix(in srgb, var(--color-${name}-800) calc(<alpha-value> * 100%), transparent)`,
			900: `color-mix(in srgb, var(--color-${name}-900) calc(<alpha-value> * 100%), transparent)`,
			950: `color-mix(in srgb, var(--color-${name}-950) calc(<alpha-value> * 100%), transparent)`,
			DEFAULT: `color-mix(in srgb, var(--color-${name}-500) calc(<alpha-value> * 100%), transparent)`
		})
	})

	it.each(palettes)('should generate shades using oklch space', (name) => {
		const result = shadesOf(name, 'oklch')
		expect(result).toEqual({
			50: `color-mix(in oklch, var(--color-${name}-50) calc(<alpha-value> * 100%), transparent)`,
			100: `color-mix(in oklch, var(--color-${name}-100) calc(<alpha-value> * 100%), transparent)`,
			200: `color-mix(in oklch, var(--color-${name}-200) calc(<alpha-value> * 100%), transparent)`,
			300: `color-mix(in oklch, var(--color-${name}-300) calc(<alpha-value> * 100%), transparent)`,
			400: `color-mix(in oklch, var(--color-${name}-400) calc(<alpha-value> * 100%), transparent)`,
			500: `color-mix(in oklch, var(--color-${name}-500) calc(<alpha-value> * 100%), transparent)`,
			600: `color-mix(in oklch, var(--color-${name}-600) calc(<alpha-value> * 100%), transparent)`,
			700: `color-mix(in oklch, var(--color-${name}-700) calc(<alpha-value> * 100%), transparent)`,
			800: `color-mix(in oklch, var(--color-${name}-800) calc(<alpha-value> * 100%), transparent)`,
			900: `color-mix(in oklch, var(--color-${name}-900) calc(<alpha-value> * 100%), transparent)`,
			950: `color-mix(in oklch, var(--color-${name}-950) calc(<alpha-value> * 100%), transparent)`,
			DEFAULT: `color-mix(in oklch, var(--color-${name}-500) calc(<alpha-value> * 100%), transparent)`
		})
	})

	it('should default to rgb when no space is specified', (name) => {
		const result = shadesOf('primary')
		expect(result.DEFAULT).toBe('color-mix(in srgb, var(--color-primary-500) calc(<alpha-value> * 100%), transparent)')
		expect(result[50]).toBe('color-mix(in srgb, var(--color-primary-50) calc(<alpha-value> * 100%), transparent)')
	})

	it('should throw for invalid color space', () => {
		expect(() => shadesOf('primary', 'invalid')).toThrow('Unknown color space: invalid')
	})
})

describe('themeRules', () => {
	const paletteRules = {
		'--color-accent': 'rgb(56, 189, 248)',
		'--color-accent-100': 'rgb(224, 242, 254)',
		'--color-accent-200': 'rgb(186, 230, 253)',
		'--color-accent-300': 'rgb(125, 211, 252)',
		'--color-accent-400': 'rgb(56, 189, 248)',
		'--color-accent-50': 'rgb(240, 249, 255)',
		'--color-accent-500': 'rgb(14, 165, 233)',
		'--color-accent-600': 'rgb(2, 132, 199)',
		'--color-accent-700': 'rgb(3, 105, 161)',
		'--color-accent-800': 'rgb(7, 89, 133)',
		'--color-accent-900': 'rgb(12, 74, 110)',
		'--color-accent-950': 'rgb(8, 47, 73)',
		'--color-danger': 'rgb(248, 113, 113)',
		'--color-danger-100': 'rgb(254, 226, 226)',
		'--color-danger-200': 'rgb(254, 202, 202)',
		'--color-danger-300': 'rgb(252, 165, 165)',
		'--color-danger-400': 'rgb(248, 113, 113)',
		'--color-danger-50': 'rgb(254, 242, 242)',
		'--color-danger-500': 'rgb(239, 68, 68)',
		'--color-danger-600': 'rgb(220, 38, 38)',
		'--color-danger-700': 'rgb(185, 28, 28)',
		'--color-danger-800': 'rgb(153, 27, 27)',
		'--color-danger-900': 'rgb(127, 29, 29)',
		'--color-danger-950': 'rgb(69, 10, 10)',
		'--color-error': 'rgb(248, 113, 113)',
		'--color-error-100': 'rgb(254, 226, 226)',
		'--color-error-200': 'rgb(254, 202, 202)',
		'--color-error-300': 'rgb(252, 165, 165)',
		'--color-error-400': 'rgb(248, 113, 113)',
		'--color-error-50': 'rgb(254, 242, 242)',
		'--color-error-500': 'rgb(239, 68, 68)',
		'--color-error-600': 'rgb(220, 38, 38)',
		'--color-error-700': 'rgb(185, 28, 28)',
		'--color-error-800': 'rgb(153, 27, 27)',
		'--color-error-900': 'rgb(127, 29, 29)',
		'--color-error-950': 'rgb(69, 10, 10)',
		'--color-info': 'rgb(34, 211, 238)',
		'--color-info-100': 'rgb(207, 250, 254)',
		'--color-info-200': 'rgb(165, 243, 252)',
		'--color-info-300': 'rgb(103, 232, 249)',
		'--color-info-400': 'rgb(34, 211, 238)',
		'--color-info-50': 'rgb(236, 254, 255)',
		'--color-info-500': 'rgb(6, 182, 212)',
		'--color-info-600': 'rgb(8, 145, 178)',
		'--color-info-700': 'rgb(14, 116, 144)',
		'--color-info-800': 'rgb(21, 94, 117)',
		'--color-info-900': 'rgb(22, 78, 99)',
		'--color-info-950': 'rgb(8, 51, 68)',
		'--color-ink': 'rgb(148, 163, 184)',
		'--color-ink-100': 'rgb(241, 245, 249)',
		'--color-ink-200': 'rgb(226, 232, 240)',
		'--color-ink-300': 'rgb(203, 213, 225)',
		'--color-ink-400': 'rgb(148, 163, 184)',
		'--color-ink-50': 'rgb(248, 250, 252)',
		'--color-ink-500': 'rgb(100, 116, 139)',
		'--color-ink-600': 'rgb(71, 85, 105)',
		'--color-ink-700': 'rgb(51, 65, 85)',
		'--color-ink-800': 'rgb(30, 41, 59)',
		'--color-ink-900': 'rgb(15, 23, 42)',
		'--color-ink-950': 'rgb(2, 6, 23)',
		'--color-primary': 'rgb(251, 146, 60)',
		'--color-primary-100': 'rgb(255, 237, 213)',
		'--color-primary-200': 'rgb(254, 215, 170)',
		'--color-primary-300': 'rgb(253, 186, 116)',
		'--color-primary-400': 'rgb(251, 146, 60)',
		'--color-primary-50': 'rgb(255, 247, 237)',
		'--color-primary-500': 'rgb(249, 115, 22)',
		'--color-primary-600': 'rgb(234, 88, 12)',
		'--color-primary-700': 'rgb(194, 65, 12)',
		'--color-primary-800': 'rgb(154, 52, 18)',
		'--color-primary-900': 'rgb(124, 45, 18)',
		'--color-primary-950': 'rgb(67, 20, 7)',
		'--color-secondary': 'rgb(244, 114, 182)',
		'--color-secondary-100': 'rgb(252, 231, 243)',
		'--color-secondary-200': 'rgb(251, 207, 232)',
		'--color-secondary-300': 'rgb(249, 168, 212)',
		'--color-secondary-400': 'rgb(244, 114, 182)',
		'--color-secondary-50': 'rgb(253, 242, 248)',
		'--color-secondary-500': 'rgb(236, 72, 153)',
		'--color-secondary-600': 'rgb(219, 39, 119)',
		'--color-secondary-700': 'rgb(190, 24, 93)',
		'--color-secondary-800': 'rgb(157, 23, 77)',
		'--color-secondary-900': 'rgb(131, 24, 67)',
		'--color-secondary-950': 'rgb(80, 7, 36)',
		'--color-success': 'rgb(74, 222, 128)',
		'--color-success-100': 'rgb(220, 252, 231)',
		'--color-success-200': 'rgb(187, 247, 208)',
		'--color-success-300': 'rgb(134, 239, 172)',
		'--color-success-400': 'rgb(74, 222, 128)',
		'--color-success-50': 'rgb(240, 253, 244)',
		'--color-success-500': 'rgb(34, 197, 94)',
		'--color-success-600': 'rgb(22, 163, 74)',
		'--color-success-700': 'rgb(21, 128, 61)',
		'--color-success-800': 'rgb(22, 101, 52)',
		'--color-success-900': 'rgb(20, 83, 45)',
		'--color-success-950': 'rgb(5, 46, 22)',
		'--color-surface': 'rgb(148, 163, 184)',
		'--color-surface-100': 'rgb(241, 245, 249)',
		'--color-surface-200': 'rgb(226, 232, 240)',
		'--color-surface-300': 'rgb(203, 213, 225)',
		'--color-surface-400': 'rgb(148, 163, 184)',
		'--color-surface-50': 'rgb(248, 250, 252)',
		'--color-surface-500': 'rgb(100, 116, 139)',
		'--color-surface-600': 'rgb(71, 85, 105)',
		'--color-surface-700': 'rgb(51, 65, 85)',
		'--color-surface-800': 'rgb(30, 41, 59)',
		'--color-surface-900': 'rgb(15, 23, 42)',
		'--color-surface-950': 'rgb(2, 6, 23)',
		'--color-tertiary': 'rgb(167, 139, 250)',
		'--color-tertiary-100': 'rgb(237, 233, 254)',
		'--color-tertiary-200': 'rgb(221, 214, 254)',
		'--color-tertiary-300': 'rgb(196, 181, 253)',
		'--color-tertiary-400': 'rgb(167, 139, 250)',
		'--color-tertiary-50': 'rgb(245, 243, 255)',
		'--color-tertiary-500': 'rgb(139, 92, 246)',
		'--color-tertiary-600': 'rgb(124, 58, 237)',
		'--color-tertiary-700': 'rgb(109, 40, 217)',
		'--color-tertiary-800': 'rgb(91, 33, 182)',
		'--color-tertiary-900': 'rgb(76, 29, 149)',
		'--color-tertiary-950': 'rgb(46, 16, 101)',
		'--color-warning': 'rgb(250, 204, 21)',
		'--color-warning-100': 'rgb(254, 249, 195)',
		'--color-warning-200': 'rgb(254, 240, 138)',
		'--color-warning-300': 'rgb(253, 224, 71)',
		'--color-warning-400': 'rgb(250, 204, 21)',
		'--color-warning-50': 'rgb(254, 252, 232)',
		'--color-warning-500': 'rgb(234, 179, 8)',
		'--color-warning-600': 'rgb(202, 138, 4)',
		'--color-warning-700': 'rgb(161, 98, 7)',
		'--color-warning-800': 'rgb(133, 77, 14)',
		'--color-warning-900': 'rgb(113, 63, 18)',
		'--color-warning-950': 'rgb(66, 32, 6)'
	}

	it('should generate theme rules', () => {
		const result = themeRules()
		expect(result).toEqual(paletteRules)
	})

	it('should generate theme rules with alternative mapping', () => {
		const result = themeRules({ surface: 'zinc' })
		const zincLight = {
			...paletteRules,
			'--color-surface': 'rgb(161, 161, 170)',
			'--color-surface-100': 'rgb(244, 244, 245)',
			'--color-surface-200': 'rgb(228, 228, 231)',
			'--color-surface-300': 'rgb(212, 212, 216)',
			'--color-surface-400': 'rgb(161, 161, 170)',
			'--color-surface-50': 'rgb(250, 250, 250)',
			'--color-surface-500': 'rgb(113, 113, 122)',
			'--color-surface-600': 'rgb(82, 82, 91)',
			'--color-surface-700': 'rgb(63, 63, 70)',
			'--color-surface-800': 'rgb(39, 39, 42)',
			'--color-surface-900': 'rgb(24, 24, 27)',
			'--color-surface-950': 'rgb(9, 9, 11)'
		}

		expect(result).toEqual(zincLight)
	})
})

describe('resolveColors — nullable fallback chain', () => {
  it('should resolve null tertiary to primary palette', () => {
    const theme = new Theme({ mapping: { tertiary: null } })
    const palette = theme.getPalette()
    expect(palette['--color-tertiary-500']).toBe(palette['--color-primary-500'])
  })

  it('should resolve null secondary to primary palette', () => {
    const theme = new Theme({ mapping: { secondary: null } })
    const palette = theme.getPalette()
    expect(palette['--color-secondary-500']).toBe(palette['--color-primary-500'])
  })

  it('should resolve null accent to primary palette', () => {
    const theme = new Theme({ mapping: { accent: null } })
    const palette = theme.getPalette()
    expect(palette['--color-accent-500']).toBe(palette['--color-primary-500'])
  })

  it('should resolve null error to danger palette', () => {
    const theme = new Theme({ mapping: { error: null } })
    const palette = theme.getPalette()
    expect(palette['--color-error-500']).toBe(palette['--color-danger-500'])
  })

  it('should not resolve explicitly set colors', () => {
    const theme = new Theme({ mapping: { tertiary: 'teal' } })
    const palette = theme.getPalette()
    expect(palette['--color-tertiary-500']).not.toBe(palette['--color-primary-500'])
  })
})

describe('getZScaleCSS — inverted roles', () => {
	it('should generate inverted z-scale for ink (z1 light → shade 900)', () => {
		const theme = new Theme()
		const css = theme.getZScaleCSS()
		// Normal: surface z1 → 100 in light
		expect(css).toContain('--color-surface-z1: var(--color-surface-100);')
		// Inverted: ink z1 → 900 in light (1000 - 100 = 900)
		expect(css).toContain('--color-ink-z1: var(--color-ink-900);')
	})

	it('should generate inverted dark z-scale for ink (z1 dark → shade 100)', () => {
		const theme = new Theme()
		const css = theme.getZScaleCSS()
		// In the dark block: normal surface z1 → 900
		// In the dark block: inverted ink z1 → 100
		const darkBlock = css.split('[data-mode="dark"]')[1]
		expect(darkBlock).toContain('--color-ink-z1: var(--color-ink-100);')
		expect(darkBlock).toContain('--color-surface-z1: var(--color-surface-900);')
	})

	it('should keep z5 identical for both surface and ink (midpoint)', () => {
		const theme = new Theme()
		const css = theme.getZScaleCSS()
		expect(css).toContain('--color-surface-z5: var(--color-surface-500);')
		expect(css).toContain('--color-ink-z5: var(--color-ink-500);')
	})
})

describe('semanticShortcuts', () => {
	it('should generate shortcuts for secondary color', () => {
		const shortcuts = semanticShortcuts('secondary')
		expect(shortcuts.length).toBe(11 * 3 * 14)
		expect(shortcuts[0]).toEqual([/^(.+):bg-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[1]).toEqual([/^bg-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[2]).toEqual(['bg-secondary-z0', 'bg-secondary-50 dark:bg-secondary-950'])
		expect(shortcuts[3]).toEqual([/^(.+):border-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[4]).toEqual([/^border-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[5]).toEqual([
			'border-secondary-z0',
			'border-secondary-50 dark:border-secondary-950'
		])
		// border-l at index 6-8
		expect(shortcuts[6]).toEqual([/^(.+):border-l-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[7]).toEqual([/^border-l-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[8]).toEqual([
			'border-l-secondary-z0',
			'border-l-secondary-50 dark:border-l-secondary-950'
		])
		// text at index 18-20
		expect(shortcuts[18]).toEqual([/^(.+):text-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[19]).toEqual([/^text-secondary-z0(\/\d+)?$/, expect.any(Function)])
		expect(shortcuts[20]).toEqual([
			'text-secondary-z0',
			'text-secondary-50 dark:text-secondary-950'
		])
	})

	it('should execute variant pattern callback function (line 85)', () => {
		const shortcuts = semanticShortcuts('primary')

		// Find the variant pattern shortcut (first regex shortcut)
		const variantShortcut = shortcuts.find(
			([pattern]) => pattern instanceof RegExp && pattern.source.includes('(.+)')
		)

		expect(variantShortcut).toBeDefined()
		const [, callback] = variantShortcut

		// Test the callback function with matched groups
		const result = callback(['hover:bg-primary-z0', 'hover', undefined])
		expect(result).toBe('hover:bg-primary-50 hover:dark:bg-primary-950')

		// Test with opacity
		const resultWithOpacity = callback(['hover:bg-primary-z0/50', 'hover', '/50'])
		expect(resultWithOpacity).toBe('hover:bg-primary-50/50 hover:dark:bg-primary-950/50')
	})

	it('should execute opacity pattern callback function (line 92)', () => {
		const shortcuts = semanticShortcuts('primary')

		// Find the opacity pattern shortcut (second regex shortcut without variant group)
		const opacityShortcut = shortcuts.find(
			([pattern]) =>
				pattern instanceof RegExp &&
				!pattern.source.includes('(.+)') &&
				pattern.source.includes('(\\/')
		)

		expect(opacityShortcut).toBeDefined()
		const [, callback] = opacityShortcut

		// Test the callback function
		const result = callback(['bg-primary-z0', undefined])
		expect(result).toBe('bg-primary-50 dark:bg-primary-950')

		// Test with opacity
		const resultWithOpacity = callback(['bg-primary-z0/75', '/75'])
		expect(resultWithOpacity).toBe('bg-primary-50/75 dark:bg-primary-950/75')
	})

	it('should invert light/dark for ink (INVERTED_ROLES)', () => {
		const shortcuts = semanticShortcuts('ink')
		// ink z1: light should be 900 (inverted from 100), dark should be 100
		const z1Text = shortcuts.find(s => typeof s[0] === 'string' && s[0] === 'text-ink-z1')
		expect(z1Text[1]).toBe('text-ink-900 dark:text-ink-100')

		// ink z0: light should be 950 (inverted from 50), dark should be 50
		const z0Bg = shortcuts.find(s => typeof s[0] === 'string' && s[0] === 'bg-ink-z0')
		expect(z0Bg[1]).toBe('bg-ink-950 dark:bg-ink-50')

		// ink z5: midpoint stays 500 (1000-500=500)
		const z5Text = shortcuts.find(s => typeof s[0] === 'string' && s[0] === 'text-ink-z5')
		expect(z5Text[1]).toBe('text-ink-500 dark:text-ink-500')
	})

	it('should NOT invert for normal roles like surface', () => {
		const shortcuts = semanticShortcuts('surface')
		const z1Text = shortcuts.find(s => typeof s[0] === 'string' && s[0] === 'text-surface-z1')
		expect(z1Text[1]).toBe('text-surface-100 dark:text-surface-900')
	})
})
