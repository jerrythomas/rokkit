<script>
	export let items
	export let activePage
</script>

<nav class="menu">
	{#each items as item}
		<a
			href={item.target}
			class:isCurrent={item.target === activePage}
			class="first:rounded-t-lg last:rounded-b-lg"
		>
			{#if item.icon}
				<icon class={item.icon} />
			{/if}
			<p>{item.label}</p>
		</a>
	{/each}
</nav>

<style lang="postcss">
	.menu {
		@apply w-full select-none flex flex-col rounded-lg overflow-y-visible bg-skin-100;
	}
	.menu a {
		@apply flex flex-row w-full items-center px-4 py-3 gap-4;
	}
	.menu p {
		@apply flex flex-grow;
	}
</style>
