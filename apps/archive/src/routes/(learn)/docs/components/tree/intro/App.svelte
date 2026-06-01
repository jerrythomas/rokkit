<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			label: 'src',
			value: 'src',
			icon: 'i-glyph:folder',
			children: [
				{
					label: 'components',
					value: 'components',
					icon: 'i-glyph:folder',
					children: [
						{ label: 'Tree.svelte', value: 'tree', icon: 'i-glyph:code-square' },
						{ label: 'List.svelte', value: 'list', icon: 'i-glyph:code-square' }
					]
				},
				{ label: 'index.ts', value: 'index', icon: 'i-glyph:code-square' }
			]
		},
		{
			label: 'tests',
			value: 'tests',
			icon: 'i-glyph:folder',
			children: [{ label: 'tree.spec.ts', value: 'spec', icon: 'i-glyph:code-square' }]
		},
		{ label: 'README.md', value: 'readme', icon: 'i-glyph:file-text' }
	]

	let value = $state(null)
</script>

<Tree {items} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
