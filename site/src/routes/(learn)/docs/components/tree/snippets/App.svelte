<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			label: 'src',
			value: 'src',
			icon: 'i-lucide:folder',
			badge: '3 files',
			children: [
				{ label: 'index.ts', value: 'index', icon: 'i-lucide:file-code', badge: '2.1kb' },
				{ label: 'utils.ts', value: 'utils', icon: 'i-lucide:file-code', badge: '1.4kb' },
				{ label: 'types.ts', value: 'types', icon: 'i-lucide:file-code', badge: '0.8kb' }
			]
		},
		{ label: 'README.md', value: 'readme', icon: 'i-lucide:file-text', badge: '0.5kb' }
	]

	let value = $state(null)
</script>

<Tree {items} bind:value onselect={(v) => (value = v)}>
	{#snippet itemContent(proxy)}
		{#if proxy.icon}
			<span class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span class="flex-1">{proxy.label}</span>
		{#if proxy.get('badge')}
			<span class="bg-surface-z2 text-surface-z5 rounded px-1.5 py-0.5 text-xs">
				{proxy.get('badge')}
			</span>
		{/if}
	{/snippet}
</Tree>

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
