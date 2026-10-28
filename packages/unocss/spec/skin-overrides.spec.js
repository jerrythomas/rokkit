import { describe, it, expect } from 'vitest'
import { presetRokkit } from '../src/preset.js'
import { loadConfig, resolveColormap } from '../src/config.js'

/**
 * A skin may carry its own `overrides` — named token → palette ref (or `{ light, dark }`) — so a
 * skin can choose the shade behind a token per mode (status text reads at a darker shade on
 * light paper and a lighter one on dark paper). The block is the skin's, not a role: it applies
 * wherever that skin applies (`:root` for the default skin, `[data-skin='x']` for the others).
 */
const grey = (light, dark) => ({
	50: light,
	100: light,
	200: light,
	300: light,
	400: light,
	500: light,
	600: dark,
	700: dark,
	800: dark,
	900: dark,
	950: dark
})
const palettes = {
	day: grey('#ffffff', '#000000'),
	night: grey('#000000', '#ffffff'),
	red: { ...grey('#ff0000', '#880000'), 400: '#ff8888', 600: '#aa0000' }
}
const skin = {
	surface: { light: 'day', dark: 'night' },
	ink: { light: 'day', dark: 'night' },
	danger: 'red',
	overrides: { danger: { light: 'red.600', dark: 'red.400' } }
}

const css = (config) => presetRokkit(config).preflights.map((p) => p.getCSS()).join('\n')

describe('skin overrides', () => {
	it('are not a role', () => {
		const colormap = resolveColormap(loadConfig({ palettes, skin }))
		expect(colormap).not.toHaveProperty('overrides')
		expect(css({ palettes, skin })).not.toContain('--color-overrides')
	})

	it('set the default skin token per mode in :root and the dark block', () => {
		const [light, dark] = css({ palettes, skin }).split('[data-mode="dark"]')
		expect(light).toMatch(/--danger:rgb\(170, 0, 0\)[;}]/)
		expect(dark).toMatch(/--danger:rgb\(255, 136, 136\)[;}]/)
	})

	it('set a named skin token per mode in its [data-skin] blocks', () => {
		const out = css({ palettes, skins: { default: { ...skin, overrides: {} }, ember: skin } })
		const light = out.match(/\[data-skin='ember'\]\{([^}]*)\}/)[1]
		const dark = out.match(/\[data-mode='dark'\]\[data-skin='ember'\]\{([^}]*)\}/)[1]
		expect(light).toMatch(/--danger:rgb\(170, 0, 0\)(;|$)/)
		expect(dark).toMatch(/--danger:rgb\(255, 136, 136\)(;|$)/)
	})

	it('yield to the app config overrides', () => {
		const [light] = css({ palettes, skin, overrides: { danger: 'red.500' } }).split('[data-mode="dark"]')
		const values = [...light.matchAll(/--danger:([^;}]*)/g)].map((m) => m[1])
		expect(values.at(-1)).toBe('rgb(255, 0, 0)')
	})
})

/**
 * Every fill role's on-colour is a variable (`--on-danger`…), derived per skin and per mode from
 * the fill that skin actually paints — so a skin that moves `danger` to a darker shade on light
 * paper gets near-white text on it, and near-black on the lighter dark-mode fill.
 */
describe('on-colour variables', () => {
	const NEAR_WHITE = 'rgb(250, 250, 250)'
	const NEAR_BLACK = 'rgb(22, 22, 22)'
	const last = (block, name) => [...block.matchAll(new RegExp(`--${name}:([^;}]*)`, 'g'))].map((m) => m[1]).at(-1)

	it('follow the default skin fill per mode', () => {
		const [light, dark] = css({ palettes, skin }).split('[data-mode="dark"]')
		expect(last(light, 'on-danger')).toBe(NEAR_WHITE)
		expect(last(dark, 'on-danger')).toBe(NEAR_BLACK)
	})

	it('follow a named skin fill per mode', () => {
		const out = css({ palettes, skins: { default: { ...skin, overrides: {} }, ember: skin } })
		expect(last(out.match(/\[data-skin='ember'\]\{([^}]*)\}/)[1], 'on-danger')).toBe(NEAR_WHITE)
		expect(last(out.match(/\[data-mode='dark'\]\[data-skin='ember'\]\{([^}]*)\}/)[1], 'on-danger')).toBe(NEAR_BLACK)
	})

	it('are set for every fill role but primary, which has on-primary', () => {
		const [light] = css({ palettes, skin }).split('[data-mode="dark"]')
		for (const role of ['secondary', 'tertiary', 'accent', 'success', 'warning', 'danger', 'error', 'info'])
			expect(light, role).toContain(`--on-${role}:`)
		expect(light.match(/--on-primary:/g)).toHaveLength(1)
		expect(light).not.toContain('--on-surface')
		expect(light).not.toContain('--on-ink')
	})
})
