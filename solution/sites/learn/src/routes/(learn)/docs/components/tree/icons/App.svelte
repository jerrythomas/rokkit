<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			label: 'Documents',
			value: 'docs',
			children: [
				{ label: 'Report.pdf', value: 'report', icon: 'i-lucide:file-text' },
				{ label: 'Notes.md', value: 'notes', icon: 'i-lucide:file-text' }
			]
		},
		{
			label: 'Images',
			value: 'images',
			children: [
				{ label: 'photo.jpg', value: 'photo', icon: 'i-lucide:image' },
				{ label: 'logo.svg', value: 'logo', icon: 'i-lucide:image' }
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
