import { describe, it, expect } from 'vitest'
import { loadConfig, resolveColormap, DEFAULT_CONFIG } from '../src/config.js'

describe('loadConfig', () => {
	it('should return full defaults when called with no arguments', () => {
		const config = loadConfig()
		expect(config.skin).toEqual(DEFAULT_CONFIG.skin)
		expect(config.skins).toEqual({})
		expect(config.themes).toEqual(['rokkit'])
		expect(config.icons).toEqual({ app: '@rokkit/icons/app.json' })
		expect(config.switcher).toBe('manual')
		expect(config.storageKey).toBe('rokkit-theme')
	})

	it('should merge user skin over defaults', () => {
		const config = loadConfig({ skin: { primary: 'blue', surface: 'zinc' } })
		expect(config.skin.primary).toBe('blue')
		expect(config.skin.surface).toBe('zinc')
		expect(config.skin.secondary).toBe('pink')
		expect(config.skin.accent).toBe('sky')
	})

	it('should accept colors as a backward-compatible alias for skin', () => {
		const config = loadConfig({ colors: { primary: 'blue', surface: 'zinc' } })
		expect(config.skin.primary).toBe('blue')
		expect(config.skin.surface).toBe('zinc')
		expect(config).not.toHaveProperty('colors')
	})

	it('should pass through skins as-is', () => {
		const skins = {
			vibrant: { primary: 'blue', secondary: 'purple' },
			ocean: { primary: 'cyan', surface: 'slate' }
		}
		const config = loadConfig({ skins })
		expect(config.skins).toEqual(skins)
	})

	it('should merge user icons with default app collection', () => {
		const config = loadConfig({ icons: { custom: './icons/custom.json' } })
		expect(config.icons.app).toBe('@rokkit/icons/app.json')
		expect(config.icons.custom).toBe('./icons/custom.json')
	})

	it('should pass through icons.overrides', () => {
		const overrides = { 'folder-open': 'i-phosphor:folder-open', 'node-opened': 'i-app:chevron' }
		const config = loadConfig({ icons: { overrides } })
		expect(config.icons.overrides).toEqual(overrides)
		expect(config.icons.app).toBe('@rokkit/icons/app.json')
	})

	it('should allow overriding the default app icon collection', () => {
		const config = loadConfig({ icons: { app: './my-app-icons.json' } })
		expect(config.icons.app).toBe('./my-app-icons.json')
	})

	it('should accept themes as array of strings', () => {
		const config = loadConfig({ themes: ['rokkit', 'minimal'] })
		expect(config.themes).toEqual(['rokkit', 'minimal'])
	})

	it('should accept switcher values', () => {
		expect(loadConfig({ switcher: 'system' }).switcher).toBe('system')
		expect(loadConfig({ switcher: 'manual' }).switcher).toBe('manual')
		expect(loadConfig({ switcher: 'full' }).switcher).toBe('full')
	})

	it('should accept custom storageKey', () => {
		const config = loadConfig({ storageKey: 'my-theme' })
		expect(config.storageKey).toBe('my-theme')
	})

	it('should ignore unknown fields', () => {
		const config = loadConfig({ unknown: 'value' })
		expect(config).not.toHaveProperty('unknown')
	})

	it('should default palettes to empty object', () => {
		const config = loadConfig()
		expect(config.palettes).toEqual({})
	})

	it('should pass through custom palettes', () => {
		const palettes = { brand: { 500: '#0f4c81', 600: '#0a3a64' } }
		const config = loadConfig({ palettes })
		expect(config.palettes).toEqual(palettes)
	})

	it('should ignore unknown fields but keep palettes', () => {
		const config = loadConfig({ palettes: { brand: { 500: '#fff' } }, unknown: 'x' })
		expect(config.palettes).toEqual({ brand: { 500: '#fff' } })
		expect(config).not.toHaveProperty('unknown')
	})

	it('should pass through dual-palette skin objects ({ light, dark })', () => {
		const config = loadConfig({
			skin: { surface: { light: 'kami', dark: 'sumi' }, primary: 'shu' }
		})
		expect(config.skin.surface).toEqual({ light: 'kami', dark: 'sumi' })
		expect(config.skin.primary).toBe('shu')
	})

	it('should pass through a partial dual-palette object with only light', () => {
		const config = loadConfig({ skin: { surface: { light: 'kami' } } })
		expect(config.skin.surface).toEqual({ light: 'kami' })
	})

	it('should strip darkPalettes as an unknown field', () => {
		const config = loadConfig({ darkPalettes: { kami: { 50: '0.975 0.008 85' } } })
		expect(config).not.toHaveProperty('darkPalettes')
	})
})

describe('resolveColormap', () => {
	it('should return skin when no skins are provided', () => {
		const config = loadConfig({ skin: { primary: 'blue' } })
		const colormap = resolveColormap(config)
		expect(colormap.primary).toBe('blue')
	})

	it('should return skins.default when skins are provided', () => {
		const config = loadConfig({
			skins: { default: { primary: 'violet', surface: 'zinc' }, ocean: { primary: 'sky' } }
		})
		const colormap = resolveColormap(config)
		expect(colormap.primary).toBe('violet')
		expect(colormap.surface).toBe('zinc')
	})

	it('should fall back to skin when skins has no default key', () => {
		const config = loadConfig({
			skin: { primary: 'red' },
			skins: { ocean: { primary: 'sky' } }
		})
		const colormap = resolveColormap(config)
		expect(colormap.primary).toBe('red')
	})

	it('should treat colors alias + skins correctly — skins.default takes precedence', () => {
		const config = loadConfig({
			colors: { primary: 'green' },
			skins: { default: { primary: 'violet' } }
		})
		const colormap = resolveColormap(config)
		expect(colormap.primary).toBe('violet')
	})

	it('skin takes precedence over colors alias when both are provided', () => {
		const config = loadConfig({ skin: { primary: 'blue' }, colors: { primary: 'red' } })
		expect(config.skin.primary).toBe('blue')
	})
})

