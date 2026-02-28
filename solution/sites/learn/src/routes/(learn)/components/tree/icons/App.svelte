<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			text: 'Documents',
			value: 'docs',
			children: [
				{ text: 'Report.pdf', value: 'report', icon: 'i-lucide:file-text' },
				{ text: 'Notes.md', value: 'notes', icon: 'i-lucide:file-text' }
			]
		},
		{
			text: 'Images',
			value: 'images',
			children: [
				{ text: 'photo.jpg', value: 'photo', icon: 'i-lucide:image' },
				{ text: 'logo.svg', value: 'logo', icon: 'i-lucide:image' }
			]
		}
	]

	const icons = { opened: 'i-lucide:folder-open', closed: 'i-lucide:folder' }
	let value = $state(null)
</script>

<Tree {items} {icons} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
