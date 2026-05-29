{#snippet itemContent(proxy)}
	<span class="flex-1">{proxy.label}</span>
	<input
		type="checkbox"
		checked={proxy.value.enabled}
		onclick={(e) => {
			e.stopPropagation()
			proxy.value.enabled = !proxy.value.enabled
		}}
	/>
{/snippet}
