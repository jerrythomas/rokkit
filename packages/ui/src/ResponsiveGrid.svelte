<script>
	// To Do add navigable
	import { defaultMapping } from './constants'
	import { swipeable } from '@rokkit/actions'
	import { fly, fade } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'
	import { equals } from 'ramda'
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} items
	 * @property {import('@rokkit/core').FieldMapper} [mapping]
	 * @property {boolean} [small]
	 * @property {number} [duration]
	 * @property {any} [easing]
	 * @property {any} [value]
	 */

	/** @type {Props} */
	let {
		class: className = 'three-col',
		items,
		mapping = defaultMapping,
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
		activeIndex = activeIndexFromPage(value)
		// direction = Math.sign(activeIndex - previous)
		previous = activeIndex
	})
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-container
	use:swipeable={{ enabled: small }}
	onswipeLeft={handleNext}
	onswipeRight={handlePrevious}
	onprevious={handlePrevious}
	onnext={handleNext}
	tabindex={0}
	class="overflow-hidden {className}"
	bind:clientWidth={width}
>
	{#each items as item, index (index)}
		{@const segmentClass = 'col-' + (index + 1)}
		{@const props = mapping.get('props', item, {})}
		{@const Template = item[mapping.fields.component]}
		{#if small && equals(index, activeIndex)}
			<rk-segment
				class="absolute h-full w-full {segmentClass}"
				out:fade={{
					x: -1 * direction * width,
					duration,
					easing
				}}
				in:fly={{ x: direction * width, duration, easing }}
			>
				<Template {...props} />
			</rk-segment>
		{:else if !small}
			<rk-segment class={segmentClass}>
				<Template {...props} />
			</rk-segment>
		{/if}
	{/each}
</rk-container>
