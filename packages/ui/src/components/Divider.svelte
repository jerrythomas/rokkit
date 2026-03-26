<script lang="ts">
	interface DividerProps {
		/** Orientation of the divider */
		orientation?: 'horizontal' | 'vertical'
		/** Optional label text displayed in the center */
		label?: string
		/** Additional CSS class */
		class?: string
	}

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
