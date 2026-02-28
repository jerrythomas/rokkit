<script lang="ts">
	import { LazyTree } from '@rokkit/ui'
	import { InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let selected = $state<unknown>(undefined)

	const lazyTree = [
		{ text: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
		{ text: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
		{ text: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
	]

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
	title="LazyTree"
	description="Tree with lazy-loaded children. Nodes with children: true fetch on expand."
>
	{#snippet preview()}
		<div class="max-w-[320px]">
			<LazyTree
				items={lazyTree}
				value={selected}
				onselect={(v) => (selected = v)}
				onloadchildren={handleLoadChildren}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<InfoField label="Selected" value={selected} />
	{/snippet}
</Playground>
