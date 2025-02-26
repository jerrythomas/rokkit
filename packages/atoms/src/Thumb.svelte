<script>
	import { pannable } from '@rokkit/actions'
	let { min, max, cx = $bindable(), steps, scale, value = $bindable() } = $props()

	function handlePanMove(event) {
		let x = cx + event.detail.dx

		if (min <= x && x <= max) {
			cx = x
			if (steps.length > 0) {
				const result = scale(x)
				const index = steps.findIndex((step) => step > result)

				value =
					index === -1
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
		const index = steps.findIndex((step) => step === value)
		if (event.key === 'ArrowLeft' && index > 0) {
			value = steps[index - 1]
			cx = scale.invert(value)
		} else if (event.key === 'ArrowRight' && index < steps.length - 1) {
			value = steps[index + 1]
			cx = scale.invert(value)
		}
	}
	let sliding = $state(false)
</script>

<rk-thumb
	class="absolute -top-1 box-border h-4 w-4 cursor-pointer"
	style:left="{cx}px"
	class:sliding
	tabindex="0"
	onfocus={() => (sliding = true)}
	onblur={() => (sliding = false)}
	use:pannable
	onpanmove={handlePanMove}
	onpanstart={() => (sliding = true)}
	onpanend={handlePanEnd}
	onkeydown={handleKeyDown}
	role="slider"
	aria-valuenow={value}
	aria-valuemin={min}
	aria-valuemax={max}
></rk-thumb>
