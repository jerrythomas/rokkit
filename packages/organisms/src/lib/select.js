export function getListPosition(anchor, viewport) {
	if (typeof window === 'undefined' || !anchor || !viewport) return ''

	let { top, left, width, height } = anchor.getBoundingClientRect()

	const { width: viewportWidth, height: viewportHeight } =
		viewport.getBoundingClientRect()

	top += window.scrollX
	left += window.scrollY
	let pos = ''
	if (left + viewportWidth > window.innerWidth) {
		pos += `right: ${window.innerWidth - left - width}px;`
	} else pos += `left: ${left}px;`

	if (top + viewportHeight > window.innerHeight) {
		pos += `bottom: ${window.innerHeight - top}px;`
	} else pos += `top: ${top + height}px;`

	return pos
}
