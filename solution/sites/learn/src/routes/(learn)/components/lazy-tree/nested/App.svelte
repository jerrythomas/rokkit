<script>
	// @ts-nocheck
	import { LazyTree } from '@rokkit/ui'

	const items = [
		{ text: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
		{ text: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
		{ text: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
	]

	async function handleLoadChildren(value) {
		await new Promise((r) => setTimeout(r, 600))
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

	let value = $state(null)
</script>

<LazyTree {items} onloadchildren={handleLoadChildren} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
