<script>
	import Icon from './Icon.svelte'

	export let text
	export let completed
	export let active
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="circle stage h-16 w-16 cursor-pointer select-none"
	class:completed
	class:active
	on:click
	role="option"
	aria-selected={active}
	tabindex="0"
>
	{#if completed}
		<Icon name="tick" on:click />
	{:else}
		<p class="circle h-full w-full border-2">
			{text}
		</p>
	{/if}
</div>

<style lang="postcss">
	.circle {
		@apply flex items-center justify-center rounded-full border-2;
	}
	.stage.completed {
		@apply bg-primary-500 text-white;
	}
	.stage.active {
		@apply border-primary-500 border;
	}
	.stage.active .circle {
		@apply border-4 shadow;
	}
</style>
