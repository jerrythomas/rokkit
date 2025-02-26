<script>
	import { pannable } from '@rokkit/actions'

	/**
	 * @typedef Props
	 * @property {number} min     - The minimum value of the thumb.
	 * @property {number} max     - The maximum value of the thumb.
	 * @property {number} value   - The current value of the thumb.
	 * @property {number} cx      - The current position of the thumb.
	 * @property {number[]} steps - An array of steps within a range.
	 * @property {import('d3-scale').ScaleLinear} scale - Scale mapping the thumb's position to its value.
	 */
	/** @type {Props} */
	let { min = 0, max = 100, value = $bindable(), cx = $bindable(), steps = [], scale } = $props()

	function handlePanMove(event) {
		let x = cx + event.detail.dx
		let limits = [scale.invert(min), scale.invert(max)]

		cx = Math.min(Math.max(x, limits[0]), limits[1])
		if (steps.length > 0) {
			const result = scale(x)
			let index = 0
			let matched = false
			while (!matched && index < steps.length - 1) {
				if (steps[index] <= result && steps[index + 1] > result) {
					value =
						result - steps[index] > steps[index + 1] - result ? steps[index + 1] : steps[index]
					matched = true
				}
				index++
			}
		} else {
			value = scale(cx)
		}
	}
	function handlePanEnd() {
		sliding = false
		if (steps.length > 0) {
			cx = scale.invert(value)
		}
	}
	function handleKeyDown(event) {
		if (steps.length === 0) {
			const offset = (max - min) / 10
			const step = event.key === 'ArrowLeft' ? -offset : event.key === 'ArrowRight' ? offset : 0
			value = Math.min(Math.max(value + step, min), max)
		} else {
			const index = steps.findIndex((step) => step === value)
			if (event.key === 'ArrowLeft' && index > 0) {
				value = steps[index - 1]
				cx = scale.invert(value)
			} else if (event.key === 'ArrowRight' && index < steps.length - 1) {
				value = steps[index + 1]
				cx = scale.invert(value)
			}
		}
	}
	let sliding = $state(false)
	let position = $derived(`${cx}px`)
</script>

<rk-thumb
	class="absolute -top-1 box-border h-4 w-4 cursor-pointer"
	style:left={position}
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
