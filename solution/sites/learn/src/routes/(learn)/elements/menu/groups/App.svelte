<script>
	import { Menu } from '@rokkit/ui'

	let options = [
		{
			text: 'File',
			children: [
				{ text: 'New', icon: 'i-lucide:plus' },
				{ text: 'Open', icon: 'i-lucide:folder-open' },
				{ text: 'Save', icon: 'i-lucide:save' }
			]
		},
		{
			text: 'Edit',
			children: [
				{ text: 'Undo', icon: 'i-lucide:edit' },
				{ text: 'Copy', icon: 'i-lucide:copy' },
				{ text: 'Paste', icon: 'i-lucide:clipboard' }
			]
		}
	]
</script>

<Menu {options} label="Menu" onselect={(item) => alert(item.text)} />

<p class="text-surface-z6 mt-4 text-sm">
	Groups are for visual organization only. Keyboard navigation moves through all leaf items
	sequentially.
</p>
