<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		class?: string
		vertical?: boolean
		nav?: Snippet
		content?: Snippet
	}

	const { class: className = '', vertical = false, nav, content }: Props = $props()
</script>

<nav-content class="flex h-full w-full {className}" class:flex-col={vertical}>
	{@render nav?.()}
	{@render content?.()}
</nav-content>
