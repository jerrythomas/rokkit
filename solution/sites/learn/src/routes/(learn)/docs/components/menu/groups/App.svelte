<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	let items = [
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
				{ text: 'Undo', icon: 'i-lucide:rotate-ccw' },
				{ text: 'Copy', icon: 'i-lucide:copy' },
				{ text: 'Paste', icon: 'i-lucide:clipboard' }
			]
		}
	]
</script>

<Menu {items} label="Menu" onselect={(value, proxy) => alert(proxy?.text)} />

<p class="text-surface-z6 mt-4 text-sm">
	Groups are for visual organization only. Keyboard navigation moves through all leaf items
	sequentially.
</p>
