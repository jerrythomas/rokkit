<script lang="ts">
	import type { Snippet } from 'svelte'

	/**
	 * Generic timeline entry — leading icon box + content slot, with a vertical
	 * dotted connector that bridges to the next sibling. When this is the
	 * `:last-child` of its parent the connector is suppressed. Consumers
	 * supply additional `data-*` attributes for theme-driven skinning.
	 *
	 * Today: ChatMessage wraps this. Tomorrow: activity feeds, milestone steps,
	 * progress trackers — anywhere a vertical sequence with a leading marker
	 * is wanted. Promote to @rokkit/ui once a second consumer validates the API.
	 *
	 * Layout shape:
	 *
	 *   [icon] heading
	 *    │     body content (any height)
	 *    │
	 *   [icon] heading
	 *    │     body content
	 *    ⋮     (connector fades into parent gap)
	 */
	interface Props {
		/**
		 * Icon for the leading node. Accepts either a Snippet for full custom
		 * rendering, or a string CSS class (e.g. an Iconify class like
		 * `i-mdi:layers-outline`). Falls back to a small dot when absent.
		 */
		icon?: Snippet | string
		/** Content rendered next to / below the icon. */
		children?: Snippet
		/** Pass-through `data-*` attributes for consumer theming. */
		[key: `data-${string}`]: string | undefined
	}

	const { icon, children, ...rest }: Props = $props()

	const iconIsSnippet = $derived(typeof icon === 'function')
	const iconClass = $derived(typeof icon === 'string' ? icon : '')
</script>

<div data-icon-timeline {...rest}>
	<span data-icon-timeline-node>
		{#if iconIsSnippet}
			{@render (icon as Snippet)()}
		{:else if iconClass}
			<span data-icon-timeline-icon class={iconClass} aria-hidden="true"></span>
		{:else}
			<span data-icon-timeline-dot></span>
		{/if}
	</span>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	[data-icon-timeline] {
		position: relative;
		padding-left: 38px;
		display: block;
	}

	/* Vertical dashed connector. Parent supplies the gap between siblings;
	   the connector extends through it (bottom: negative) and is hidden on
	   the last child. */
	[data-icon-timeline]::before {
		content: '';
		position: absolute;
		left: 13px;
		top: 30px;
		bottom: -22px;
		width: 1px;
		background-image: linear-gradient(
			to bottom,
			var(--ink-soft) 50%,
			transparent 50%
		);
		background-size: 1px 5px;
		opacity: 0.45;
	}

	[data-icon-timeline]:last-child::before {
		display: none;
	}

	[data-icon-timeline-node] {
		position: absolute;
		left: 0;
		top: 0;
		width: 27px;
		height: 27px;
		display: grid;
		place-items: center;
		border-radius: 6px;
		border: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		color: var(--ink-soft);
	}

	[data-icon-timeline-dot] {
		width: 4px;
		height: 4px;
		border-radius: 2px;
		background: currentColor;
		opacity: 0.6;
	}

	[data-icon-timeline-icon] {
		display: inline-block;
		width: 14px;
		height: 14px;
		color: currentColor;
	}
</style>
