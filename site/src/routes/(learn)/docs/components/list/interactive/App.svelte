<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	let items = $state([
		{ label: 'Enable notifications', icon: 'i-glyph:bell', checked: true },
		{ label: 'Dark mode', icon: 'i-glyph:moon', checked: false },
		{ label: 'Auto-save', icon: 'i-glyph:diskette', checked: true },
		{ label: 'Show hints', icon: 'i-glyph:info-circle', checked: false },
		{ label: 'Compact view', icon: 'i-glyph:list-items', checked: false }
	])
</script>

<List {items}>
	{#snippet itemContent(proxy)}
		{#if proxy.icon}
			<span class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span class="flex-1">{proxy.label}</span>
		<input
			type="checkbox"
			checked={proxy.get('checked')}
			onchange={(e) => {
				proxy.value.checked = e.currentTarget.checked
			}}
			onclick={(e) => e.stopPropagation()}
			aria-label="Toggle {proxy.label}"
		/>
	{/snippet}
</List>

<p class="text-surface-z5 mt-3 text-sm">
	Checked: {items
		.filter((i) => i.checked)
		.map((i) => i.label)
		.join(', ') || 'none'}
</p>
