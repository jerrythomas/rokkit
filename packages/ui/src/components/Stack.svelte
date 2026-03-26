<script lang="ts">
	import type { Snippet } from 'svelte'

	interface StackProps {
		/** Layout direction */
		direction?: 'vertical' | 'horizontal'
		/** Gap size between children */
		gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
		/** Cross-axis alignment */
		align?: 'start' | 'center' | 'end' | 'stretch'
		/** Main-axis justification */
		justify?: 'start' | 'center' | 'end' | 'between' | 'around'
		/** Stack children */
		children: Snippet
		/** Additional CSS class */
		class?: string
	}

	const {
		direction = 'vertical',
		gap = 'md',
		align,
		justify,
		children,
		class: className = ''
	}: StackProps = $props()
</script>

<div
	data-stack
	data-direction={direction}
	data-gap={gap}
	data-align={align || undefined}
	data-justify={justify || undefined}
	class={className || undefined}
>
	{@render children()}
</div>
