<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			label: 'src',
			value: 'src',
			icon: 'i-lucide:folder',
			children: [
				{ label: 'index.ts', value: 'index', icon: 'i-lucide:file-code' },
				{ label: 'utils.ts', value: 'utils', icon: 'i-lucide:file-code' }
			]
		},
		{
			label: 'tests',
			value: 'tests',
			icon: 'i-lucide:folder',
			children: [{ label: 'index.spec.ts', value: 'spec', icon: 'i-lucide:file-code' }]
		},
		{ label: 'README.md', value: 'readme', icon: 'i-lucide:file-text' }
	]

	let value = $state(null)
</script>

<Tree {items} lineStyle="none" bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
