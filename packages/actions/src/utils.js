/*
 * Generic action handler for keyboard events.
 *
 * @param {Record<string, () => void>} actions
 * @param {KeyboardEvent} event
 */
export function handleAction(actions, event) {
	if (event.key in actions) {
		event.preventDefault()
		event.stopPropagation()
		actions[event.key]()
	}
}

/**
 *  Maps keys to actions based on the configuration.
 *
 * @param {import('./types').NavigableOptions} options
 * @param {import('./types').NavigableHandlers} handlers
 */
export function getKeyboardActions(options, handlers) {
	if (!options.enabled) return {}

	const movement = options.horizontal
		? { ArrowLeft: handlers.previous, ArrowRight: handlers.next }
		: { ArrowUp: handlers.previous, ArrowDown: handlers.next }
	const change = options.nested
		? options.horizontal
			? { ArrowUp: handlers.collapse, ArrowDown: handlers.expand }
			: { ArrowLeft: handlers.collapse, ArrowRight: handlers.expand }
		: {}
	return {
		Enter: handlers.select,
		' ': handlers.select,
		...movement,
		...change
	}
}
