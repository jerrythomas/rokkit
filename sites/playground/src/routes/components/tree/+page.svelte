<script lang="ts">
	import { Tree } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropInfo } from '$lib/controls'

	let selected = $state<unknown>(undefined)
	let size = $state('md')
	let showLines = $state(true)
	let expandAll = $state(true)

	const fileTree = [
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
						{ text: 'Menu.svelte', value: 'menu', icon: 'i-lucide:file-code' },
						{ text: 'List.svelte', value: 'list', icon: 'i-lucide:file-code' },
						{ text: 'Tree.svelte', value: 'tree', icon: 'i-lucide:file-code' }
					]
				},
				{
					text: 'types',
					value: 'types',
					icon: 'i-lucide:folder',
					children: [
						{ text: 'menu.ts', value: 'menu-types', icon: 'i-lucide:file-code' },
						{ text: 'list.ts', value: 'list-types', icon: 'i-lucide:file-code' }
					]
				},
				{ text: 'index.ts', value: 'index', icon: 'i-lucide:file-code' }
			]
		},
		{ text: 'package.json', value: 'pkg', icon: 'i-lucide:file-text' },
		{ text: 'README.md', value: 'readme', icon: 'i-lucide:file-text' }
	]

	function handleSelect(value: unknown) {
		selected = value
	}
</script>

<Playground
	title="Tree"
	description="Hierarchical view with expand/collapse, tree lines, and custom icons."
>
	{#snippet preview()}
		<div class="constrained">
			<Tree
				items={fileTree}
				{showLines}
				{expandAll}
				size={size as any}
				value={selected}
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropCheckbox label="Show lines" bind:checked={showLines} />
		<PropCheckbox label="Expand all" bind:checked={expandAll} />
		<hr />
		<PropInfo label="Selected" value={selected} />
	{/snippet}
</Playground>

<style>
	.constrained {
		max-width: 320px;
	}
	hr {
		border: none;
		border-top: 1px solid rgb(var(--color-surface-200));
		margin: 0;
	}
</style>
