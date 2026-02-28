<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			text: 'src',
			value: 'src',
			icon: 'i-lucide:folder',
			children: [
				{
					text: 'components',
					value: 'components',
					icon: 'i-lucide:folder',
					children: [
						{ text: 'Tree.svelte', value: 'tree', icon: 'i-lucide:file-code' },
						{ text: 'List.svelte', value: 'list', icon: 'i-lucide:file-code' }
					]
				},
				{ text: 'index.ts', value: 'index', icon: 'i-lucide:file-code' }
			]
		},
		{
			text: 'tests',
			value: 'tests',
			icon: 'i-lucide:folder',
			children: [
				{ text: 'tree.spec.ts', value: 'spec', icon: 'i-lucide:file-code' }
			]
		},
		{ text: 'README.md', value: 'readme', icon: 'i-lucide:file-text' }
	]

	let value = $state(null)
</script>

<Tree {items} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
