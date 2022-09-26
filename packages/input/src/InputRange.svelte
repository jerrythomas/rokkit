<script>
	// import ShortUniqueId from 'short-unique-id'
	// const shortId = new ShortUniqueId()

	export let value
	export let min
	export let max
	export let tickCount = 0

	$: list = tickCount > 0 ? 1 : undefined
	$: tickStep = tickCount > 1 ? (max - min) / (+tickCount - 1) : 0
	$: ticks = Array.from({ length: +tickCount }, (_, i) => min + i * tickStep)
</script>

<input
	bind:value
	type="range"
	{...$$restProps}
	{list}
	on:change
	on:focus
	on:blur
/>
{#if tickCount > 0}
	<datalist id={list}>
		{#each ticks as value}
			<option {value} />
		{/each}
	</datalist>
{/if}
