<script>
	export let label
	export let progress
	export let steps
</script>

<div class="w-full flex flex-col gap-2 border">
	{#if label}
		<input type="text" bind:value={label} />
	{/if}
	{#if steps}
		<input
			type="range"
			bind:value={progress}
			min={0}
			max={1}
			step={1 / steps}
			list="progress-ticks"
		/>
	{/if}
</div>

<style lang="postcss">
	input[type='text'] {
		@apply border-neutral-200 px-2 leading-loose;
	}
	input[type='range'] {
		@apply h-auto w-full;
	}
</style>
