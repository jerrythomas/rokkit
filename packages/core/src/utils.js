import { has, isNil } from 'ramda'
import { DATA_IMAGE_REGEX, ITEM_SNIPPET } from './constants'

let idCounter = 0

/**
 * RTL language codes (ISO 639-1)
 * @type {string[]}
 */
const RTL_LANGUAGES = [
	'ar', // Arabic
	'he', // Hebrew
	'fa', // Persian/Farsi
	'ur', // Urdu
	'yi', // Yiddish
	'ps', // Pashto
	'sd', // Sindhi
	'ug', // Uyghur
	'ku', // Kurdish (Sorani)
	'dv' // Divehi/Maldivian
]

/**
 * Checks dir/lang attributes of the html element for RTL
 * @returns {'ltr' | 'rtl'}
 */
function dirFromHtmlElement() {
	const htmlDir = document.documentElement.getAttribute('dir')
	if (htmlDir === 'rtl' || htmlDir === 'ltr') return htmlDir

	const lang = document.documentElement.getAttribute('lang')
	const primaryLang = lang ? lang.split('-')[0].toLowerCase() : ''
	return RTL_LANGUAGES.includes(primaryLang) ? 'rtl' : 'ltr'
}

/**
 * Detects text direction based on HTML lang attribute
 * @returns {'ltr' | 'rtl'}
 */
export function detectDirection() {
	if (typeof document === 'undefined') return 'ltr'
	return dirFromHtmlElement()
}

/**
 * Checks if current document direction is RTL
 * @returns {boolean}
 */
export function isRTL() {
	return detectDirection() === 'rtl'
}
/**
 * Finds the closest ancestor of the given element that has the given attribute.
 *
 * @param {HTMLElement} element
 * @param {string} attribute
 * @returns {HTMLElement|null}
 */
export function getClosestAncestorWithAttribute(element, attribute) {
	if (!element) return null
	if (element.getAttribute(attribute)) return element
	return getClosestAncestorWithAttribute(element.parentElement, attribute)
}

/**
 * A function that performs no operations.
 */
export function noop() {
	// intentionally empty to support default actions
}

/**
 * Generates a random id
 *
 * @returns {string} A random id
 */
export function id(prefix = '') {
	return [prefix, Math.random().toString(36).substring(2, 9), ++idCounter]
		.filter((x) => !isNil(x) && x !== '')
		.join('-')
}

/**
 * Check if a value is a json object
 *
 * @param {*} val
 * @returns {boolean}
 */
export function isObject(val) {
	return typeof val === 'object' && !isNil(val) && !(val instanceof Date)
}

/**
 * Converts the value to a string. If the value is an object, it will convert it to a JSON string.
 *
 * @param {*} value
 * @returns {string}
 */
export function toString(value) {
	if (value === null || value === undefined) return value
	if (isObject(value)) return JSON.stringify(value, null, 2)
	return value.toString()
}

/**
 * Generates icon shortcuts for a collection of icons
 *
 * @param {string[]} icons
 * @param {string} collection
 * @param {string} variants
 * @returns {Object}
 */
export function iconShortcuts(icons, collection, variants) {
	const suffix = variants ? `-${variants}` : ''
	const shortcuts = !collection
		? {}
		: icons.reduce(
				(acc, name) => ({
					...acc,
					[name]: [collection, name].join(':') + suffix
				}),
				{}
			)

	return shortcuts
}

/**
 * Scales the path by the size
 *
 * @param {number} size
 * @param {string|number} x
 * @returns {string|number}
 */
export function scaledPath(size, x) {
	if (Array.isArray(x)) return x.map((v) => scaledPath(size, v)).join(' ')
	return typeof x === 'number' ? x * size : x
}

/**
 * Gets a key string from path
 * @param {string[]} path
 * @returns {string}
 */
export function getKeyFromPath(path) {
	return Array.isArray(path) ? path.join('-') : [path].join('-')
}

