<script>
	import { swipeable, navigable } from '@rokkit/actions'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	let { activeIndex = $bindable(0), columns = $bindable([]) } = $props()
	let width = $state()
	let offset = $state(1)

	function handleNext() {
		if (activeIndex < columns.length - 1) {
			activeIndex = activeIndex + 1
			offset = 1
		}
	}

	function handlePrevious() {
		if (activeIndex > 0) {
			activeIndex = activeIndex - 1
			offset = -1
		}
	}

	let activeColumn = $derived(columns[activeIndex])
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-container
	use:swipeable
	onswipeleft={handlePrevious}
	onswiperight={handleNext}
	use:navigable={{ orientation: 'horizontal' }}
	onprevious={handlePrevious}
	onnext={handleNext}
	tabindex={0}
	class="relative grid h-full w-full overflow-hidden"
	bind:clientWidth={width}
>
	<rk-segment
		class="slide absolute h-full w-full"
		in:fly={{ x: offset * width, duration: 1000, easing: cubicInOut }}
		out:fade={{
			x: -1 * offset * width,
			duration: 1000,
			easing: cubicInOut
		}}
	>
		{activeColumn}
	</rk-segment>
</rk-container>
