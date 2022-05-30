<script>
	export let count = 0
	export let progress = 0
	export let x
	export let y
	export let size = 6

	$: width = size * 17
	$: offset = (width - size * 3 * count - size) / 2
	$: dots = Array.from({ length: count }, (v, i) => ({
		i,
		completed: progress >= (i + 1) / count,
		active:
			progress > 0 &&
			progress < 1 &&
			progress > i / count &&
			progress <= (i + 1) / count
	}))
</script>

<!-- <rect
	{x}
	y={y - 10}
	{width}
	height={20}
	fill="none"
	class="stroke-current text-gray-200"
/> -->
{#if count === 0}
	<line
		x1={x}
		y1={y}
		x2={x + width}
		y2={y}
		class="stroke-current text-primary-300"
	/>
{/if}
{#each dots as { i, completed, active }}
	{@const radius = size / 2 + (active ? size / 3 : 0)}
	<circle
		cx={x + offset + size * 2 + size * 3 * i}
		cy={y}
		r={radius}
		class="fill-current text-gray-200"
		class:completed
		class:active
	/>
{/each}

<style lang="postcss">
	.completed,
	.active {
		@apply text-primary-500;
	}
</style>
