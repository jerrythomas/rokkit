<script>
	import { swipeable } from './actions/swipeable'
	import { navigable } from './actions/navigable'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	let className = 'three-col'
	export { className as class }
	export let items
	export let small = true
	export let duration = 400
	export let easing = cubicInOut
	export let value

	let previous = -1
	let activeIndex = 0
	let direction = 1
	let width

	function handleNext() {
		if (activeIndex < items.length - 1) value = items[activeIndex + 1]
	}

	function handlePrevious() {
		if (activeIndex > 0) value = items[activeIndex - 1]
	}

	function activeIndexFromPage(value) {
		const index = items.findIndex((item) => item === value)
		return index > -1 ? index : 0
	}

	$: activeIndex = activeIndexFromPage(value)
	$: {
		direction = Math.sign(activeIndex - previous)
		previous = activeIndex
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<container
	use:swipeable={{ enabled: small }}
	on:swipeLeft={handlePrevious}
	on:swipeRight={handleNext}
	use:navigable={{ enabled: small }}
	on:previous={handlePrevious}
	on:next={handleNext}
	tabindex={0}
	class="overflow-hidden {className}"
	bind:clientWidth={width}
>
	{#each items as item, index}
		{@const segmentClass = 'col-' + (index + 1)}
		{@const props = item.props ?? {}}
		{#if small && index === activeIndex}
			<segment
				class="absolute w-full h-full {segmentClass}"
				out:fade={{
					x: -1 * direction * width,
					duration,
					easing
				}}
				in:fly={{ x: direction * width, duration, easing }}
			>
				<svelte:component
					this={item.component}
					bind:content={item.content}
					{...props}
				/>
			</segment>
		{:else if !small}
			<segment class={segmentClass}>
				<svelte:component
					this={item.component}
					bind:content={item.content}
					{...props}
				/>
			</segment>
		{/if}
	{/each}
</container>
