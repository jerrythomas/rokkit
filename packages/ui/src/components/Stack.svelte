<script lang="ts">
	import type { StackProps } from '../types/stack.js'

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
