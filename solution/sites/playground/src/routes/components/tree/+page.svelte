<script lang="ts">
	import { Tree } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let selected = $state<unknown>(undefined)

	let props = $state({ size: 'md', showLines: true })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			showLines: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/showLines', label: 'Show lines' },
			{ type: 'separator' }
		]
	}

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
		<div class="max-w-[320px]">
			<Tree
				items={fileTree}
				showLines={props.showLines}
				size={props.size as any}
				value={selected}
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" value={selected} />
	{/snippet}
</Playground>

<Playground
	title="No Lines"
	description="Indentation only, no connectors."
>
	{#snippet preview()}
		<div class="max-w-[320px]">
			<Tree
				items={fileTree}
				showLines={false}
				value={selected}
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<InfoField label="Selected" value={selected} />
	{/snippet}
</Playground>
