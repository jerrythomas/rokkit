<script>
	import { swipeable, navigable } from '@rokkit/actions'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	let { activeIndex = $bindable(0), columns = $bindable([]), disabled = false } = $props()
	let width = $state()
	let offset = $state(1)

	function handleNext() {
		if (disabled) return
		if (activeIndex < columns.length - 1) {
			activeIndex = activeIndex + 1
			offset = 1
		}
	}

	function handlePrevious() {
		if (disabled) return
		if (activeIndex > 0) {
			activeIndex = activeIndex - 1
			offset = -1
		}
	}

	let activeColumn = $derived(columns[activeIndex])
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	data-sliding-columns-root
	use:swipeable
	onswipeleft={handlePrevious}
	onswiperight={handleNext}
	use:navigable={{ orientation: 'horizontal' }}
	onprevious={handlePrevious}
	onnext={handleNext}
	tabindex={disabled ? -1 : 0}
	aria-disabled={disabled}
	data-disabled={disabled}
	bind:clientWidth={width}
>
	<div
		data-sliding-segment
		in:fly={{ x: offset * width, duration: 1000, easing: cubicInOut }}
		out:fade={{
			x: -1 * offset * width,
			duration: 1000,
			easing: cubicInOut
		}}
	>
		{activeColumn}
	</div>
</div>

<style>
	[data-sliding-columns-root] {
		position: relative;
		display: grid;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
	[data-sliding-segment] {
		position: absolute;
		height: 100%;
		width: 100%;
	}
	[data-sliding-columns-root][data-disabled='true'] {
		pointer-events: none;
		opacity: 0.5;
	}
</style>
