<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			label: 'src',
			value: 'src',
			icon: 'i-glyph:folder',
			children: [
				{ label: 'index.ts', value: 'index', icon: 'i-glyph:code-square' },
				{ label: 'utils.ts', value: 'utils', icon: 'i-glyph:code-square' }
			]
		},
		{
			label: 'tests',
			value: 'tests',
			icon: 'i-glyph:folder',
			children: [{ label: 'index.spec.ts', value: 'spec', icon: 'i-glyph:code-square' }]
		},
		{ label: 'README.md', value: 'readme', icon: 'i-glyph:file-text' }
	]

	let value = $state(null)
</script>

<Tree {items} lineStyle="none" bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
