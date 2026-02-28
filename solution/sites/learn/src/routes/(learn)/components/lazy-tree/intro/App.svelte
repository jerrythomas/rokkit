<script>
	// @ts-nocheck
	import { LazyTree } from '@rokkit/ui'

	const items = [
		{ text: 'Documents', value: 'docs', icon: 'i-lucide:folder', children: true },
		{ text: 'Pictures', value: 'pics', icon: 'i-lucide:folder', children: true },
		{ text: 'notes.txt', value: 'notes', icon: 'i-lucide:file-text' }
	]

	async function handleLazyLoad(item) {
		await new Promise((r) => setTimeout(r, 800))
		if (item.value === 'docs') {
			return [
				{ text: 'Resume.pdf', value: 'resume', icon: 'i-lucide:file-text' },
				{ text: 'Cover Letter.docx', value: 'cover', icon: 'i-lucide:file-text' }
			]
		}
		if (item.value === 'pics') {
			return [
				{ text: 'vacation.jpg', value: 'vacation', icon: 'i-lucide:image' },
				{ text: 'profile.png', value: 'profile', icon: 'i-lucide:image' }
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
