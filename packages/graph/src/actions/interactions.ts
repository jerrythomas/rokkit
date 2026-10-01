/**
 * Every press on the graph, through one delegated listener.
 *
 * The state writes what a press MEANS onto the element — `data-graph-press` for a click (and
 * Enter / Space), `data-graph-open` for a double-click, `data-graph-key` for what it is about —
 * and this reads it back and calls `state.act`. No element carries a handler of its own, so a
 * new interactive element is an attribute, and the whole mapping is testable on bare DOM.
 *
 * The innermost intent wins: an "Expand" control inside a card is its own press, not the card's.
 */
import type { ActionReturn } from 'svelte/action'
import { isIntent } from '../state/intents.js'
import type { Intent } from '../state/intents.js'
import { listen } from './listen.js'

export type InteractionsParams = {
	state: { act(intent: Intent, key: string | null): void }
	/** A click on nothing interactive, or Escape, clears the selection — the canvas does this. */
	clearOnBackground?: boolean
}

const PRESS = '[data-graph-press]'
const OPEN = '[data-graph-open]'

/** The innermost element inside `root` that carries `selector`, from the event's target. */
function carrier(root: HTMLElement, event: Event, selector: string): HTMLElement | null {
	const found = (event.target as Element | null)?.closest<HTMLElement>(selector) ?? null
	return found && root.contains(found) ? found : null
}

/** Act on the intent `element` declares under `attribute`, if it is one the state knows. */
function perform(params: InteractionsParams, element: HTMLElement, attribute: string): void {
	const intent = element.getAttribute(attribute)
	if (isIntent(intent)) params.state.act(intent, element.getAttribute('data-graph-key'))
}

const isActivation = (event: KeyboardEvent) => event.key === 'Enter' || event.key === ' '

/** The three delegated listeners, reading the latest params on every event. */
function handlers(root: HTMLElement, params: () => InteractionsParams) {
	return {
		click(event: MouseEvent) {
			const pressed = carrier(root, event, PRESS)
			if (pressed) perform(params(), pressed, 'data-graph-press')
			else if (params().clearOnBackground) params().state.act('clear', null)
		},
		dblclick(event: MouseEvent) {
			const opened = carrier(root, event, OPEN)
			if (opened) perform(params(), opened, 'data-graph-open')
		},
		keydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				if (params().clearOnBackground) params().state.act('clear', null)
				return
			}
			const pressed = carrier(root, event, PRESS)
			// A real <button> turns Enter and Space into a click by itself; acting here too would
			// press it twice.
			if (!pressed || pressed.tagName === 'BUTTON' || !isActivation(event)) return
			event.preventDefault()
			perform(params(), pressed, 'data-graph-press')
		}
	}
}

export function interactions(
	root: HTMLElement,
	initial: InteractionsParams
): ActionReturn<InteractionsParams> {
	let params = initial
	const stop = listen(root, handlers(root, () => params))
	return {
		update(next) {
			params = next
		},
		destroy: stop
	}
}
