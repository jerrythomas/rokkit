<script>
	import Icon from './Icon.svelte'
	export let items

	// function lighterShade(current) {
	// 	return current ? '' : 'text-accent-400'
	// }
</script>

<nav class="flex flex-col bg-accent-50 rounded-xl">
	{#each items as item}
		<item
			class="flex flex-row items-center p-4 border-b last:border-b-0 border-accent-200"
			class:current={item.current}
		>
			<Icon icon={item.icon} title={item.label} />
			<a href={item.target} class="px-4 flex flex-grow">{item.label}</a>
			<!-- <Icon
				size="1em"
				name="chevron-right"
				title="open"
				class={lighterShade(item.current)}
			/> -->
		</item>
	{/each}
</nav>

<!-- <style lang="postcss">
	.current {
		@apply text-accent-700 font-semibold stroke-current;
	}
</style> -->
