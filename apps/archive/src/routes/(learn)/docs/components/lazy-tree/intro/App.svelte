<script>
	// @ts-nocheck
	import { LazyTree } from '@rokkit/ui'

	const items = [
		{ label: 'Documents', value: 'docs', icon: 'i-glyph:folder', children: true },
		{ label: 'Pictures', value: 'pics', icon: 'i-glyph:folder', children: true },
		{ label: 'notes.txt', value: 'notes', icon: 'i-glyph:file-text' }
	]

	async function handleLazyLoad(item) {
		await new Promise((r) => setTimeout(r, 800))
		if (item.value === 'docs') {
			return [
				{ label: 'Resume.pdf', value: 'resume', icon: 'i-glyph:file-text' },
				{ label: 'Cover Letter.docx', value: 'cover', icon: 'i-glyph:file-text' }
			]
		}
		if (item.value === 'pics') {
			return [
				{ label: 'vacation.jpg', value: 'vacation', icon: 'i-glyph:gallery' },
				{ label: 'profile.png', value: 'profile', icon: 'i-glyph:gallery' }
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
