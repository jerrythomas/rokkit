import { theme } from '../stores'

/**
 * Sets theme level classes based on the theme store
 *
 * @param {HTMLElement} node
 */
export function themable(node) {
	let previous = { name: 'none', mode: 'light' }

	theme.subscribe((data) => {
		Object.values(previous)
			.filter((theme) => typeof theme === 'string')
			.map((theme) => node.classList.remove(theme.toLowerCase()))
		Object.values(data)
			.filter((theme) => typeof theme === 'string')
			.map((theme) => node.classList.add(theme.toLowerCase()))

		previous = data
	})
}
