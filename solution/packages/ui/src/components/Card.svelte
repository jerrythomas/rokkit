<script lang="ts">
	import type { Snippet } from 'svelte'

	interface CardProps {
		/** Optional href to render as a link */
		href?: string
		/** Click handler (only applies when no href) */
		onclick?: () => void
		/** Additional CSS class */
		class?: string
		/** Card header snippet */
		header?: Snippet
		/** Card footer snippet */
		footer?: Snippet
		/** Card body content */
		children?: Snippet
	}

	const {
		href,
		onclick,
		class: className = '',
		header,
		footer,
		children
	}: CardProps = $props()
</script>

{#snippet cardContent()}
	{#if header}
		<div data-card-header>
			{@render header()}
		</div>
	{/if}

	{#if children}
		<div data-card-body>
			{@render children()}
		</div>
	{/if}

	{#if footer}
		<div data-card-footer>
			{@render footer()}
		</div>
	{/if}
{/snippet}

{#if href}
	<a {href} data-card class={className || undefined}>
		{@render cardContent()}
	</a>
{:else if onclick}
	<button type="button" data-card data-card-interactive class={className || undefined} {onclick}>
		{@render cardContent()}
	</button>
{:else}
	<div data-card class={className || undefined}>
		{@render cardContent()}
	</div>
{/if}
