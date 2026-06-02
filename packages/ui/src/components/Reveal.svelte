<script lang="ts">
	import { reveal } from '@rokkit/actions'
	import type { RevealProps } from '../types/reveal.js'

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
</script>

<div
	class={className || undefined}
	use:reveal={{ direction, distance, duration, delay, stagger, once, threshold, easing }}
>
	{@render children?.()}
</div>
