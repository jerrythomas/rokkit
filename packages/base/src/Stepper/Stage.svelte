<script>
	import Icon from '../Icon.svelte'

	export let number
	export let progress

	$: completed = progress == 1
	$: active = progress > 0 && progress < 1
</script>

<div class="flex flex-col gap-6 first:col-start-2">
	<box class="px-6 flex flex-col justify-center items-center">
		<div
			class="w-16 h-16 circle stage select-none cursor-pointer"
			class:completed
			class:active
			size="48px"
			on:click
		>
			{#if completed}
				<Icon name="tick" size="2.5em" on:click />
			{:else}
				<p class="w-full h-full border-2 circle">
					{number}
				</p>
			{/if}
		</div>
	</box>
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
