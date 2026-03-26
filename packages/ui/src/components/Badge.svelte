<script lang="ts">
	import type { Snippet } from 'svelte'

	interface BadgeProps {
		/** Numeric count to display */
		count?: number
		/** Maximum count before showing "max+" (default: 99) */
		max?: number
		/** Visual variant */
		variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
		/** Show as a small dot without content */
		dot?: boolean
		/** Content to wrap — when provided, badge positions absolutely over the child */
		children?: Snippet
		/** Additional CSS class */
		class?: string
	}

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
