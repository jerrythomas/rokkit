<script>
	import { swipeable, navigable } from '@rokkit/core/actions'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	let activeIndex = 0
	let offset = 1
	let width
	export let columns

	$: numColumns = columns.length

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

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<container
	use:swipeable
	on:swipeLeft={handlePrevious}
	on:swipeRight={handleNext}
	use:navigable
	on:previous={handlePrevious}
	on:next={handleNext}
	tabindex={0}
	class="grid w-full h-full relative overflow-hidden"
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
