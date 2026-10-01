/**
 * What a control reports: the value of the choice the reader made, and nothing else.
 *
 * A button names its choice in `data-graph-choice`; a `<select>` reports its value on change.
 * The control maps the string back to its own type and calls its `onchange` — so no button
 * carries a handler, and a disabled choice never fires.
 */
import type { ActionReturn } from 'svelte/action'
import { listen } from './listen.js'

export type ChoicesParams = { onchoose: (value: string) => void }

export function choices(root: HTMLElement, initial: ChoicesParams): ActionReturn<ChoicesParams> {
	let params = initial
	const stop = listen(root, {
		click(event: MouseEvent) {
			const chosen = (event.target as Element).closest<HTMLButtonElement>('[data-graph-choice]')
			if (!chosen || !root.contains(chosen) || chosen.disabled) return
			params.onchoose(chosen.getAttribute('data-graph-choice') ?? '')
		},
		change(event: Event) {
			const target = event.target as HTMLSelectElement
			if (target.tagName === 'SELECT') params.onchoose(target.value)
		}
	})
	return {
		update(next) {
			params = next
		},
		destroy: stop
	}
}
