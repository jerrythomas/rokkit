/**
 * ColorSpace adapter strategy pattern.
 *
 * Each adapter knows how to convert hex colors to its own representation,
 * wrap bare channels into a complete CSS color function, and produce
 * `color-mix()` expressions for theme variables with alpha support.
 */

// ── Private math helpers (copied from utils.js — not imported) ──────────

/**
 * Convert sRGB component (0-255) to linear RGB.
 * @param {number} c - sRGB value 0-255
 * @returns {number}
 */
function srgbToLinear(c) {
	const s = c / 255
	return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

// Linear sRGB → XYZ D65
const SRGB_TO_XYZ = [
	[0.4123907993, 0.3575843394, 0.1804807884],
	[0.2126390059, 0.7151686788, 0.0721923154],
	[0.0193308187, 0.1191947798, 0.9505321522]
]
// XYZ D65 → LMS
const XYZ_TO_LMS = [
	[0.8189330101, 0.3618667424, -0.1288597137],
	[0.0329845436, 0.9293118715, 0.0361456387],
	[0.0482003018, 0.2643662691, 0.633851707]
]
// LMS^(1/3) → OKLab
const LMS3_TO_OKLAB = [
	[0.2104542553, 0.793617785, -0.0040720468],
	[1.9779984951, -2.428592205, 0.4505937099],
	[0.0259040371, 0.7827717662, -0.808675766]
]

/** @param {number[][]} m @param {number[]} v */
function matMul(m, v) {
	return m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2])
}

// ── Hex parsing helper ──────────────────────────────────────────────────

/**
 * Parse a hex string (#rrggbb) into [r, g, b] integers.
 * @param {string} hex
 * @returns {number[]}
 */
function parseHex(hex) {
	return hex.match(/\w\w/g).map((x) => parseInt(x, 16))
}

// ── Hex → HSL conversion ───────────────────────────────────────────────

/**
 * Convert hex to HSL bare channels: "H S% L%"
 * @param {string} hex
 * @returns {string}
 */
function hexToHsl(hex) {
	const [r, g, b] = parseHex(hex)
	const rn = r / 255
	const gn = g / 255
	const bn = b / 255
	const max = Math.max(rn, gn, bn)
	const min = Math.min(rn, gn, bn)
	const l = (max + min) / 2

	if (max === min) return `0 0% ${Math.round(l * 100)}%`

	const d = max - min
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

	let h = 0
	if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
	else if (max === gn) h = ((bn - rn) / d + 2) / 6
	else h = ((rn - gn) / d + 4) / 6

	return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// ── Hex → OKLCH conversion ─────────────────────────────────────────────

/**
 * Convert hex to OKLCH bare channels: "L C H"
 * @param {string} hex
 * @returns {string}
 */
function hexToOklch(hex) {
	const [r, g, b] = parseHex(hex)
	const lin = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]

	const xyz = matMul(SRGB_TO_XYZ, lin)
	const lms = matMul(XYZ_TO_LMS, xyz)
	const lms3 = [Math.cbrt(lms[0]), Math.cbrt(lms[1]), Math.cbrt(lms[2])]
	const [L, a, bk] = matMul(LMS3_TO_OKLAB, lms3)

	const C = Math.sqrt(a * a + bk * bk)
	let H = (Math.atan2(bk, a) * 180) / Math.PI
	if (H < 0) H += 360

	const Lr = Math.round(L * 1000000) / 1000000
	const Cr = Math.round(C * 1000000) / 1000000
	const Hr = Math.round(H * 10000) / 10000

	return `${Lr} ${Cr} ${Hr}`
}

// ── Hex regex ───────────────────────────────────────────────────────────

const HEX_RE = /^#[0-9a-fA-F]{6}$/

// ── Base class ──────────────────────────────────────────────────────────

/**
 * Abstract base class for color space adapters.
 */
export class ColorSpace {
	/** @returns {string} */
	get name() {
		throw new Error('Subclass must implement name')
	}

	/** @returns {string} CSS color-mix interpolation space */
	get mixSpace() {
		throw new Error('Subclass must implement mixSpace')
	}

	/** @returns {string} CSS function name */
	get fn() {
		throw new Error('Subclass must implement fn')
	}

