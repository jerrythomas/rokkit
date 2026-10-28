/**
 * Ink-on-paper contrast: a build-time warning when the skin's ink palette lacks the tonal
 * range to read on its surface, and the WCAG measure every ink tone is held to.
 */
import { defaultColors, relativeLuminance, NAMED_TOKEN_SHADE_MAP } from '@rokkit/core'
import { isAlias } from './config.js'
import { isDualPalette, resolveMappingForMode } from './colors.js'

/** The four text tones, strongest first — the order every skin keeps in both modes. */
const INK_TONES = ['ink', 'ink-mute', 'ink-soft', 'ink-faint']
/** WCAG AA for body text. */
const AA = 4.5
/** Two neighbouring tones closer than this read as one. */
const MIN_STEP = 0.25

/** WCAG contrast ratio between two relative luminances. */
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

/**
 * Each ink tone's WCAG contrast against `paper` and `paper-soft` for one skin mapping in one
 * mode, read from the palettes at the named-token shades — the same values the preset emits.
 *
 * @param {Record<string, any>} config - a loaded config
 * @param {Record<string, unknown>} mapping - a skin (role → palette name or `{ light, dark }`)
 * @param {'light' | 'dark'} mode
 * @returns {{ token: string, paper: number, paperSoft: number }[]}
 */
export function inkContrast(config, mapping, mode) {
	const roles = resolveMappingForMode(mapping, mode)
	const palettes = { ...defaultColors, ...config.palettes }
	const luminance = (token) => {
		const role = token.startsWith('ink') ? 'ink' : 'surface'
		const value = palettes[roles[role]]?.[NAMED_TOKEN_SHADE_MAP[token]]
		return relativeLuminance(value, config.colorSpace)
	}
	const paper = luminance('paper')
	const paperSoft = luminance('paper-soft')
	return INK_TONES.map((token) => {
		const ink = luminance(token)
		return { token, paper: ratio(ink, paper), paperSoft: ratio(ink, paperSoft) }
	})
}

/** AA failures on paper and paper-soft, as readable lines. */
function belowAA({ token, paper, paperSoft }) {
	return [
		['paper', paper],
		['paper-soft', paperSoft]
	]
		.filter(([, c]) => c < AA)
		.map(([surface, c]) => `${token} on ${surface} is ${c.toFixed(2)}:1 (need ${AA})`)
}

/**
 * What breaks the ink contract in a set of `inkContrast` rows: a tone under AA on paper or
 * paper-soft, or a tone that does not read clearly weaker than the one before it.
 * Empty when the ramp is readable and in order.
 *
 * @param {{ token: string, paper: number, paperSoft: number }[]} rows
 * @returns {string[]}
 */
export function inkRampProblems(rows) {
	const order = rows
		.filter((row, i) => i > 0 && row.paper > rows[i - 1].paper - MIN_STEP)
		.map((row) => {
			const prev = rows[rows.indexOf(row) - 1]
			return `${row.token} (${row.paper.toFixed(2)}:1) does not read weaker than ${prev.token} (${prev.paper.toFixed(2)}:1)`
		})
	return [...rows.flatMap(belowAA), ...order]
}

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
