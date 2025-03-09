<script>
	import { createEmitter, noop } from '@rokkit/core'
	import { defaultMapping } from './constants'
	import { listItems } from './snippets.svelte'
	import { onMount } from 'svelte'
	import { DataWrapper } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'

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

	let wrapper = new DataWrapper(items, mapping, value, { events: emitter })
</script>

<rk-list class={classes} role="listbox" aria-label={name} use:navigator={{ wrapper }} {tabindex}>
	{@render children?.()}
	{@render listItems(wrapper.data, mapping, value, hierarchy, emitter.change)}
	<!-- <ListItems bind:items {mapping} {hierarchy} /> -->
</rk-list>
