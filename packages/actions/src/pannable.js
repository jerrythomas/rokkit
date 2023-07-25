/**
 * Handle drag and move events
 *
 * @param {HTMLElement} node
 * @returns {import('./types').SvelteActionReturn}
 */
export function pannable(node) {
	let x
	let y

	function track(event, name, delta = {}) {
		x = event.clientX || event.touches[0].clientX
		y = event.clientY || event.touches[0].clientY
		event.stopPropagation()
		event.preventDefault()
		node.dispatchEvent(
			new CustomEvent(name, {
				detail: { x, y, ...delta }
			})
		)
	}

	function handleMousedown(event) {
		track(event, 'panstart')
		window.addEventListener('mousemove', handleMousemove)
		window.addEventListener('mouseup', handleMouseup)
		window.addEventListener('touchmove', handleMousemove, { passive: false })
		window.addEventListener('touchend', handleMouseup)
	}

	function handleMousemove(event) {
		const dx = (event.clientX || event.touches[0].clientX) - x
		const dy = (event.clientY || event.touches[0].clientY) - y

		track(event, 'panmove', { dx, dy })
	}

	function handleMouseup(event) {
		track(event, 'panend')

		window.removeEventListener('mousemove', handleMousemove)
		window.removeEventListener('mouseup', handleMouseup)
		window.removeEventListener('touchmove', handleMousemove)
		window.removeEventListener('touchend', handleMouseup)
	}

	node.addEventListener('mousedown', handleMousedown)
	node.addEventListener('touchstart', handleMousedown, { passive: false })

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown)
			node.removeEventListener('touchstart', handleMousedown)
		}
	}
}
