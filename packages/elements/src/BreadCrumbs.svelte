<script>
	import { defaultMapping } from './constants'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {string} [separator]
	 * @property {any} [fields]
	 * @property {any} [using]
	 */

	/** @type {Props} */
	let { class: classes = '', items = [], separator = '/', mapping = defaultMapping } = $props()
</script>

<rk-crumbs class={classes}>
	{#each items as item, index}
		{@const Component = mapping.getComponent(item)}
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
			<Component value={item} {mapping} />
		</rk-crumb>
	{/each}
</rk-crumbs>
