<script>
	export let type
</script>

<span class="grid grid-rows-2 grid-cols-2 w-4 h-full">
	{#if type === 'last'}
		<i class="border-r" />
		<i class="border-b" />
	{:else if type === 'middle'}
		<i class="border-r col-span-1 row-span-2" />
		<i class="border-b" />
	{:else if type === 'line'}
		<i class="border-r row-span-2" />
	{/if}
</span>

<style lang="postcss">
	i {
		@apply w-2;
	}
</style>
