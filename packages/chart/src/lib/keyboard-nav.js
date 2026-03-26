/**
 * Svelte action: arrow key navigation between sibling data elements within a geom.
 *
 * When applied to a focusable SVG element with `enabled=true`, ArrowLeft/ArrowRight
 * move focus between elements sharing the same `[data-plot-geom]` container.
 *
 * Usage: `<circle use:keyboardNav={keyboard} ...>`
 *
 * @param {Element} node
 * @param {boolean} enabled
 */
export function keyboardNav(node, enabled) {
	function handleKeydown(e) {
		if (!enabled) return
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
		const container = node.closest('[data-plot-geom]')
		if (!container) return
		const elements = [...container.querySelectorAll('[data-plot-element]')].filter(
			(el) => /** @type {HTMLElement|SVGElement} */ (el).tabIndex >= 0
		)
		const idx = elements.indexOf(node)
		if (idx === -1) return
		const nextIdx =
			e.key === 'ArrowRight' ? Math.min(idx + 1, elements.length - 1) : Math.max(idx - 1, 0)
		if (nextIdx !== idx) {
			e.preventDefault()
			/** @type {HTMLElement|SVGElement} */ (elements[nextIdx]).focus()
		}
	}
	node.addEventListener('keydown', handleKeydown)
	return {
		update(newEnabled) {
			enabled = newEnabled
		},
		destroy: () => node.removeEventListener('keydown', handleKeydown)
	}
}
