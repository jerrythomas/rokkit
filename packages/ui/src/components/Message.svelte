<script lang="ts">
	import type { Snippet } from 'svelte'

	interface MessageProps {
		/** Alert type — controls color and icon */
		type?: 'error' | 'info' | 'success' | 'warning'
		/** Text content (shorthand; children takes precedence) */
		text?: string
		/** Show dismiss button */
		dismissible?: boolean
		/** Auto-dismiss after N ms (0 = no auto-dismiss) */
		timeout?: number
		/** Optional action buttons snippet */
		actions?: Snippet
		/** Rich content (takes precedence over text) */
		children?: Snippet
		/** Called when dismissed (button click or timeout) */
		ondismiss?: () => void
		/** Additional CSS class */
		class?: string
	}

	const {
		type = 'error',
		text = undefined,
		dismissible = false,
		timeout = 0,
		actions,
		children,
		ondismiss,
		class: className = ''
	}: MessageProps = $props()

	const role = $derived(type === 'error' || type === 'warning' ? 'alert' : 'status')

	$effect(() => {
		if (timeout > 0) {
			const timer = setTimeout(() => ondismiss?.(), timeout)
			return () => clearTimeout(timer)
		}
	})
</script>

<div
	data-message-root
	data-type={type}
	data-dismissible={dismissible}
	{role}
	class={className || undefined}
>
	<span data-message-icon aria-hidden="true"></span>

	<span data-message-text>
		{#if children}
			{@render children()}
		{:else}
			{text}
		{/if}
	</span>

	{#if actions}
		<div data-message-actions>
			{@render actions()}
		</div>
	{/if}

	{#if dismissible}
		<button type="button" data-message-dismiss aria-label="Dismiss" onclick={ondismiss}
			>×</button
		>
	{/if}
</div>
