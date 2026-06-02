<script lang="ts">
	import type { BadgeProps } from '../types/badge.js'

	const {
		count,
		max = 99,
		variant = 'default',
		dot = false,
		children,
		class: className = ''
	}: BadgeProps = $props()

	const displayText = $derived.by(() => {
		if (dot) return undefined
		if (count === undefined) return undefined
		return count > max ? `${max}+` : String(count)
	})
</script>

{#if children}
	<div data-badge-wrapper class={className || undefined}>
		{@render children()}
		<span
			data-badge
			data-variant={variant}
			data-dot={dot || undefined}
			aria-label={displayText ? `${displayText} notifications` : undefined}
		>
			{#if displayText}{displayText}{/if}
		</span>
	</div>
{:else}
	<span
		data-badge
		data-variant={variant}
		data-dot={dot || undefined}
		class={className || undefined}
		aria-label={displayText ? `${displayText} notifications` : undefined}
	>
		{#if displayText}{displayText}{/if}
	</span>
{/if}
