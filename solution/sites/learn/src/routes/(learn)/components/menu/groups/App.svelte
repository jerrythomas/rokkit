<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	let options = [
		{
			label: 'File',
			children: [
				{ label: 'New', icon: 'i-lucide:plus' },
				{ label: 'Open', icon: 'i-lucide:folder-open' },
				{ label: 'Save', icon: 'i-lucide:save' }
			]
		},
		{
			label: 'Edit',
			children: [
				{ label: 'Undo', icon: 'i-lucide:rotate-ccw' },
				{ label: 'Copy', icon: 'i-lucide:copy' },
				{ label: 'Paste', icon: 'i-lucide:clipboard' }
			]
		}
	]
</script>

<Menu {options} label="Menu" onselect={(value, item) => alert(item?.label)} />

<p class="text-surface-z6 mt-4 text-sm">
	Groups are for visual organization only. Keyboard navigation moves through all leaf items
	sequentially.
</p>
