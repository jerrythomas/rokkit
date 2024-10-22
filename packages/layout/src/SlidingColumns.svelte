<script>
	import { swipeable, navigable } from '@rokkit/actions'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	let activeIndex = $state(0)
	let offset = $state(1)
	let width = $state()
	let { columns } = $props();

	let numColumns = $derived(columns.length)

	function handleNext() {
		if (activeIndex < numColumns - 1) {
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
<container
	use:swipeable
	onswipeLeft={handlePrevious}
	onswipeRight={handleNext}
	use:navigable
	onprevious={handlePrevious}
	onnext={handleNext}
	tabindex={0}
	class="relative grid h-full w-full overflow-hidden"
	bind:clientWidth={width}
>
	{#each columns as column, index}
		{#if index === activeIndex}
			<segment
				class="slide w-full h-full absolute {column}"
				in:fly={{ x: offset * width, duration: 1000, easing: cubicInOut }}
				out:fade={{
					x: -1 * offset * width,
					duration: 1000,
					easing: cubicInOut
				}}
			>
				{column}
			</segment>
		{/if}
	{/each}
</container>