/**
 * Gets a path array from key string
 * @param {string} key
 * @returns {string[]}
 */
export function getPathFromKey(key) {
	return key.split('-').map(Number)
}

/**
 * Get snippet function from an object
 * @param {Object} obj
 * @param {string} key
 * @param {null|Function} defaultSnippet
 * @returns {Function|undefined}
 */
export function getSnippet(obj, key, defaultSnippet = null) {
	if (has(key, obj) && typeof obj[key] === 'function') {
		return obj[key]
	}
	return defaultSnippet
}

/**
 * Resolve which snippet to render for a proxy item.
 *
 * Checks proxy.snippet for a per-item named override first (e.g. item.snippet = 'highlighted').
 * Falls back to the component-level fallback snippet name (e.g. 'itemContent' / 'groupContent').
 * Returns null if neither is found.
 *
 * @param {Record<string, unknown>} snippets  - snippets passed to the component
 * @param {{ snippet?: string | null }} proxy  - any object with an optional .snippet property
 * @param {string} [fallback]                  - fallback snippet name; defaults to ITEM_SNIPPET ('itemContent')
 * @returns {Function | null}
 */
/**
 * @param {unknown} value
 * @returns {Function|null}
 */
function asSnippet(value) {
	return typeof value === 'function' ? value : null
}

export function resolveSnippet(snippets, proxy, fallback = ITEM_SNIPPET) {
	const name = proxy && proxy.snippet
	return asSnippet(name && snippets[name]) || asSnippet(snippets[fallback])
}

/**
 * convert hex string to `{r},{g},{b}`
 * @param {string} hex
 * @return {string}
 */
export function hex2rgb(hex) {
	const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16))
	return `${r},${g},${b}`
}

/**
 * Convert sRGB component (0-255) to linear RGB.
 * @param {number} c - sRGB value 0-255
 * @returns {number}
 */
function srgbToLinear(c) {
	const s = c / 255
	return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/**
 * Convert linear RGB to sRGB component (0-255).
 * @param {number} c - linear value 0-1
 * @returns {number}
 */
function linearToSrgb(c) {
	const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
	return Math.round(Math.max(0, Math.min(255, s * 255)))
}

// CSS Color Level 4 two-step matrices (via XYZ D65) for round-trip fidelity.
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
// OKLab → LMS^(1/3)
const OKLAB_TO_LMS3 = [
	[1.0, 0.3963377774, 0.2158037573],
	[1.0, -0.1055613458, -0.0638541728],
	[1.0, -0.0894841775, -1.291485548]
]
// LMS → XYZ D65
const LMS_TO_XYZ = [
	[1.2270138511, -0.5577999807, 0.281256149],
	[-0.0405801784, 1.1122568696, -0.0716766787],
	[-0.0763812845, -0.4214819784, 1.5861632204]
]
// XYZ D65 → linear sRGB
const XYZ_TO_SRGB = [
	[3.2409699419, -1.5373831776, -0.4986107603],
	[-0.9692436363, 1.8759675015, 0.0415550574],
	[0.0556300797, -0.2039769589, 1.0569715142]
]

/** @param {number[][]} m @param {number[]} v */
function matMul(m, v) {
	return m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2])
}

/**
 * Convert hex string to OKLCH components: `{L} {C} {H}`
 * Uses CSS Color Level 4 two-step conversion via XYZ D65 for precision.
 * @param {string} hex - 6-digit hex color (with or without #)
 * @returns {string} space-separated OKLCH components for CSS `oklch(L C H / alpha)`
 */
export function hex2oklch(hex) {
	const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16))
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

/**
 * Convert OKLCH components back to hex string.
 * Uses CSS Color Level 4 two-step conversion via XYZ D65 for precision.
 * @param {number} L - Lightness 0-1
 * @param {number} C - Chroma >= 0
 * @param {number} H - Hue 0-360 degrees
 * @returns {string} hex color string (#rrggbb)
 */
