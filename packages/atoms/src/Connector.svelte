<script>
	import { run } from 'svelte/legacy';

	/**
	 * @typedef {Object} Props
	 * @property {any} [type]
	 * @property {boolean} [rtl]
	 */

	/** @type {Props} */
	let { type = $bindable(null), rtl = false } = $props();

	run(() => {
		type = ['last', 'child', 'sibling'].includes(type) ? type : 'empty'
	});
</script>

<span class="grid grid-rows-2 grid-cols-2 h-full min-w-4 w-4 line-{type}">
	{#if type === 'last'}
		{#if rtl}
			<i class="border-b border-r"></i>
		{:else}
			<i class="border-r"></i>
			<i class="border-b"></i>
		{/if}
	{:else if type === 'child'}
		{#if rtl}
			<i class="grid row-span-2 grid-rows-2 border-r">
				<i class="border-b"></i>
			</i>
		{:else}
			<i class="col-span-1 row-span-2 border-r"></i>
			<i class="border-b"></i>
		{/if}
	{:else if type === 'sibling'}
		<i class="row-span-2 border-r"></i>
	{/if}
</span>
