import { describe, it, expect } from 'vitest'
import { loadConfig, resolveColormap } from '../src/config.js'
import {
	withoutAliases,
	resolveMappingForMode,
	themeFor,
	rootPreflights,
	skinPreflights,
	themeColors
} from '../src/colors.js'

const configOf = (user) => {
	const config = loadConfig(user)
	return { config, colormap: resolveColormap(config) }
}

describe('withoutAliases', () => {
	it('drops the roles that alias another', () => {
		expect(withoutAliases({ primary: 'sky', accent: { alias: 'primary' }, surface: { light: 'a', dark: 'b' } })).toEqual({
			primary: 'sky',
			surface: { light: 'a', dark: 'b' }
		})
	})
})

describe('resolveMappingForMode', () => {
	it('takes the matching side of a dual palette, falling back to the other', () => {
		const map = { a: { light: 'l', dark: 'd' }, b: { dark: 'd' }, c: { light: 'l' }, d: 'plain' }
		expect(resolveMappingForMode(map, 'light')).toEqual({ a: 'l', b: 'd', c: 'l', d: 'plain' })
		expect(resolveMappingForMode(map, 'dark')).toEqual({ a: 'd', b: 'd', c: 'l', d: 'plain' })
	})
})

describe('themeFor', () => {
	it('builds a Theme for one mode over the non-alias roles', () => {
		const { config } = configOf({})
		const theme = themeFor({ primary: { light: 'sky', dark: 'rose' }, accent: { alias: 'primary' } }, config, 'dark')
		expect(theme.mapping).toMatchObject({ primary: 'rose' })
		// The alias never reaches Theme as a mapping (Theme fills unmapped roles from its defaults).
		expect(typeof theme.mapping.accent).toBe('string')
	})
})

describe('rootPreflights', () => {
	const css = (user, extra = []) => {
		const { config, colormap } = configOf(user)
		return rootPreflights(themeFor(colormap, config, 'light'), colormap, config, extra)[0].getCSS()
	}

	it('is the :root light block, then the extra vars, with no dark block for single palettes', () => {
		const out = css({ skin: { primary: 'sky' } }, ['--font-mono:M'])
		expect(out.startsWith(':root, [data-mode="light"]{')).toBe(true)
		expect(out).toContain(':root{--font-mono:M}')
		expect(out).not.toContain('[data-mode="dark"]')
	})

	it('adds a dark block for a dual-palette role or a dark override', () => {
		expect(css({ skin: { surface: { light: 'slate', dark: 'zinc' } } })).toContain('[data-mode="dark"]{')
		expect(css({ overrides: { shade: { dark: '#000000' } } })).toContain('[data-mode="dark"]{--')
	})

	it('omits the extra :root block when there are no extra vars', () => {
		expect(css({ skin: { primary: 'sky' } }, [])).not.toContain(':root{')
	})
})

describe('skinPreflights', () => {
	it('emits a block per named skin but never the default, and a dark block only for a dual palette', () => {
		const { config } = configOf({
			skins: { default: { primary: 'sky' }, flat: { primary: 'rose' }, dual: { surface: { light: 'slate', dark: 'zinc' } } }
		})
		const blocks = skinPreflights(config).map((b) => b.getCSS())
		expect(blocks.some((b) => b.includes("[data-skin='default']"))).toBe(false)
		const flat = blocks.find((b) => b.startsWith("[data-skin='flat']"))
		const dual = blocks.find((b) => b.startsWith("[data-skin='dual']"))
		expect(flat).not.toContain("[data-mode='dark']")
		expect(dual).toContain("[data-mode='dark'][data-skin='dual']{")
	})
})

describe('themeColors', () => {
	it('gives an alias role colour rules pointing at its target', () => {
		const { config, colormap } = configOf({ skin: { primary: 'sky', accent: { alias: 'primary' } } })
		const colors = themeColors(themeFor(colormap, config, 'light'), colormap, config)
		expect(colors.accent).toBeDefined()
		expect(JSON.stringify(colors.accent)).toContain('primary')
	})
})
