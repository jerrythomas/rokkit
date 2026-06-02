<script lang="ts">
	import type { DividerProps } from '../types/divider.js'

	const { orientation = 'horizontal', label, class: className = '' }: DividerProps = $props()
</script>

<div
	data-divider
	data-orientation={orientation}
	class={className || undefined}
	role="separator"
	aria-orientation={orientation}
>
	{#if label}
		<span data-divider-label>{label}</span>
	{/if}
</div>
