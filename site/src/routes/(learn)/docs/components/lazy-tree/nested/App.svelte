<script>
	// @ts-nocheck
	import { LazyTree } from '@rokkit/ui'

	const items = [
		{ label: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
		{ label: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
		{ label: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
	]

	async function handleLazyLoad(item) {
		await new Promise((r) => setTimeout(r, 600))
		if (item.value === 'docs') {
			return [
				{ label: 'Resume.pdf', value: 'resume', icon: 'i-lucide:file-text' },
				{
					label: 'Projects',
					value: 'projects',
					icon: 'i-lucide:folder',
					children: true
				}
			]
		}
		if (item.value === 'pics') {
			return [
				{ label: 'vacation.jpg', value: 'vacation', icon: 'i-lucide:image' },
				{ label: 'profile.png', value: 'profile', icon: 'i-lucide:image' }
			]
		}
		if (item.value === 'projects') {
			return [
				{ label: 'rokkit/', value: 'rokkit', icon: 'i-lucide:folder-open' },
				{ label: 'notes.md', value: 'proj-notes', icon: 'i-lucide:file-text' }
			]
		}
		return []
	}

	let value = $state(null)
</script>

<LazyTree {items} onlazyload={handleLazyLoad} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
