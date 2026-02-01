<script>
	import { slide, fade } from 'svelte/transition'

	/**
	 * @typedef {Object} SliderProps
	 * @property {string} [class] - CSS class names
	 * @property {number} [top] - Top offset in pixels (for down direction)
	 * @property {number} [bottom] - Bottom offset in pixels (for up direction)
	 * @property {'up' | 'down'} [direction] - Open direction
	 * @property {import('svelte').Snippet} [children] - Content
	 */

	/** @type {SliderProps} */
	let { class: className = 'menu', top = 16, bottom, direction = 'down', children } = $props()

	let offset = $derived(direction === 'up' ? top : -top)
</script>

{#if direction === 'up'}
	<scroll
		in:slide={{ duration: 50, y: -offset }}
		out:fade={{ duration: 50 }}
		style:bottom="{bottom ?? top}px"
		class="absolute z-10 flex w-full flex-col overflow-scroll {className}"
		data-direction="up"
	>
		{@render children?.()}
	</scroll>
{:else}
	<scroll
		in:slide={{ duration: 50, y: offset }}
		out:fade={{ duration: 50 }}
		style:top="{top}px"
		class="absolute z-10 flex w-full flex-col overflow-scroll {className}"
		data-direction="down"
	>
		{@render children?.()}
	</scroll>
{/if}
