/**
 * Static contrast checks for `rokkit doctor`.
 *
 * Computes real WCAG contrast (not just OKLCH lightness diff) from the project's
 * configured palettes, in BOTH light and dark modes, and verifies:
 *   - `ink` and `ink-mute` (primary + secondary text) clear AA 4.5 on `paper`,
 *   - the text ramp is monotonic: ink > ink-mute > ink-soft > ink-faint,
 *   - `paper-edge` (the hairline border tone) is actually visible against `paper`
 *     (catches the "near-black etched edge invisible in dark" class of bug).
 *
 * All findings are advisory (`warn`) — a project's palette is the author's call;
 * the doctor surfaces problems, it doesn't block.
 */

const PALETTE_REF = /^([a-z][\w-]*)\.(\d{2,3})$/i

/**
 * Parse a colour value into OKLCH components [L, C, H].
 * Accepts a palette ref ("kami.400"), a bare "L C H" string ("0.985 0.005 85"),
 * or an `oklch(L C H)` function. Returns null for anything else (e.g. hex/rgb).
 * @param {string} value
 * @param {Record<string, Record<string|number,string>>} palettes
 * @returns {[number, number, number] | null}
 */
export function parseColor(value, palettes = {}) {
	if (typeof value !== 'string') return null
	const raw = resolvePaletteRef(value.trim(), palettes)
	if (raw === null) return null
	const parts = stripColorFn(raw).split(/[\s,/]+/).filter(Boolean).map(Number)
	if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null
	return [parts[0], parts[1], parts[2]]
}

/**
 * Follow a `"kami.400"` palette reference to its value. Non-references pass
 * through unchanged; a reference pointing at a missing shade returns null,
 * which the caller treats as unparseable.
 * @param {string} raw
 * @param {Record<string, Record<string|number,string>>} palettes
 * @returns {string | null}
 */
function resolvePaletteRef(raw, palettes) {
	const ref = raw.match(PALETTE_REF)
	if (!ref) return raw
	const shade = palettes[ref[1]]?.[ref[2]]
	return shade ? String(shade).trim() : null
}

/**
 * Unwrap `oklch(L C H)` to its bare channels; anything else passes through.
 * @param {string} raw
 * @returns {string}
 */
function stripColorFn(raw) {
	const fn = raw.match(/^oklch\(\s*([^)]+)\)$/i)
	return fn ? fn[1].trim() : raw
}

/**
 * OKLCH → linear sRGB (the space WCAG relative luminance is defined in).
 * @param {[number, number, number]} oklch
 * @returns {[number, number, number]} linear sRGB, each clamped to [0,1]
 */
export function oklchToLinearSrgb([L, C, H]) {
	const hr = (H * Math.PI) / 180
	const a = C * Math.cos(hr)
	const b = C * Math.sin(hr)
	const l_ = L + 0.3963377774 * a + 0.2158037573 * b
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b
	const s_ = L - 0.0894841775 * a - 1.291485548 * b
	const l = l_ ** 3
	const m = m_ ** 3
	const s = s_ ** 3
	const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
	const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
	const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	const clamp = (v) => Math.max(0, Math.min(1, v))
	return [clamp(r), clamp(g), clamp(bl)]
}

/**
 * WCAG relative luminance from OKLCH components.
 * @param {[number, number, number]} oklch
 * @returns {number}
 */
