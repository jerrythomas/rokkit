import { theme } from '../stores'

/**
 * Sets theme level classes based on the theme store
 *
 * @param {HTMLElement} node
 */
export function themable(node) {
	let previous = {}
	node.style.visibility = 'hidden'
	node.style.setProperty('--viewport-height', window.innerHeight + 'px')
	node.style.visibility = 'visible'
	theme.subscribe((data) => {
		if (data.name && data.name !== previous.name) {
			node.classList.remove(previous.name)
			node.classList.add(data.name)
		}
		if (data.mode && data.mode !== previous.mode) {
			node.classList.remove(previous.mode)
			node.classList.add(data.mode)
		}

		previous = data
	})
}
