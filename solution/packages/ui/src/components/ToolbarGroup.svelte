<script lang="ts">
	import type { ToolbarGroupProps } from '../types/toolbar.js'

	const { label, gap = 'sm', class: className = '', children }: ToolbarGroupProps = $props()
</script>

<div
	data-toolbar-group
	data-toolbar-group-gap={gap}
	class={className || undefined}
	role="group"
	aria-label={label}
>
	{#if children}
		{@render children()}
	{/if}
</div>
