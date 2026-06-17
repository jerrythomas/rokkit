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
 * Handle keyboard events.
 *
 * The dispatched event names are derived from the keys of the supplied
 * `KeyboardConfig` (e.g. a config of `{ prev, next }` dispatches `prev`/`next`),
 * so the third Action generic declares an open-ended set of `on*` CustomEvent
 * attributes so consumers using `use:keyboard onprev={...}` type-check.
 *
 * @type {import('svelte/action').Action<HTMLElement, import('./types.js').KeyboardConfig | null | undefined, Record<`on${string}`, (event: CustomEvent<string>) => void>>}
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
