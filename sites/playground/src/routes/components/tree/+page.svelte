<script lang="ts">
	import { Tree } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let selected = $state<unknown>(undefined)
	let multiSelected = $state<unknown[]>([])
	let lazySelected = $state<unknown>(undefined)

	let props = $state({ size: 'md', showLines: true, expandAll: true, multiselect: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			showLines: { type: 'boolean' },
			expandAll: { type: 'boolean' },
			multiselect: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/showLines', label: 'Show lines' },
			{ scope: '#/expandAll', label: 'Expand all' },
			{ scope: '#/multiselect', label: 'Multi-select' },
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

	// ── Lazy loading demo ─────────────────────────────────────────
	const lazyTree = $state([
		{ text: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
		{ text: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
		{ text: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
	])

	async function handleLoadChildren(value: unknown): Promise<Record<string, unknown>[]> {
		await new Promise((r) => setTimeout(r, 800))
		if (value === 'docs') {
			return [
				{ text: 'Resume.pdf', value: 'resume', icon: 'i-lucide:file-text' },
				{
					text: 'Projects',
					value: 'projects',
					icon: 'i-lucide:folder',
					children: true
				}
			]
		}
		if (value === 'pics') {
			return [
				{ text: 'vacation.jpg', value: 'vacation', icon: 'i-lucide:image' },
				{ text: 'profile.png', value: 'profile', icon: 'i-lucide:image' }
			]
		}
		if (value === 'projects') {
			return [
				{ text: 'rokkit/', value: 'rokkit', icon: 'i-lucide:folder-open' },
				{ text: 'notes.md', value: 'proj-notes', icon: 'i-lucide:file-text' }
			]
		}
		return []
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
				expandAll={props.expandAll}
				size={props.size as any}
				multiselect={props.multiselect}
				bind:selected={multiSelected}
				value={selected}
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" value={selected} />
		{#if props.multiselect}
			<InfoField label="Multi-selected" value={multiSelected.join(', ')} />
		{/if}
	{/snippet}
</Playground>

<Playground
	title="Lazy Loading"
	description="Children loaded on demand with async callback. Nodes with children: true show a spinner while loading."
>
	{#snippet preview()}
		<div class="max-w-[320px]">
			<Tree
				items={lazyTree}
				showLines
				value={lazySelected}
				onselect={(v) => (lazySelected = v)}
				onloadchildren={handleLoadChildren}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<InfoField label="Selected" value={lazySelected} />
	{/snippet}
</Playground>
