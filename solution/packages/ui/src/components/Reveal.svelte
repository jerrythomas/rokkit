<script lang="ts">
	import type { Snippet } from 'svelte'
	import { reveal } from '@rokkit/actions'

	interface RevealProps {
		/** Slide direction (default: 'up') */
		direction?: 'up' | 'down' | 'left' | 'right' | 'none'
		/** Slide distance CSS value (default: '1.5rem') */
		distance?: string
		/** Transition duration in ms (default: 600) */
		duration?: number
		/** Delay before animation starts in ms (default: 0) */
		delay?: number
		/** Delay increment per direct child in ms for stagger (default: 0) */
		stagger?: number
		/** Only animate once (default: true) */
		once?: boolean
		/** IntersectionObserver threshold 0–1 (default: 0.1) */
		threshold?: number
		/** CSS easing function */
		easing?: string
		/** Additional CSS class */
		class?: string
		children?: Snippet
	}

	const {
		direction = 'up',
		distance = '1.5rem',
		duration = 600,
		delay = 0,
		stagger = 0,
		once = true,
		threshold = 0.1,
		easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
		class: className = '',
		children
	}: RevealProps = $props()

	let el: HTMLDivElement | null = $state(null)

	function handleReveal(e: CustomEvent<{ visible: boolean }>) {
		if (!e.detail.visible || stagger <= 0 || !el) return
		const children = el.children
		for (let i = 0; i < children.length; i++) {
			;(children[i] as HTMLElement).style.transitionDelay = `${delay + i * stagger}ms`
		}
	}
</script>

<div
	bind:this={el}
	class={className || undefined}
	use:reveal={{ direction, distance, duration, delay: stagger > 0 ? 0 : delay, once, threshold, easing }}
	onreveal={handleReveal}
>
	{@render children?.()}
</div>
