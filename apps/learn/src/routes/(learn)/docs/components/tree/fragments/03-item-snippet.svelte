<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'
</script>

<!-- itemContent receives a ProxyItem -->
<Tree {items} bind:value onselect={(v) => (value = v)}>
	{#snippet itemContent(proxy)}
		{#if proxy.icon}
			<span class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span class="flex-1">{proxy.label}</span>
		{#if proxy.get('badge')}
			<span class="badge">{proxy.get('badge')}</span>
		{/if}
	{/snippet}
</Tree>
