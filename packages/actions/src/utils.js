export function handleAction(actions, event) {
	if (event.key in actions) {
		event.preventDefault()
		event.stopPropagation()
		actions[event.key]()
	}
}

export function getKeyboardActions(node, options, handlers) {
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