export function relativeLuminance(oklch) {
	const [r, g, b] = oklchToLinearSrgb(oklch)
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG contrast ratio between two OKLCH colours.
 * @param {[number, number, number]} a
 * @param {[number, number, number]} b
 * @returns {number}
 */
export function contrastRatio(a, b) {
	const la = relativeLuminance(a)
	const lb = relativeLuminance(b)
	return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Unwrap a `{ light, dark }` dual to the value for `mode`; scalars pass through.
 * Both skin roles and config overrides accept the dual form, so this is the one
 * place that knows the shape.
 * @param {unknown} value
 * @param {string} mode
 */
function pickMode(value, mode) {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return mode === 'dark' ? value.dark : value.light
	}
	return value
}

/** Pick a skin role's palette name for a mode (handles `{light,dark}` duals). */
function roleName(skin, role, mode) {
	return pickMode(skin?.[role], mode)
}

/**
 * Resolve a named token's OKLCH for a mode: config `overrides` win, else the
 * role palette at the token's shade.
 * @param {{ config: Record<string, any>, skin: Record<string, any>, role: string,
 *   shade: number, name: string, mode: string }} args
 */
function resolveToken({ config, skin, role, shade, name, mode }) {
	const override = config.overrides?.[name]
	if (override !== undefined) return parseColor(pickMode(override, mode), config.palettes)
	const palette = config.palettes?.[roleName(skin, role, mode)]
	return palette ? parseColor(String(palette[shade]), config.palettes) : null
}

const AA = 4.5
/** Below this ratio a hairline border is effectively invisible against the canvas. */
const EDGE_MIN = 1.18
/** Float slack, so noise in the ramp doesn't read as a real inversion. */
const RAMP_SLACK = 0.01
/** The ink ramp, darkest first — the order the monotonic check asserts. */
const INK_RAMP = [
	['ink', 900],
	['ink-mute', 700],
	['ink-soft', 500],
	['ink-faint', 300]
]
/** The two ink tones that carry readable text, and so must clear AA. */
const READABLE = new Set(['ink', 'ink-mute'])

/** The skin block, under whichever of the three accepted config keys holds it. */
function skinOf(config) {
	return config.skins?.default ?? config.skin ?? config.colors
}

/** Each ink tone's contrast against paper, in ramp order; null where unresolvable. */
function inkRamp(config, skin, paper, mode) {
	return INK_RAMP.map(([name, shade]) => {
		const token = resolveToken({ config, skin, role: 'ink', shade, name, mode })
		return { name, c: token ? contrastRatio(token, paper) : null }
	})
}

/** AA gate on the tones that actually carry text. */
function checkReadableText(ramp, mode) {
	return ramp
		.filter(({ name, c }) => READABLE.has(name) && c !== null && c < AA)
		.map(({ name, c }) => ({
			id: `contrast-${name}-${mode}`,
			label: `${name} on paper clears AA in ${mode}`,
			status: 'warn',
			fixable: false,
			fix: `${name} vs paper is ${c.toFixed(2)}:1 in ${mode} (need ≥ ${AA}). It backs ${name === 'ink' ? 'primary' : 'secondary'} text — darken ${name} (or lighten paper) in this mode.`
		}))
}

/**
 * ink > ink-mute > ink-soft > ink-faint. Reports the FIRST inversion only —
 * once the ramp is out of order every later pair is suspect too, and four
 * findings for one mistake is noise.
 */
function checkRampMonotonic(ramp, mode) {
	const seq = ramp.filter((r) => r.c !== null)
	const broken = seq.findIndex((r, i) => i > 0 && r.c > seq[i - 1].c + RAMP_SLACK)
	if (broken < 0) return []
	return [
		{
			id: `contrast-ramp-${mode}`,
			label: `ink ramp is monotonic in ${mode}`,
			status: 'warn',
			fixable: false,
			fix: `${seq[broken].name} (${seq[broken].c.toFixed(2)}:1) has MORE contrast than ${seq[broken - 1].name} (${seq[broken - 1].c.toFixed(2)}:1) in ${mode} — the ramp ink > ink-mute > ink-soft > ink-faint is inverted/compressed.`
		}
	]
}

/** paper-edge must be distinguishable from paper, or the hairline border vanishes. */
function checkEdgeVisible(config, skin, paper, mode) {
	const edge = resolveToken({ config, skin, role: 'surface', shade: 400, name: 'paper-edge', mode })
	if (!edge) return []
	const ratio = contrastRatio(edge, paper)
	if (ratio >= EDGE_MIN) return []
	return [
		{
			id: `contrast-paper-edge-${mode}`,
			label: `paper-edge is visible against paper in ${mode}`,
			status: 'warn',
			fixable: false,
			fix: `paper-edge vs paper is only ${ratio.toFixed(2)}:1 in ${mode} — the hairline border is effectively invisible. Pick a paper-edge value with more lightness separation from the canvas in this mode.`
		}
	]
}

/** All three checks for one mode. */
function checksForMode(config, skin, mode) {
	const paper = resolveToken({ config, skin, role: 'surface', shade: 50, name: 'paper', mode })
	if (!paper) return []
	const ramp = inkRamp(config, skin, paper, mode)
	return [
		...checkReadableText(ramp, mode),
		...checkRampMonotonic(ramp, mode),
		...checkEdgeVisible(config, skin, paper, mode)
	]
}

/**
 * Verify text/border contrast tokens from the parsed config, in light + dark.
 * @param {Record<string, any> | null} config
 * @returns {Array<{ id: string, label: string, status: 'warn', fixable: false, fix: string }>}
 */
export function checkContrastTokens(config) {
	if (!config?.palettes) return []
	const skin = skinOf(config)
	if (!skin?.ink || !skin.surface) return []
	return ['light', 'dark'].flatMap((mode) => checksForMode(config, skin, mode))
}
