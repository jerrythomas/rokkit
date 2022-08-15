const KEYCODE_ESC = 27

export function dismissable(node) {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('dismiss', node))
		}
	}
	const keyup = (event) => {
		if (event.keyCode === KEYCODE_ESC) {
			node.dispatchEvent(new CustomEvent('dismiss', node))
		}
	}

	document.addEventListener('click', handleClick, true)
	document.addEventListener('keyup', keyup, true)

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true)
			document.removeEventListener('keyup', keyup, true)
		}
	}
}
