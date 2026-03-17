<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			label: 'Documents',
			value: 'docs',
			children: [
				{ label: 'Report.pdf', value: 'report', icon: 'i-glyph:file-text' },
				{ label: 'Notes.md', value: 'notes', icon: 'i-glyph:file-text' }
			]
		},
		{
			label: 'Images',
			value: 'images',
			children: [
				{ label: 'photo.jpg', value: 'photo', icon: 'i-glyph:gallery' },
				{ label: 'logo.svg', value: 'logo', icon: 'i-glyph:gallery' }
			]
		}
	]

	const icons = { opened: 'i-glyph:folder-open', closed: 'i-glyph:folder' }
	let value = $state(null)
</script>

<Tree {items} {icons} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value}</strong></p>
{/if}
