/**
 * Skin definitions and runtime color-role switching for the Sensei demo app.
 *
 * Provides predefined skins (from rokkit.config.js), a list of available palettes,
 * and helpers to apply skin or individual role overrides at runtime by setting
 * CSS custom properties on the document root.
 */

import { defaultColors, shades } from '@rokkit/core'
import { ColorSpace, relativeLuminance, pickOnColor } from '@rokkit/core'
import { NAMED_TOKENS, NAMED_TOKEN_SHADE_MAP, NAMED_TOKEN_ROLE_MAP } from '@rokkit/core'

// ── Custom OKLCH palettes (copied from rokkit.config.js) ────────────────────

const customPalettes: Record<string, Record<number, string>> = {
	kami: {
		50:  '0.985 0.005 85',
		100: '0.975 0.008 85',
		200: '0.955 0.010 85',
		300: '0.920 0.012 85',
		400: '0.850 0.010 70',
		500: '0.750 0.008 50',
		600: '0.580 0.010 50',
		700: '0.380 0.012 50',
		800: '0.280 0.012 50',
		900: '0.220 0.012 50',
		950: '0.170 0.010 50',
	},
	shu: {
		50:  '0.970 0.020 35',
		100: '0.940 0.040 35',
		200: '0.880 0.070 35',
		300: '0.800 0.100 35',
		400: '0.700 0.130 35',
		500: '0.580 0.150 35',
		600: '0.500 0.140 35',
		700: '0.420 0.120 35',
		800: '0.350 0.100 35',
		900: '0.280 0.080 35',
		950: '0.220 0.060 35',
	},
	hisui: {
		50:  '0.970 0.015 160',
		100: '0.940 0.030 160',
		200: '0.880 0.050 160',
		300: '0.800 0.065 160',
		400: '0.720 0.075 160',
		500: '0.620 0.080 160',
		600: '0.540 0.075 160',
		700: '0.460 0.065 160',
		800: '0.380 0.055 160',
		900: '0.300 0.045 160',
		950: '0.240 0.035 160',
	},
	kohaku: {
		50:  '0.980 0.020 75',
		100: '0.950 0.040 75',
		200: '0.900 0.070 75',
		300: '0.850 0.095 75',
		400: '0.790 0.110 75',
		500: '0.720 0.120 75',
		600: '0.640 0.110 75',
		700: '0.560 0.095 75',
		800: '0.470 0.080 75',
		900: '0.380 0.065 75',
		950: '0.300 0.050 75',
	},
	// sumi is the dark-mode counterpart of kami — the scale runs INVERTED
	// so that the named-token mapping (`paper → surface.50`) gives the
	// darkest value when surface is sumi in dark mode. shade 50 = sumi
	// ink (dark canvas), shade 950 = warm paper-white (dark-mode text).
	// Must match `rokkit.config.js` exactly so static UnoCSS preflight
	// and the runtime skin sheet emit the same palette.
	sumi: {
		50:  '0.170 0.010 50',
		100: '0.210 0.012 50',
		200: '0.250 0.012 50',
		300: '0.320 0.012 50',
		400: '0.420 0.010 50',
		500: '0.570 0.010 50',
		600: '0.420 0.012 85',
		700: '0.600 0.010 85',
		800: '0.780 0.008 85',
		900: '0.940 0.008 85',
		950: '0.975 0.008 85',
	}
}

// ── OKLCH adapter for wrapping values ───────────────────────────────────────

const oklchAdapter = ColorSpace.create('oklch')

// ── Skin definitions ────────────────────────────────────────────────────────

interface SkinDefinition {
	name: string
	label: string
	surface: string
	darkSurface?: string
	ink: string
	primary: string
	secondary: string
	accent: string
}

/**
 * A skin role can map to a single palette name (same in light + dark) or
 * a dual-palette object `{ light, dark }` that swaps based on data-mode.
 */
type RoleMapping = string | { light: string; dark: string }

/** Predefined skins with display info */
export const skinDefinitions: SkinDefinition[] = [
	{ name: 'default', label: 'Zen Sumi', surface: 'kami',  darkSurface: 'sumi', ink: 'kami',  primary: 'shu',     secondary: 'hisui',  accent: 'shu'    },
	{ name: 'ocean',   label: 'Ocean',    surface: 'slate',                       ink: 'slate', primary: 'sky',     secondary: 'teal',   accent: 'cyan'   },
	{ name: 'violet',  label: 'Violet',   surface: 'zinc',                        ink: 'zinc',  primary: 'violet',  secondary: 'purple', accent: 'indigo' },
	{ name: 'rose',    label: 'Rose',     surface: 'stone',                       ink: 'stone', primary: 'rose',    secondary: 'pink',   accent: 'orange' },
	{ name: 'emerald', label: 'Emerald',  surface: 'slate',                       ink: 'slate', primary: 'emerald', secondary: 'teal',   accent: 'cyan'   },
]

