<script>
	import { getSnippet } from '@rokkit/core'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {string} [separator]
	 * @property {any} [fields]
	 * @property {any} [crumb]
	 */

	/** @type {Props} */
	let { class: classes = '', items = [], separator = '/', fields, crumb } = $props()
</script>

<rk-crumbs class={classes}>
	{#each items as item, index (index)}
		{#if index > 0}
			<span>
				{#if separator.length === 1}
					{separator}
				{:else}
					<icon class={separator}></icon>
				{/if}
			</span>
		{/if}
		<rk-crumb class:is-selected={index === items.length - 1}>
			{#if crumb}
				{@render crumb(item, fields)}
			{:else}
				<Item value={item} {fields} />
			{/if}
		</rk-crumb>
	{/each}
</rk-crumbs>
