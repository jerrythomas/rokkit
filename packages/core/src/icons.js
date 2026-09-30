/** Icons: shortcut maps for a collection, class-vs-literal detection, image sources. */
import { DATA_IMAGE_REGEX } from './constants'

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
 * Detects whether an icon value is a CSS class or a literal character
 * (kanji, emoji, single letter, etc.).
 *
 * Anything more than one grapheme is treated as a class — including bare
 * semantic names like `file-svelte` which UnoCSS expands to the configured
 * icon collection via `iconShortcuts(DEFAULT_ICONS, …)`. Single characters
 * (kanji, emoji, single letters) render as literal text.
 *
 * @param {string | null | undefined} icon
 * @returns {boolean} true if icon should render as a CSS class
 */
export function isIconClass(icon) {
	if (!icon || typeof icon !== 'string') return false
	// Spread to count graphemes, not UTF-16 code units, so multi-codepoint
	// emoji (e.g. 👨‍👩‍👧‍👦) and single CJK characters don't get misread.
	return [...icon].length > 1
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
