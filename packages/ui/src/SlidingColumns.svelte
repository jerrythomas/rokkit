<script>
	import { swipeable, navigable } from '@rokkit/actions'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	let { activeIndex = 0, columns = $bindable([]) } = $props()
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
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-container
	use:swipeable
	onswipeleft={handlePrevious}
	onswiperight={handleNext}
	use:navigable
	onprevious={handlePrevious}
	onnext={handleNext}
	tabindex={0}
	class="relative grid h-full w-full overflow-hidden"
	bind:clientWidth={width}
>
	{#each columns as column, index (index)}
		{#if index === activeIndex}
			<rk-segment
				class="slide absolute h-full w-full {column}"
				in:fly={{ x: offset * width, duration: 1000, easing: cubicInOut }}
				out:fade={{
					x: -1 * offset * width,
					duration: 1000,
					easing: cubicInOut
				}}
			>
				{column}
			</rk-segment>
		{/if}
	{/each}
</rk-container>
