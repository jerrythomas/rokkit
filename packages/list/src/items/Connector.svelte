<script>
	export let type
	export let rtl = false
</script>

<span class="grid grid-rows-2 grid-cols-2 w-4 h-full">
	{#if type === 'last'}
		{#if rtl}
			<i class="border-b border-r" />
		{:else}
			<i class="border-r" />
			<i class="border-b" />
		{/if}
	{:else if type === 'middle'}
		{#if rtl}
			<i class="border-r grid grid-rows-2 row-span-2">
				<i class="border-b" />
			</i>
		{:else}
			<i class="border-r col-span-1 row-span-2" />
			<i class="border-b" />
		{/if}
	{:else if type === 'line'}
		<i class="border-r row-span-2" />
	{/if}
</span>

<style lang="postcss">
	i {
		@apply w-2;
	}
</style>
