<script lang="ts">
	import type { Snippet } from 'svelte'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	interface MessageProps {
		/** Alert type — controls color and icon */
		type?: 'error' | 'info' | 'success' | 'warning'
		/** Icon class overrides per type */
		icons?: { error?: string; info?: string; success?: string; warning?: string }
		/** Text content (shorthand; children takes precedence) */
		text?: string
		/** Show dismiss button */
		dismissible?: boolean
		/** Auto-dismiss after N ms. Defaults to 4000 unless dismissible (persistent). Pass 0 to disable. */
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
		icons = DEFAULT_STATE_ICONS.state as Record<string, string>,
		text = undefined,
		dismissible = false,
		timeout = dismissible ? 0 : 4000,
		actions,
		children,
		ondismiss,
		class: className = ''
	}: MessageProps = $props()

	const role = $derived(type === 'error' || type === 'warning' ? 'alert' : 'status')
	const icon = $derived(icons[type] ?? '')

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
	<span data-message-icon class={icon} aria-hidden="true"></span>

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
