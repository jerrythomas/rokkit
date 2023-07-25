import { theme } from '@rokkit/stores'

/**
 * A svelte action function that adds theme classes to the element
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

/**
 * Switch the class on the node
 *
 * @param {HTMLElement} node
 * @param {string} current
 * @param {string} previous
 * @returns
 */
function switchClass(node, current, previous) {
	if (current && current !== previous) {
		node.classList.remove(previous)
		node.classList.add(current)
	}
}
