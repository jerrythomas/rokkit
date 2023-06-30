<script>
	import { pannable } from '../actions'
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
	function handleKeyDown(event) {
		const index = steps.findIndex((step) => step == value)
		if (event.key == 'ArrowLeft' && index > 0) {
			value = steps[index - 1]
			cx = scale.invert(value)
		} else if (event.key == 'ArrowRight' && index < steps.length - 1) {
			value = steps[index + 1]
			cx = scale.invert(value)
		}
	}
	let sliding = false
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<thumb
	class="-top-1 absolute box-border h-4 w-4 cursor-pointer"
	style:left="{cx}px"
	class:sliding
	tabindex="0"
	on:focus={() => (sliding = true)}
	on:blur={() => (sliding = false)}
	use:pannable
	on:panmove={handlePanMove}
	on:panstart={() => (sliding = true)}
	on:panend={handlePanEnd}
	on:keydown={handleKeyDown}
	role="slider"
	aria-valuenow={value}
	aria-valuemin={min}
	aria-valuemax={max}
/>
