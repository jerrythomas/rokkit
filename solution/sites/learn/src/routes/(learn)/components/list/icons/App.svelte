<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{
			label: 'Documents',
			children: [{ label: 'Resume.pdf' }, { label: 'Cover Letter.docx' }]
		},
		{
			label: 'Images',
			children: [{ label: 'portrait.jpg' }, { label: 'landscape.png' }]
		},
		{
			label: 'Videos',
			children: [{ label: 'intro.mp4' }, { label: 'demo.webm' }]
		}
	]

	const icons = { opened: 'i-lucide:folder-open', closed: 'i-lucide:folder' }
	let value = $state(null)
</script>

<List {items} collapsible {icons} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value.label ?? value}</strong></p>
{/if}
