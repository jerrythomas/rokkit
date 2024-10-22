<script>
	import { run } from 'svelte/legacy';

	import { identity } from 'ramda'
	import { getComponent, defaultFields } from '@rokkit/core'
	import { Connector, Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'

	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} value
	 * @property {any} [fields]
	 * @property {any} [formatter]
	 * @property {any} [using]
	 * @property {any} [levels]
	 * @property {boolean} [isParent]
	 * @property {boolean} [isExpanded]
	 * @property {number} [depth]
	 * @property {any} [path]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		value = $bindable(),
		fields = defaultFields,
		formatter = identity,
		using = $bindable({}),
		levels = [],
		isParent = false,
		isExpanded = false,
		depth = 0,
		path = null
	} = $props();

	run(() => {
		using = { default: Item, ...using }
	});
	let component = $derived(getComponent(value, fields, using))

	const SvelteComponent = $derived(component);
</script>

<td class={className}>
	<cell>
		{#if path}
			{#each levels.slice(0, -1) as _}
				<Connector type="empty" />
			{/each}
			{#if isParent}
				<Icon name={isExpanded ? 'node-opened' : 'node-closed'} class="small cursor-pointer" />
			{:else if depth > 0}
				<Connector type="empty" />
			{/if}
		{/if}
		<SvelteComponent bind:value {fields} {formatter} />
	</cell>
</td>
