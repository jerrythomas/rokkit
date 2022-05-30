<script>
	import { arc } from 'd3-shape'

	export let progress = 0
	export let cx
	export let cy
	export let r = 25
	export let thickness = 3
	export let number
	export let steps = 0

	$: active = progress > 0 && progress < 1

	$: ring = arc()
		.innerRadius(r - thickness)
		.outerRadius(r)
		.startAngle(0)
		.endAngle(2 * Math.PI)()
	$: d = arc()
		.innerRadius(r - thickness)
		.outerRadius(r)
		.startAngle(0)
		.endAngle(2 * Math.PI * progress)()
</script>

{#if progress < 1}
	<path
		d={ring}
		transform="translate({cx},{cy})"
		class="text-skin-200 fill-current"
	/>
	<text
		x={cx}
		y={cy + r / 10}
		text-anchor="middle"
		font-size={r * 0.7}
		alignment-baseline="middle"
		class="fill-current text-skin-500">{number}</text
	>
{/if}
{#if steps > 0}
	<circle {cx} {cy} {r} fill="none" class:active stroke-width="1" />
{:else if progress > 0}
	<path
		{d}
		transform="translate({cx},{cy})"
		class="text-primary-500 fill-current"
	/>
{/if}
{#if progress == 1}
	<circle {cx} {cy} {r} class="text-primary-500 fill-current" />
	<polyline
		points="{cx - r / 3} {cy + r / 6} {cx - r / 10} {cy + r / 3} {cx +
			r / 3} {cy - r / 4}"
		stroke-width={thickness}
		stroke-linecap="round"
		stroke-linejoin="round"
		fill="none"
		class="text-white stroke-current"
	/>
{/if}

<style>
	.active {
		@apply text-primary-500 stroke-current;
	}
</style>