describe('alias validation', () => {
	it('should detect alias objects in colormap', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					paper: { alias: 'surface' }
				}
			}
		})
		const colormap = resolveColormap(config)
		expect(colormap.paper).toEqual({ alias: 'surface' })
	})

	it('should reject circular aliases', () => {
		expect(() => {
			const config = loadConfig({
				skins: {
					default: {
						surface: { alias: 'paper' },
						paper: { alias: 'surface' },
						primary: 'orange'
					}
				}
			})
			resolveColormap(config)
		}).toThrow(/[Cc]ircular/)
	})

	it('should reject chained aliases', () => {
		expect(() => {
			const config = loadConfig({
				skins: {
					default: {
						surface: 'slate',
						paper: { alias: 'surface' },
						parchment: { alias: 'paper' },
						primary: 'orange'
					}
				}
			})
			resolveColormap(config)
		}).toThrow(/[Cc]hain/)
	})

	it('should reject alias pointing to undefined role', () => {
		expect(() => {
			const config = loadConfig({
				skins: {
					default: {
						surface: 'slate',
						paper: { alias: 'canvas' },
						primary: 'orange'
					}
				}
			})
			resolveColormap(config)
		}).toThrow(/not defined/)
	})

	it('should accept valid forward alias', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					paper: { alias: 'surface' }
				}
			}
		})
		expect(resolveColormap(config).paper).toEqual({ alias: 'surface' })
	})

	it('should accept custom roles as plain strings', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					canvas: 'stone',
					annotation: 'amber'
				}
			}
		})
		const colormap = resolveColormap(config)
		expect(colormap.canvas).toBe('stone')
		expect(colormap.annotation).toBe('amber')
	})
})

describe('loadConfig — shape and typography', () => {
	it('should default typography to all nulls', () => {
		const config = loadConfig()
		expect(config.typography).toEqual({ sans: null, mono: null, heading: null })
	})

	it('should merge partial typography overrides', () => {
		const config = loadConfig({ typography: { sans: "'Inter', system-ui, sans-serif" } })
		expect(config.typography.sans).toBe("'Inter', system-ui, sans-serif")
		expect(config.typography.mono).toBeNull()
		expect(config.typography.heading).toBeNull()
	})

	it('should default shape to null radius', () => {
		const config = loadConfig()
		expect(config.shape).toEqual({ radius: null })
	})

	it('should accept shape radius preset name', () => {
		const config = loadConfig({ shape: { radius: 'sharp' } })
		expect(config.shape.radius).toBe('sharp')
	})

	it('should accept shape radius as custom object', () => {
		const custom = { sm: '2px', md: '4px', lg: '8px', xl: '12px', full: '9999px' }
		const config = loadConfig({ shape: { radius: custom } })
		expect(config.shape.radius).toEqual(custom)
	})
})

describe('loadConfig — tokens mode', () => {
	it('defaults tokens to "core"', () => {
		const config = loadConfig()
		expect(config.tokens).toBe('core')
	})

	it('accepts tokens: "extended"', () => {
		const config = loadConfig({ tokens: 'extended' })
		expect(config.tokens).toBe('extended')
	})

	it('accepts per-role object: { surface: "core", primary: "extended" }', () => {
		const config = loadConfig({ tokens: { surface: 'core', primary: 'extended' } })
		expect(config.tokens).toEqual({ surface: 'core', primary: 'extended' })
	})

	it('throws on invalid tokens value (bogus string)', () => {
		expect(() => loadConfig({ tokens: 'bogus' })).toThrow(/tokens/)
	})

	it('throws on per-role object with invalid mode', () => {
		expect(() => loadConfig({ tokens: { surface: 'unknown' } })).toThrow(/tokens/)
	})

	it('throws on non-string non-object tokens value', () => {
		expect(() => loadConfig({ tokens: 42 })).toThrow(/tokens/)
	})
})

describe('loadConfig — custom tokens (placeholder field)', () => {
	it('defaults custom to {}', () => {
		const config = loadConfig()
		expect(config.custom).toEqual({})
	})

	it('passes through custom as-is', () => {
		const config = loadConfig({ custom: { canvas: 'kami.50', 'canvas-grid': '#d4d4d4' } })
		expect(config.custom).toEqual({ canvas: 'kami.50', 'canvas-grid': '#d4d4d4' })
	})
})

import { resolveTokenMode } from '../src/config.js'

describe('resolveTokenMode', () => {
	it('returns the global mode for any role when tokens is a string', () => {
		const config = { tokens: 'extended' }
		expect(resolveTokenMode(config, 'surface')).toBe('extended')
		expect(resolveTokenMode(config, 'primary')).toBe('extended')
	})

	it('returns per-role mode when tokens is an object', () => {
		const config = { tokens: { surface: 'extended', primary: 'core' } }
		expect(resolveTokenMode(config, 'surface')).toBe('extended')
		expect(resolveTokenMode(config, 'primary')).toBe('core')
	})

	it('defaults to "core" when a role is missing from per-role object', () => {
		const config = { tokens: { surface: 'extended' } }
		expect(resolveTokenMode(config, 'primary')).toBe('core')
	})

	it('defaults to "core" when config.tokens is missing entirely', () => {
		expect(resolveTokenMode({}, 'surface')).toBe('core')
	})
})
