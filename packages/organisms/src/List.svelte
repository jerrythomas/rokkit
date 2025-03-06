<script>
	import { createEmitter, noop } from '@rokkit/core'
	import { defaultMapping } from '@rokkit/molecules/constants'
	import { listItems } from './snippets.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [name]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {any} [value]
	 * @property {number} [tabindex]
	 * @property {any} [hierarchy]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		name = 'list',
		items = $bindable([]),
		mapping = defaultMapping,
		value = $bindable(null),
		tabindex = 0,
		hierarchy = [],
		children,
		...events
	} = $props()
	let cursor = $state([])

	let emitter = createEmitter(events, ['select', 'change'])
	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path
		emitter.select({ item: value, indices: cursor })
	}
</script>

<rk-list
	class={classes}
	role="listbox"
	aria-label={name}
	onmove={handleNav}
	onselect={handleNav}
	{tabindex}
>
	{@render children?.()}
	{@render listItems(items, mapping, value, hierarchy, emitter.change)}
	<!-- <ListItems bind:items {mapping} {hierarchy} /> -->
</rk-list>
