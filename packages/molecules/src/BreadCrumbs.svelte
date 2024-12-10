<script>
	import { run } from 'svelte/legacy'

	import { defaultFields, getComponent } from '@rokkit/core'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {string} [separator]
	 * @property {any} [fields]
	 * @property {any} [using]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		items = [],
		separator = '/',
		fields = $bindable(defaultFields),
		using = $bindable({ default: Item })
	} = $props()

	run(() => {
		fields = { ...defaultFields, ...fields }
	})
	run(() => {
		using = { default: Item, ...using }
	})
</script>

<crumbs class="flex {className}">
	{#each items as item, index}
		{@const component = getComponent(item, fields, using)}
		{#if index > 0}
			<span>
				{#if separator.length === 1}
					{separator}
				{:else}
					<icon class={separator}></icon>
				{/if}
			</span>
		{/if}
		{@const SvelteComponent = component}
		<crumb class:is-selected={index === items.length - 1}>
			<SvelteComponent value={item} {fields} />
		</crumb>
	{/each}
</crumbs>
