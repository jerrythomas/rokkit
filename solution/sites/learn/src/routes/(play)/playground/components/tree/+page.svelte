<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let selected = $state(undefined)

	let props = $state({ size: 'md', lineStyle: 'solid' })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			lineStyle: { type: 'string' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/lineStyle', label: 'Line style', props: { options: ['none', 'solid', 'dashed', 'dotted'] } },
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

	function handleSelect(value) {
		selected = value
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="max-w-[320px]">
			<Tree
				items={fileTree}
				lineStyle={props.lineStyle}
				size={props.size}
				value={selected}
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" value={selected} />
	{/snippet}
</PlaySection>

<PlaySection>
	{#snippet preview()}
		<div class="max-w-[320px]">
			<Tree
				items={fileTree}
				lineStyle="none"
				value={selected}
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<InfoField label="Selected" value={selected} />
	{/snippet}
</PlaySection>
