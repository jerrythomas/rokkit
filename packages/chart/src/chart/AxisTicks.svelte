<script>
	import { getContext, setContext } from 'svelte'
	import { writable } from 'svelte/store'

	const ticks = writable({})
	const axis = getContext('axis')

	setContext('ticks', ticks)

	export let size = 4
	export let side = 'left'

	$: side = ['left', 'top', 'right', 'bottom'].includes(side) ? side : 'left'
	$: d = ['left', 'top'].includes(side) ? -1 : 1
	$: dx = $axis.name === 'x' ? 0 : d
	$: dy = $axis.name === 'x' ? d : 0
	$: ticks.set({ side, dx, dy, size })
</script>

{#each $axis.ticks as tick}
	<line
		x1={tick.x + tick.offset.x + $axis.offset * dx}
		y1={tick.y + tick.offset.y + $axis.offset * dy}
		x2={tick.x + tick.offset.x + dx * size + $axis.offset * dx}
		y2={tick.y + tick.offset.y + dy * size + $axis.offset * dy}
		class="tick"
	/>
{/each}
<slot />
