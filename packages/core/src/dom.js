/** DOM reads: the document's text direction, and attribute lookups up the tree. */

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
