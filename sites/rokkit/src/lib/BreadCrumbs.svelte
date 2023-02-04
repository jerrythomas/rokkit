<script>
	export let items = []
</script>

<crumbs class="flex">
	{#each items as item, index}
		{#if index > 0}
			<span>
				<icon class="separator" />
			</span>
		{/if}
		<a href={item.url}>{item.title}</a>
	{/each}
</crumbs>
