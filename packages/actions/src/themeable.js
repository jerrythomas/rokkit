import { theme } from '@rokkit/stores'

/**
 * Sets theme level classes based on the theme store
 *
 * @param {HTMLElement} node
 */
export function themable(node) {
	let previous = {}

	theme.subscribe((data) => {
		switchClass(node, data.name, previous.name)
		switchClass(node, data.mode, previous.mode)

		previous = data
	})
}

function switchClass(node, current, previous) {
	if (current && current !== previous) {
		node.classList.remove(previous)
		node.classList.add(current)
	}
}
