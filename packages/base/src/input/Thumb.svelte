<script>
	import { pannable } from '../actions/pannable'
	export let min
	export let max
	export let cx
	export let steps
	export let scale
	export let value

	function handlePanMove(event) {
		let x = cx + event.detail.dx

		if (min <= x && x <= max) {
			cx = x
			if (steps.length > 0) {
				const result = scale(x)
				const index = steps.findIndex((step) => step > result)

				value =
					index == -1
						? steps[0]
						: result - steps[index - 1] > steps[index] - result
						? steps[index]
						: steps[index - 1]
			} else {
				value = scale(x)
			}
		}
	}
	function handlePanEnd() {
		sliding = false
		if (steps.length > 0) {
			cx = scale.invert(value)
		}
	}
	let sliding = false
</script>

<thumb
	class="absolute cursor-pointer"
	style:--cx="{cx}px"
	class:sliding
	use:pannable
	on:panmove={handlePanMove}
	on:panstart={() => (sliding = true)}
	on:panend={handlePanEnd}
/>

<style>
	thumb {
		@apply h-4.5 w-4.5 -top-1.5 absolute;
		left: calc(var(--cx) + 0.5em);
	}
	/* thumb {
		left: calc(var(--cx) - var(--r));
		top: calc(var(--cy) - var(--r));
		width: calc(2 * var(--r));
		height: calc(2 * var(--r));
	} */
</style>