// ── Tailwind palette names available for individual role picking ─────────

const tailwindPaletteNames = [
	'slate', 'zinc', 'stone',
	'sky', 'teal', 'cyan',
	'violet', 'purple', 'indigo',
	'rose', 'pink', 'orange',
	'emerald', 'blue', 'amber', 'green', 'red',
]

const customPaletteNames = Object.keys(customPalettes)

/** All available palettes for individual role picking */
export const availablePalettes: string[] = [...customPaletteNames, ...tailwindPaletteNames]

// ── Palette value helpers ───────────────────────────────────────────────────

function isCustomPalette(name: string): boolean {
	return name in customPalettes
}

/**
 * Get the raw shade values for a palette (all shades).
 * Returns values as CSS-ready strings.
 */
function getPaletteShades(paletteName: string): Record<number, string> | null {
	if (isCustomPalette(paletteName)) {
		return customPalettes[paletteName]
	}
	const tw = (defaultColors as Record<string, Record<string | number, string>>)[paletteName]
	if (!tw) return null
	const result: Record<number, string> = {}
	for (const shade of shades) {
		if (tw[shade] !== undefined) {
			result[shade] = tw[shade]
		}
	}
	return result
}

/**
 * Get the 500-shade color for a palette — used for swatch display.
 * Returns a CSS-ready color string.
 */
export function getPaletteColor(paletteName: string): string {
	if (isCustomPalette(paletteName)) {
		return `oklch(${customPalettes[paletteName][500]})`
	}
	const tw = (defaultColors as Record<string, Record<string | number, string>>)[paletteName]
	return tw?.[500] ?? '#888'
}

// ── CSS variable application ────────────────────────────────────────────────

/**
 * Wrap a raw palette value into a CSS-ready color string.
 * Custom OKLCH values are bare "L C H" and need oklch() wrapping.
 * Tailwind hex values get converted via the OKLCH adapter.
 */
function wrapColor(value: string, isOklch: boolean): string {
	if (isOklch) {
		return `oklch(${value})`
	}
	return oklchAdapter.wrap(value) as string
}

/**
 * Build CSS-var declarations for a role + palette, as a string fragment that
 * can be inlined inside a `:root { … }` or `[data-mode="dark"] { … }` rule.
 */
function declarationsFor(role: string, paletteName: string): string {
	const paletteShades = getPaletteShades(paletteName)
	if (!paletteShades) return ''
	const isOklch = isCustomPalette(paletteName)
	const parts: string[] = []
	for (const shade of shades) {
		const value = paletteShades[shade]
		if (value !== undefined) {
			parts.push(`--color-${role}-${shade}:${wrapColor(value, isOklch)};`)
		}
	}
	const defaultValue = paletteShades[500]
	if (defaultValue !== undefined) {
		parts.push(`--color-${role}:${wrapColor(defaultValue, isOklch)};`)
	}
	return parts.join('')
}

const SKIN_STYLE_ID = 'koan-skin-overrides'

function getSkinStyleEl(): HTMLStyleElement | null {
	if (typeof document === 'undefined') return null
	let el = document.getElementById(SKIN_STYLE_ID) as HTMLStyleElement | null
	if (!el) {
		el = document.createElement('style')
		el.id = SKIN_STYLE_ID
		document.head.appendChild(el)
	}
	return el
}

/**
 * Track per-role overrides so `applyRoleColor` can update a single role
 * without losing other roles' applied palettes.
 *
 * Each role can map to either a single palette name (used for both modes)
 * or a `{ light, dark }` pair.
 */
const activeOverrides: Record<string, RoleMapping> = {}

/**
 * Build named-token aliases that point at the palette shades so the
 * theme CSS (which reads `var(--primary)`, `var(--paper)`, etc.) picks
 * up palette overrides written by `applyRoleColor`. Without these, the demo
 * runs in `tokens: 'core'` mode where named tokens are emitted as
 * inlined OKLCH values at config-build time — they don't reference
 * `--color-{role}-{shade}` and so palette overrides have no effect.
 *
 * Only emits aliases for roles the skin is overriding, so we don't
 * accidentally null out tokens whose source role wasn't touched.
 */
