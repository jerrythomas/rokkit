<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('./types.js').ConnectionType} [type]
	 * @property {boolean} [rtl]
	 */

	/** @type {Props} */
	let { type = $bindable('empty'), rtl = false } = $props()
	let validatedType = $derived(['last', 'child', 'sibling'].includes(type) ? type : 'empty')
</script>

<span class="grid grid-rows-2 grid-cols-2 h-full min-w-4 w-4 line-{validatedType}">
	{#if validatedType === 'last'}
		{#if rtl}
			<i class="border-b border-r"></i>
		{:else}
			<i class="border-r"></i>
			<i class="border-b"></i>
		{/if}
	{:else if validatedType === 'child'}
		{#if rtl}
			<i class="grid row-span-2 grid-rows-2 border-r">
				<i class="border-b"></i>
			</i>
		{:else}
			<i class="col-span-1 row-span-2 border-r"></i>
			<i class="border-b"></i>
		{/if}
	{:else if validatedType === 'sibling'}
		<i class="row-span-2 border-r"></i>
	{/if}
</span>
