<script>
	import { Icon } from '@sparsh-ui/icons'

	export let text
	export let completed
	export let active
</script>

<div
	class="w-16 h-16 circle stage select-none cursor-pointer"
	class:completed
	class:active
	on:click
>
	{#if completed}
		<Icon name="tick" size="80%" on:click />
	{:else}
		<p class="w-full h-full border-2 circle">
			{text}
		</p>
	{/if}
</div>

<style lang="postcss">
	.circle {
		@apply flex items-center justify-center border-2 rounded-full;
	}
	.stage.completed {
		@apply bg-primary-500 text-white;
	}
	.stage.active {
		@apply border border-primary-500;
	}
	.stage.active .circle {
		@apply border-4 shadow;
	}
</style>
