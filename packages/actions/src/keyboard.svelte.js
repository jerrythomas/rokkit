import { on } from 'svelte/events'

/**
 * Default key mappings
 */
const defaultKeyMappings = {
	remove: ['Backspace', 'Delete'],
	submit: ['Enter'],
	add: /^[a-zA-Z]$/
}

/**
 * Handle keyboard events
 *
 * @param {HTMLElement} root
 * @param {Object} options - Custom key mappings
 */
export function keyboard(root, options = {}) {
	const keyMappings = { ...defaultKeyMappings, ...options }

	/**
	 * Handle keyboard events
	 *
	 * @param {KeyboardEvent} event
	 */
	const keyup = (event) => {
		const { key } = event
		console.log('keyup', key)
		for (const [eventName, keys] of Object.entries(keyMappings)) {
			if (Array.isArray(keys) && keys.includes(key)) {
				root.dispatchEvent(new CustomEvent(eventName, { detail: key }))
			} else if (keys instanceof RegExp && keys.test(key)) {
				root.dispatchEvent(new CustomEvent(eventName, { detail: key }))
			}
		}
	}

	$effect(() => {
		// console.log('here')
		const cleanupKeyupEvent = on(document, 'keyup', keyup)
		// document.addEventListener('keyup', keyup)
		// console.log('here 2')
		return () => {
			cleanupKeyupEvent()
			// document.removeEventListener('keyup', keyup)
		}
	})
}