/**
 * Resolve the FIXED on-color hex for a derived `on-{role}` token from THAT
 * role's own 500 fill, luminance-picked via the shared `@rokkit/core` logic.
 *
 * The on-color must be FIXED (identical in light and dark) because it sits on a
 * fill that's the same in both modes — pointing it at a surface shade (the old
 * `var(--color-surface-50)`) flipped it with the canvas and made bright brand
 * fills unreadable. Returns null when the role's fill can't be resolved so the
 * caller can fall back to the previous behaviour.
 */
function derivedOnColorFor(role: string): string | null {
	const mapping = activeOverrides[role]
	if (!mapping) return null
	// A role can map to a single palette or a {light, dark} pair; the 500 fill is
	// the same hue in both, so the light palette (or the single name) is canonical.
	const paletteName = typeof mapping === 'string' ? mapping : mapping.light
	const paletteShades = getPaletteShades(paletteName)
	const fill = paletteShades?.[500]
	if (fill === undefined) return null
	// Custom palettes are bare OKLCH "L C H"; tailwind palettes are hex.
	const space = isCustomPalette(paletteName) ? 'oklch' : 'rgb'
	const y = relativeLuminance(fill, space)
	return pickOnColor(y)
}

function namedTokenAliases(roles: Set<string>): string {
	const lines: string[] = []
	for (const name of NAMED_TOKENS) {
		const shadeOrDerived = NAMED_TOKEN_SHADE_MAP[name as keyof typeof NAMED_TOKEN_SHADE_MAP]
		const role = NAMED_TOKEN_ROLE_MAP[name as keyof typeof NAMED_TOKEN_ROLE_MAP]
		if (shadeOrDerived === 'derived') {
			// on-{role} → FIXED on-color picked from THIS role's 500 fill luminance
			// (same value in light + dark — it sits on a mode-invariant fill).
			if (!roles.has(role)) continue
			const onColor = derivedOnColorFor(role)
			if (onColor !== null) {
				lines.push(`--${name}:${onColor};`)
			} else if (roles.has('surface')) {
				// Fallback to the previous behaviour if the fill can't be resolved.
				lines.push(`--${name}:var(--color-surface-50);`)
			}
			continue
		}
		if (!roles.has(role)) continue
		lines.push(`--${name}:var(--color-${role}-${shadeOrDerived});`)
	}
	return lines.join('')
}

function rewriteSkinStyle() {
	const el = getSkinStyleEl()
	if (!el) return
	const lightDecls: string[] = []
	const darkDecls: string[] = []
	for (const [role, mapping] of Object.entries(activeOverrides)) {
		if (typeof mapping === 'string') {
			lightDecls.push(declarationsFor(role, mapping))
		} else {
			lightDecls.push(declarationsFor(role, mapping.light))
			darkDecls.push(declarationsFor(role, mapping.dark))
		}
	}
	// Named-token aliases — only for roles in the override set. Lets
	// theme CSS reading `var(--primary)` etc. follow palette swaps.
	//
	// Aliases must be emitted in BOTH the `:root` and `[data-mode="dark"]`
	// blocks because the UnoCSS preflight emits a sizeable
	// `[data-mode="dark"] { --primary: <inlined value>; ... }` rule that
	// otherwise wins over our `:root` skin block in dark mode (the body
	// has `data-mode="dark"`, so descendants see the dark block's value).
	// Pointing them at the same `var(--color-{role}-{shade})` keeps both
	// modes in sync — for single-palette skins the palette vars are
	// only defined at :root, so the dark alias just resolves to the
	// light palette value.
	const overrideRoles = new Set(Object.keys(activeOverrides))
	const aliases = namedTokenAliases(overrideRoles)
	const css = [
		lightDecls.length || aliases ? `:root{${lightDecls.join('')}${aliases}}` : '',
		darkDecls.length || aliases ? `[data-mode="dark"]{${darkDecls.join('')}${aliases}}` : ''
	].join('')
	el.textContent = css
}

/**
 * Apply a single role override — replaces the role's mapping (preserving the
 * other roles) and re-emits the style element.
 *
 * Accepts either a single palette name (applies to both modes) or a
 * `{ light, dark }` pair for explicit dual-palette overrides.
 */
export function applyRoleColor(role: string, palette: RoleMapping): void {
	activeOverrides[role] = palette
	rewriteSkinStyle()
}
