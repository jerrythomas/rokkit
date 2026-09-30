/**
 * A build-time warning when the skin's ink palette lacks the tonal range to read on its surface.
 */
import { isAlias } from './config.js'
import { isDualPalette } from './colors.js'

/**
 * Parses the OKLCH lightness value from a palette shade string.
 * Palette values are stored as "L C H" strings (e.g., "0.75 0.008 50").
 */
function parseLightness(oklchStr) {
	if (!oklchStr || typeof oklchStr !== 'string') return null
	return parseFloat(oklchStr.trim().split(/\s+/)[0])
}

/** The config palette a role maps to (a dual palette's light side), or null. */
function paletteForRole(role, colormap, config) {
	const value = colormap[role]
	if (!value || isAlias(value)) return null
	const paletteName = isDualPalette(value) ? (value.light ?? value.dark) : value
	return config.palettes[paletteName] ?? null
}

/**
 * Ink shades run inverted relative to surface (ink-900 is the darkest, analogous to
 * surface-100), so the meaningful pairs are (surface-100, ink-900) and (surface-300, ink-700).
 */
const SHADE_PAIRS = [
	{ surfaceShade: 100, inkShade: 900 },
	{ surfaceShade: 300, inkShade: 700 }
]

/**
 * Warns for each complementary ink / surface shade pair less than 0.3 apart in OKLCH
 * lightness. Only custom palettes (`config.palettes`) are checked — the built-ins are tuned.
 */
export function checkInkContrast(config, colormap) {
	const inkPalette = paletteForRole('ink', colormap, config)
	const surfacePalette = paletteForRole('surface', colormap, config)
	if (!inkPalette || !surfacePalette) return

	for (const { surfaceShade, inkShade } of SHADE_PAIRS) {
		const surfaceL = parseLightness(surfacePalette[surfaceShade])
		const inkL = parseLightness(inkPalette[inkShade])
		if (surfaceL === null || inkL === null) continue
		const diff = Math.abs(surfaceL - inkL)
		if (diff < 0.3) {
			// eslint-disable-next-line no-console
			console.warn(
				`rokkit: ink-${inkShade} on surface-${surfaceShade} has low lightness contrast (${diff.toFixed(2)}). ` +
					`Consider a palette with more tonal range for ink.`
			)
		}
	}
}
