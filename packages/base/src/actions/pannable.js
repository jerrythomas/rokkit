export function pannable(node) {
	let x
	let y

	function track(event, name, delta = {}) {
		x = event.clientX
		y = event.clientY

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
	}

	function handleMousemove(event) {
		const dx = event.clientX - x
		const dy = event.clientY - y

		track(event, 'panmove', { dx, dy })
	}

	function handleMouseup(event) {
		track(event, 'panend')

		window.removeEventListener('mousemove', handleMousemove)
		window.removeEventListener('mouseup', handleMouseup)
	}

	node.addEventListener('mousedown', handleMousedown)

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown)
		}
	}
}
