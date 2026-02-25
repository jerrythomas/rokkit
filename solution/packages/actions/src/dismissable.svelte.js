import { on } from 'svelte/events'
const KEYCODE_ESC = 27

/**
 * A svelte action function that captures clicks outside the element or escape keypress
 * emits a `dismiss` event. This is useful for closing a modal or dropdown.
 *
 * @param {HTMLElement} node
 */
export function dismissable(node) {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('dismiss'))
		}
	}

	const keyup = (event) => {
		if (event.keyCode === KEYCODE_ESC || event.key === 'Escape') {
			event.stopPropagation()
			node.dispatchEvent(new CustomEvent('dismiss', { detail: node }))
		}
	}

	$effect(() => {
		const cleanupClickEvent = on(document, 'click', handleClick)
		const cleanupKeyupEvent = on(document, 'keyup', keyup)

		return () => {
			cleanupClickEvent()
			cleanupKeyupEvent()
		}
	})
}
