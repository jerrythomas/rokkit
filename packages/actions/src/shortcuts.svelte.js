import { on } from 'svelte/events'

const TYPEABLE = /^(input|textarea|select)$/i

function inEditable() {
	const el = document.activeElement
	if (!el) return false
	if (el.isContentEditable) return true
	return TYPEABLE.test(el.tagName)
}

/**
 * Global keyboard-shortcut capture. Resolves each keydown against a command
 * registry and dispatches the match. Takes the registry as its parameter so
 * `@rokkit/actions` stays independent of `@rokkit/states`.
 *
 * @param {HTMLElement} node
 * @param {{ resolve: (e: KeyboardEvent) => (null | { id: string, global?: boolean }), execute: (id: string) => void }} registry
 */
export function shortcuts(node, registry) {
	let current = registry

	const handleKeydown = (event) => {
		if (!current?.resolve) return
		const cmd = current.resolve(event)
		if (!cmd) return
		if (inEditable() && !cmd.global) return
		event.preventDefault()
		current.execute(cmd.id)
	}

	$effect(() => {
		current = registry
		const cleanup = on(window, 'keydown', handleKeydown)
		return () => cleanup()
	})
}
