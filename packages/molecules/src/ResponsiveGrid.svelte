<script>
	import { defaultFields } from '@rokkit/core'
	import { swipeable, navigable } from '@rokkit/actions'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { equals } from 'ramda'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} items
	 * @property {any} [fields]
	 * @property {boolean} [small]
	 * @property {number} [duration]
	 * @property {any} [easing]
	 * @property {any} [value]
	 */

	/** @type {Props} */
	let {
		class: className = 'three-col',
		items,
		fields = $bindable({}),
		small = true,
		duration = 400,
		easing = cubicInOut,
		value = $bindable(null)
	} = $props()

	let previous = $state(-1)
	let activeIndex = $state(0)
	let direction = $derived(Math.sign(activeIndex - previous))
	let width = $state()

	function handleNext() {
		if (activeIndex < items.length - 1) value = items[activeIndex + 1]
	}

	function handlePrevious() {
		if (activeIndex > 0) value = items[activeIndex - 1]
	}

	function activeIndexFromPage(value) {
		const index = items.findIndex((item) => equals(item, value))
		return index > -1 ? index : 0
	}

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
		activeIndex = activeIndexFromPage(value)
		// direction = Math.sign(activeIndex - previous)
		previous = activeIndex
	})
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<container
	use:swipeable={{ enabled: small }}
	onswipeLeft={handleNext}
	onswipeRight={handlePrevious}
	use:navigable={{ enabled: small }}
	onprevious={handlePrevious}
	onnext={handleNext}
	tabindex={0}
	class="overflow-hidden {className}"
	bind:clientWidth={width}
>
	{#each items as item, index}
		{@const segmentClass = 'col-' + (index + 1)}
		{@const props = item[fields.props]}
		{@const component = item[fields.component]}
		{#if small && equals(index, activeIndex)}
			{@const SvelteComponent = component}
			<segment
				class="absolute w-full h-full {segmentClass}"
				out:fade={{
					x: -1 * direction * width,
					duration,
					easing
				}}
				in:fly={{ x: direction * width, duration, easing }}
			>
				<SvelteComponent {...props} />
			</segment>
		{:else if !small}
			{@const SvelteComponent_1 = component}
			<segment class={segmentClass}>
				<SvelteComponent_1 {...props} />
			</segment>
		{/if}
	{/each}
</container>