	/**
	 * Convert a hex color to bare channels in this space.
	 * @param {string} hex - #rrggbb
	 * @returns {string}
	 */
	fromHex(_hex) {
		throw new Error('Subclass must implement fromHex')
	}

	/**
	 * Wrap any input into a complete CSS color value.
	 * - hex → convert and wrap
	 * - bare channels → wrap in fn()
	 * - already wrapped → pass through
	 * - non-string / null / undefined → pass through
	 * - named colors → pass through
	 * @param {*} value
	 * @returns {*}
	 */
	wrap(_value) {
		throw new Error('Subclass must implement wrap')
	}

	/**
	 * Produce a color-mix expression for theme CSS variables with alpha support.
	 * @param {string} varName - CSS variable name (e.g. '--color-primary-500')
	 * @returns {string}
	 */
	themeColor(varName) {
		return `color-mix(in ${this.mixSpace}, var(${varName}) calc(<alpha-value> * 100%), transparent)`
	}
}

// ── RGB adapter ─────────────────────────────────────────────────────────

export class RgbColorSpace extends ColorSpace {
	get name() {
		return 'rgb'
	}

	get mixSpace() {
		return 'srgb'
	}

	get fn() {
		return 'rgb'
	}

	fromHex(hex) {
		const [r, g, b] = parseHex(hex)
		return `${r}, ${g}, ${b}`
	}

	wrap(value) {
		if (typeof value !== 'string') return value

		// Already wrapped
		if (value.startsWith('rgb(') || value.startsWith('rgba(')) return value

		// Hex
		if (HEX_RE.test(value)) return `rgb(${this.fromHex(value)})`

		// Bare channels: comma-separated or space-separated digits
		// Comma-separated: "255,0,0" or "255, 0, 0"
		if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(value)) {
			const parts = value.split(',').map((s) => s.trim())
			return `rgb(${parts.join(', ')})`
		}
		// Space-separated: "255 0 0"
		if (/^\d+\s+\d+\s+\d+$/.test(value)) {
			const parts = value.trim().split(/\s+/)
			return `rgb(${parts.join(', ')})`
		}

		// Named color or other — pass through
		return value
	}
}

// ── HSL adapter ─────────────────────────────────────────────────────────

export class HslColorSpace extends ColorSpace {
	get name() {
		return 'hsl'
	}

	get mixSpace() {
		return 'srgb'
	}

	get fn() {
		return 'hsl'
	}

	fromHex(hex) {
		return hexToHsl(hex)
	}

	wrap(value) {
		if (typeof value !== 'string') return value

		// Already wrapped
		if (value.startsWith('hsl(') || value.startsWith('hsla(')) return value

		// Hex
		if (HEX_RE.test(value)) return `hsl(${this.fromHex(value)})`

		// Bare channels: "H S% L%" pattern (number, space, number%, space, number%)
		if (/^\d+\s+\d+%\s+\d+%$/.test(value)) {
			return `hsl(${value})`
		}

		// Named color or other — pass through
		return value
	}
}

// ── OKLCH adapter ───────────────────────────────────────────────────────

export class OklchColorSpace extends ColorSpace {
	get name() {
		return 'oklch'
	}

	get mixSpace() {
		return 'oklch'
	}

	get fn() {
		return 'oklch'
	}

	fromHex(hex) {
		return hexToOklch(hex)
	}

	wrap(value) {
		if (typeof value !== 'string') return value

		// Already wrapped
		if (value.startsWith('oklch(')) return value

		// Hex
		if (HEX_RE.test(value)) return `oklch(${this.fromHex(value)})`

		// Bare channels: three space-separated numbers (may contain decimals)
		if (/^[\d.]+\s+[\d.]+\s+[\d.]+$/.test(value)) {
			return `oklch(${value})`
		}

		// Named color or other — pass through
		return value
	}
}

// ── Factory ─────────────────────────────────────────────────────────────

/**
 * Factory method to create a ColorSpace adapter by name.
 * @param {string} space - 'rgb', 'hsl', or 'oklch'
 * @returns {ColorSpace}
 */
ColorSpace.create = function create(space) {
	switch (space) {
		case 'rgb':
			return new RgbColorSpace()
		case 'hsl':
			return new HslColorSpace()
		case 'oklch':
			return new OklchColorSpace()
		default:
			throw new Error(`Unknown color space: ${space}`)
	}
}
