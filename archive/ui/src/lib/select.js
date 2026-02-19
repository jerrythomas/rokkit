/**
 * Generate the CSS position properties and values based on the anchor and viewport dimensions.
 *
 * @param {DOMRect} bounds - The bounding rectangle of the anchor element.
 * @param {HTMLElement} viewport - The viewport element that determines the position.
 * @returns {string} - A string with CSS position properties and values.
 */
function generatePositionCSS(bounds, viewport) {
	const { width: viewportWidth, height: viewportHeight } = viewport.getBoundingClientRect()
	let pos = ''
	if (bounds.left + viewportWidth > window.innerWidth) {
		pos += `right: ${window.innerWidth - bounds.left - bounds.width}px;`
	} else pos += `left: ${bounds.left}px;`

	if (bounds.top + viewportHeight > window.innerHeight) {
		pos += `bottom: ${window.innerHeight - bounds.top}px;`
	} else pos += `top: ${bounds.top + bounds.height}px;`

	return pos
}

/**
 * Get the optimal position for the list based on anchor and viewport dimensions.
 *
 * @param {HTMLElement} anchor - The anchor element to position the list relative to.
 * @param {HTMLElement} viewport - The viewport element that determines the position.
 * @returns {string} - A string with CSS position properties and values.
 */
export function getListPosition(anchor, viewport) {
	if (typeof window === 'undefined' || !anchor || !viewport) return ''

	const bounds = anchor.getBoundingClientRect()

	bounds.top += window.scrollX
	bounds.left += window.scrollY

	return generatePositionCSS(bounds, viewport)
}
