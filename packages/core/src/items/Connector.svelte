<script>
	export let type = null
	export let rtl = false

	$: type = ['last', 'child', 'sibling'].includes(type) ? type : 'empty'
</script>

<span class="grid grid-rows-2 grid-cols-2 h-full min-w-4 w-4 line-{type}">
	{#if type === 'last'}
		{#if rtl}
			<i class="border-b border-r" />
		{:else}
			<i class="border-r" />
			<i class="border-b" />
		{/if}
	{:else if type === 'child'}
		{#if rtl}
			<i class="border-r grid grid-rows-2 row-span-2">
				<i class="border-b" />
			</i>
		{:else}
			<i class="border-r col-span-1 row-span-2" />
			<i class="border-b" />
		{/if}
	{:else if type === 'sibling'}
		<i class="border-r row-span-2" />
	{/if}
</span>
