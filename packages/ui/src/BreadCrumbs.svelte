<script>
	import Item from './Item.svelte'
	import Icon from './Icon.svelte'
	import { Proxy } from '@rokkit/states'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {string} [separator]
	 * @property {any} [fields]
	 * @property {any} [crumb]
	 */

	/** @type {Props} */
	let { class: classes = '', items = [], separator = '/', fields, child } = $props()
	let childSnippet = $derived(child ? child : defaultChild)
</script>

{#snippet defaultChild(proxy)}
	<Item {proxy} />
{/snippet}
<div data-crumb-root class={classes}>
	{#each items as item, index (index)}
		{@const proxy = new Proxy(item, fields)}
		{#if index > 0}
			<Icon name={separator} data-crumb-separator></Icon>
		{/if}
		<div data-crumb-item class:is-selected={index === items.length - 1}>
			{@render childSnippet?.(proxy)}
		</div>
	{/each}
</div>