export function oklch2hex(L, C, H) {
	const hRad = (H * Math.PI) / 180
	const lab = [L, C * Math.cos(hRad), C * Math.sin(hRad)]

	const lms3 = matMul(OKLAB_TO_LMS3, lab)
	const lms = [lms3[0] ** 3, lms3[1] ** 3, lms3[2] ** 3]
	const xyz = matMul(LMS_TO_XYZ, lms)
	const lin = matMul(XYZ_TO_SRGB, xyz)

	const toHex = (n) => {
		const hex = linearToSrgb(n).toString(16)
		return hex.length === 1 ? `0${hex}` : hex
	}
	return `#${toHex(lin[0])}${toHex(lin[1])}${toHex(lin[2])}`
}

/**
 * Convert hex string to HSL components: `{H} {S}% {L}%`
 * @param {string} hex - 6-digit hex color (with or without #)
 * @returns {string} space-separated HSL components for CSS `hsl(H S% L% / alpha)`
 */
export function hex2hsl(hex) {
	const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16))

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

	const Hr = Math.round(h * 360)
	const Sr = Math.round(s * 100)
	const Lr = Math.round(l * 100)

	return `${Hr} ${Sr}% ${Lr}%`
}

/** @typedef {'rgb' | 'hsl' | 'oklch'} ColorSpace */

/**
 * Convert a hex color to the component format for a given color space.
 * - rgb:   "r,g,b"          → for `rgba(var(--x), alpha)`
 * - hsl:   "H S% L%"        → for `hsl(var(--x) / alpha)`
 * - oklch: "L C H"           → for `oklch(var(--x) / alpha)`
 *
 * @param {string} hex - 6-digit hex color (#rrggbb)
 * @param {ColorSpace} space
 * @returns {string}
 */
export function hexToComponents(hex, space) {
	switch (space) {
		case 'hsl':
			return hex2hsl(hex)
		case 'oklch':
			return hex2oklch(hex)
		case 'rgb':
		default:
			return hex2rgb(hex)
	}
}

/**
 * Convert a CSS color value to r,g,b for use in CSS variables.
 * Hex values (#rrggbb) are converted to "r,g,b" for rgba() support.
 * All other CSS color formats (oklch, hsl, named) are returned as-is.
 * Non-string values are returned unchanged.
 * Note: non-hex values will NOT work with UnoCSS opacity utilities like bg-primary/50.
 *
 * @param {unknown} value
 * @param {ColorSpace} [space]
 * @returns {unknown}
 */
export function colorToRgb(value, space) {
	if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) {
		return space ? hexToComponents(value, space) : hex2rgb(value)
	}
	return value
}

/**
 * Checks if a string is a valid image URL
 *
 * @param {string} str - The string to check
 * @returns {boolean} - Returns true if the string is an image URL
 */
function isImageUrl(str) {
	// Fallback regex-based validation
	const fallbackValidation = () => {
		const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)(\?.*)?$/i
		return urlRegex.test(str)
	}

	// Check if the string looks like a URL
	try {
		// Use browser-native URL constructor if available
		if (typeof URL !== 'undefined') {
			const url = new URL(str)
			// Only accept HTTP/HTTPS protocols
			if (url.protocol !== 'http:' && url.protocol !== 'https:') {
				return false
			}
			// Check common image extensions
			const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff']
			const path = url.pathname.toLowerCase()
			return imageExtensions.some((ext) => path.endsWith(ext))
		}

		// Fallback if URL constructor is not available
		return fallbackValidation()
	} catch {
		// Fallback if URL constructor fails
		return fallbackValidation()
	}
}
/**
 * A utility function that detects if a string is an image URL or image data (base64)
 *
 * @param {string} str - The string to check
 * @returns {string|null} - Returns the original string if it's an image URL or image data, otherwise null
 */
export function getImage(str) {
	if (DATA_IMAGE_REGEX.test(str)) return str
	// Check if it's a URL

	if (isImageUrl(str)) return str

	return null
}
