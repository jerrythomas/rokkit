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
	let raw = value.trim()
	const ref = raw.match(PALETTE_REF)
	if (ref) {
		const shade = palettes[ref[1]]?.[ref[2]]
		if (!shade) return null
		raw = String(shade).trim()
	}
	const fn = raw.match(/^oklch\(\s*([^)]+)\)$/i)
	if (fn) raw = fn[1].trim()
	const parts = raw.split(/[\s,/]+/).filter(Boolean).map(Number)
	if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null
	return [parts[0], parts[1], parts[2]]
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

/** Pick a skin role's palette name for a mode (handles `{light,dark}` duals). */
function roleName(skin, role, mode) {
	const v = skin?.[role]
	if (v && typeof v === 'object' && !Array.isArray(v)) return mode === 'dark' ? v.dark : v.light
	return v
}

/**
 * Resolve a named token's OKLCH for a mode: config `overrides` win, else the
 * role palette at the token's shade.
 */
function resolveToken(config, skin, role, shade, name, mode) {
	const ov = config.overrides?.[name]
	if (ov !== undefined) {
		const v = ov && typeof ov === 'object' && !Array.isArray(ov) ? (mode === 'dark' ? ov.dark : ov.light) : ov
		return parseColor(v, config.palettes)
	}
	const pal = config.palettes?.[roleName(skin, role, mode)]
	return pal ? parseColor(String(pal[shade]), config.palettes) : null
}

const AA = 4.5

/**
 * Verify text/border contrast tokens from the parsed config, in light + dark.
 * @param {Record<string, any> | null} config
 * @returns {Array<{ id: string, label: string, status: 'warn', fixable: false, fix: string }>}
 */
export function checkContrastTokens(config) {
	if (!config?.palettes) return []
	const skin = config.skins?.default ?? config.skin ?? config.colors
	if (!skin || !skin.ink || !skin.surface) return []

	const findings = []
	for (const mode of ['light', 'dark']) {
		const paper = resolveToken(config, skin, 'surface', 50, 'paper', mode)
		if (!paper) continue
		const ramp = [
			['ink', 900],
			['ink-mute', 700],
			['ink-soft', 500],
			['ink-faint', 300]
		].map(([name, shade]) => ({ name, c: (() => {
			const tok = resolveToken(config, skin, 'ink', shade, name, mode)
			return tok ? contrastRatio(tok, paper) : null
		})() }))

		// AA gate on the readable text tones.
		for (const { name, c } of ramp) {
			if ((name === 'ink' || name === 'ink-mute') && c !== null && c < AA) {
				findings.push({
					id: `contrast-${name}-${mode}`,
					label: `${name} on paper clears AA in ${mode}`,
					status: 'warn',
					fixable: false,
					fix: `${name} vs paper is ${c.toFixed(2)}:1 in ${mode} (need ≥ ${AA}). It backs ${name === 'ink' ? 'primary' : 'secondary'} text — darken ${name} (or lighten paper) in this mode.`
				})
			}
		}

		// Monotonic ramp: ink > ink-mute > ink-soft > ink-faint.
		const seq = ramp.filter((r) => r.c !== null)
		for (let i = 1; i < seq.length; i++) {
			if (seq[i].c > seq[i - 1].c + 0.01) {
				findings.push({
					id: `contrast-ramp-${mode}`,
					label: `ink ramp is monotonic in ${mode}`,
					status: 'warn',
					fixable: false,
					fix: `${seq[i].name} (${seq[i].c.toFixed(2)}:1) has MORE contrast than ${seq[i - 1].name} (${seq[i - 1].c.toFixed(2)}:1) in ${mode} — the ramp ink > ink-mute > ink-soft > ink-faint is inverted/compressed.`
				})
				break
			}
		}

		// Border visibility: paper-edge must be distinguishable from paper.
		const edge = resolveToken(config, skin, 'surface', 400, 'paper-edge', mode)
		if (edge) {
			const ec = contrastRatio(edge, paper)
			if (ec < 1.18) {
				findings.push({
					id: `contrast-paper-edge-${mode}`,
					label: `paper-edge is visible against paper in ${mode}`,
					status: 'warn',
					fixable: false,
					fix: `paper-edge vs paper is only ${ec.toFixed(2)}:1 in ${mode} — the hairline border is effectively invisible. Pick a paper-edge value with more lightness separation from the canvas in this mode.`
				})
			}
		}
	}
	return findings
}
