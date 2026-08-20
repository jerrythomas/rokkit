<script lang="ts">
	import FloatingAction from '../src/components/FloatingAction.svelte'

	const {
		items = [],
		open = true,
		onselect
	}: {
		items?: unknown[]
		open?: boolean
		onselect?: (value: unknown, item: unknown) => void
	} = $props()
</script>

<!-- Item snippets are invoked as (original, fields, handlers) — see renderItem in
     FloatingAction.svelte. `original` is the raw item, not a ProxyItem. -->
<FloatingAction {items} {open} {onselect}>
	{#snippet starred(original, _fields, handlers)}
		<button data-named-item onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
			Starred: {original.label}
		</button>
	{/snippet}
	{#snippet item(original, _fields, handlers)}
		<button data-default-item onclick={handlers.onclick} onkeydown={handlers.onkeydown}>
			Item: {original.label}
		</button>
	{/snippet}
</FloatingAction>
