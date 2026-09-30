/** Colour conversion: hex ↔ `r,g,b` and hex ↔ OKLCH (CSS Color Level 4, via XYZ D65). */

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
