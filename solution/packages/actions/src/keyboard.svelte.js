import { on } from 'svelte/events'
import { getClosestAncestorWithAttribute, getEventForKey } from './utils.js'

/**
 * Default key mappings
 * @type {import('./types.js').KeyboardConfig}
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
 * @param {import('./types.js').KeyboardConfig} options - Custom key mappings
 */
export function keyboard(root, options = null) {
	const keyMappings = options ?? defaultKeyMappings

	/**
	 * Handle keyboard events
	 *
	 * @param {KeyboardEvent} event
	 */
	const keyup = (event) => {
		const { key } = event

		const eventName = getEventForKey(keyMappings, key)
		// verify that the target is a child of the root element?
		if (eventName) {
			root.dispatchEvent(new CustomEvent(eventName, { detail: key }))
		}
	}

	const click = (event) => {
		const node = getClosestAncestorWithAttribute(event.target, 'data-key')

		if (node) {
			const key = node.getAttribute('data-key')
			const eventName = getEventForKey(keyMappings, key)

			if (eventName) {
				root.dispatchEvent(new CustomEvent(eventName, { detail: key }))
			}
		}
	}

	$effect(() => {
		const cleanupKeyupEvent = on(root, 'keyup', keyup)
		const cleanupClickEvent = on(root, 'click', click)
		return () => {
			cleanupKeyupEvent()
			cleanupClickEvent()
		}
	})
}
