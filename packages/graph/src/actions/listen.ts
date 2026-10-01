/** Attach every listener in `listeners` to `target`; the returned function detaches them all. */
export function listen(
	target: EventTarget,
	listeners: Record<string, (event: never) => void>,
	options?: AddEventListenerOptions
): () => void {
	const entries = Object.entries(listeners) as [string, EventListener][]
	for (const [type, listener] of entries) target.addEventListener(type, listener, options)
	return () => {
		for (const [type, listener] of entries) target.removeEventListener(type, listener, options)
	}
}
