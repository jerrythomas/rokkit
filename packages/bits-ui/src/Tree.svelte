<script>
	import { createEmitter } from '@rokkit/core'
	import { omit, has } from 'ramda'

	// Import composable components
	import * as Tree from './tree'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<any>} [items]
	 * @property {any} [value]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {import('./types').NodeStateIcons|Object} [icons]
	 * @property {boolean} [autoCloseSiblings=false]
	 * @property {boolean} [multiselect=false]
	 * @property {Function} [header]
	 * @property {Function} [footer]
	 * @property {Function} [empty]
	 * @property {Function} [stub]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = 'h-full overflow-scroll flex flex-col',
		items = $bindable([]),
		value = $bindable(null),
		fields,
		icons = {},
		autoCloseSiblings = false,
		multiselect = false,
		header,
		footer,
		empty,
		stub,
		...events
	} = $props()

	let emitter = createEmitter(events, ['select', 'move', 'toggle'])
	let snippets = omit(['onselect', 'onmove', 'ontoggle'], events)

	function handleSelect(event) {
		value = event.detail.value
		if (has('select', emitter)) emitter.select(event.detail)
	}

	function handleToggle(event) {
		if (has('toggle', emitter)) emitter.toggle(event.detail)
	}

	function handleMove(event) {
		if (has('move', emitter)) emitter.move(event.detail)
	}
</script>

{#snippet nodeIcon(expanded)}
	{#if expanded}
		<Icon name={icons.opened} />
	{:else}
		<Icon name={icons.closed} />
	{/if}
{/snippet}

<Tree.Root
	class={classes}
	onSelect={handleSelect}
	onToggle={handleToggle}
	onMove={handleMove}
	{...snippets}
>
	<Tree.Viewport>
		{#if items.length === 0}
			<Tree.Empty>
				{@render empty?.()}
			</Tree.Empty>
		{:else}
			<Tree.Recursive {items} {nodeIcon}></Tree.Recursive>
		{/if}
	</Tree.Viewport>
</Tree.Root>
