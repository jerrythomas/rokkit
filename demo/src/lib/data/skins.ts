/**
 * Skin definitions and runtime color-role switching for the Sensei demo app.
 *
 * Provides predefined skins (from rokkit.config.js), a list of available palettes,
 * and helpers to apply skin or individual role overrides at runtime by setting
 * CSS custom properties on the document root.
 */

import { defaultColors, shades } from '@rokkit/core'
import { ColorSpace } from '@rokkit/core'

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
	sumi: {
		50:  '0.975 0.008 85',
		100: '0.940 0.008 85',
		200: '0.780 0.008 85',
		300: '0.600 0.010 85',
		400: '0.420 0.012 85',
		500: '0.570 0.010 50',
		600: '0.420 0.010 50',
		700: '0.320 0.012 50',
		800: '0.250 0.012 50',
		900: '0.210 0.012 50',
		950: '0.170 0.010 50',
	}
}

// ── OKLCH adapter for wrapping values ───────────────────────────────────────

const oklchAdapter = ColorSpace.create('oklch')

// ── Skin definitions ────────────────────────────────────────────────────────

interface SkinDefinition {
	name: string
	label: string
	surface: string
	primary: string
	secondary: string
	accent: string
}

/** Full skin colormaps keyed by role (used for applySkin) */
const skinColormaps: Record<string, Record<string, string>> = {
	default: { surface: 'kami', primary: 'shu', secondary: 'hisui', accent: 'shu' },
	ocean:   { surface: 'slate', primary: 'sky', secondary: 'teal', accent: 'cyan' },
	violet:  { surface: 'zinc', primary: 'violet', secondary: 'purple', accent: 'indigo' },
	rose:    { surface: 'stone', primary: 'rose', secondary: 'pink', accent: 'orange' },
	emerald: { surface: 'slate', primary: 'emerald', secondary: 'teal', accent: 'cyan' },
}

/** Predefined skins with display info */
export const skinDefinitions: SkinDefinition[] = [
	{ name: 'default', label: 'Zen Sumi', surface: 'kami', primary: 'shu', secondary: 'hisui', accent: 'shu' },
	{ name: 'ocean',   label: 'Ocean',    surface: 'slate', primary: 'sky', secondary: 'teal', accent: 'cyan' },
	{ name: 'violet',  label: 'Violet',   surface: 'zinc', primary: 'violet', secondary: 'purple', accent: 'indigo' },
	{ name: 'rose',    label: 'Rose',     surface: 'stone', primary: 'rose', secondary: 'pink', accent: 'orange' },
	{ name: 'emerald', label: 'Emerald',  surface: 'slate', primary: 'emerald', secondary: 'teal', accent: 'cyan' },
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
 * Set CSS variables for a single role using the given palette.
 */
function setRoleVariables(role: string, paletteName: string): void {
	const paletteShades = getPaletteShades(paletteName)
	if (!paletteShades) return

	const isOklch = isCustomPalette(paletteName)
	const el = document.documentElement

	for (const shade of shades) {
		const value = paletteShades[shade]
		if (value !== undefined) {
			el.style.setProperty(`--color-${role}-${shade}`, wrapColor(value, isOklch))
		}
	}
	// Also set the DEFAULT (no shade suffix)
	const defaultValue = paletteShades[500]
	if (defaultValue !== undefined) {
		el.style.setProperty(`--color-${role}`, wrapColor(defaultValue, isOklch))
	}
}

/**
 * Clear all role CSS variable overrides from the document root.
 */
function clearRoleVariables(): void {
	const el = document.documentElement
	const roles = ['surface', 'primary', 'secondary', 'tertiary', 'accent', 'success', 'warning', 'danger', 'info']
	for (const role of roles) {
		for (const shade of shades) {
			el.style.removeProperty(`--color-${role}-${shade}`)
		}
		el.style.removeProperty(`--color-${role}`)
	}
}

/**
 * Apply a skin's CSS variables to the document.
 * Clears previous overrides and sets all roles from the skin colormap.
 */
export function applySkin(skinName: string): void {
	const colormap = skinColormaps[skinName]
	if (!colormap) return

	clearRoleVariables()

	for (const [role, paletteName] of Object.entries(colormap)) {
		setRoleVariables(role, paletteName)
	}
}

/**
 * Apply a single role override — sets CSS variables for that role.
 */
export function applyRoleColor(role: string, paletteName: string): void {
	setRoleVariables(role, paletteName)
}
