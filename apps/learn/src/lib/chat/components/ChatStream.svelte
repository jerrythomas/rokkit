<script lang="ts">
	import type { Snippet } from 'svelte'

	interface ChatStreamProps {
		/** Stream messages and other content */
		children?: Snippet
	}

	const { children }: ChatStreamProps = $props()
</script>

<div data-koanchat-stream>
	{#if children}
		{@render children()}
	{/if}
</div>
