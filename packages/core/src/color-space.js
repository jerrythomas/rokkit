/**
 * ColorSpace adapter strategy pattern.
 *
 * Each adapter knows how to convert hex colors to its own representation,
 * wrap bare channels into a complete CSS color function, and produce
 * `color-mix()` expressions for theme variables with alpha support.
 */

// ── Hex parsing helper ──────────────────────────────────────────────────

/**
 * Parse a hex string (#rrggbb) into [r, g, b] integers.
 * @param {string} hex
 * @returns {number[]}
 */
function parseHex(hex) {
	return hex.match(/\w\w/g).map((x) => parseInt(x, 16))
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
	fromHex(hex) {
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
	wrap(value) {
		throw new Error('Subclass must implement wrap')
	}

	/**
	 * Produce a color-mix expression for theme CSS variables with alpha support.
	 * @param {string} varName - CSS variable name (e.g. '--color-primary-500')
	 * @returns {string}
	 */
	themeColor(varName) {
		return `color-mix(in ${this.mixSpace}, var(${varName}) <alpha-value>%, transparent)`
	}

	/**
	 * Factory method to create a ColorSpace adapter by name.
	 * @param {string} space - 'rgb', 'hsl', or 'oklch'
	 * @returns {ColorSpace}
	 */
	static create(space) {
		switch (space) {
			case 'rgb':
				return new RgbColorSpace()
			default:
				throw new Error(`Unknown color space: ${space}`)
		}
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
