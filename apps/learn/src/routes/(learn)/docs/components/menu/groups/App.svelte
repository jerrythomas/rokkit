<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	let items = [
		{
			label: 'File',
			children: [
				{ label: 'New', icon: 'i-glyph:add-circle' },
				{ label: 'Open', icon: 'i-glyph:folder-open' },
				{ label: 'Save', icon: 'i-glyph:diskette' }
			]
		},
		{
			label: 'Edit',
			children: [
				{ label: 'Undo', icon: 'i-glyph:restart' },
				{ label: 'Copy', icon: 'i-glyph:copy' },
				{ label: 'Paste', icon: 'i-glyph:clipboard' }
			]
		}
	]
</script>

<Menu {items} label="Menu" onselect={(value, proxy) => alert(proxy?.text)} />

<p class="text-surface-z6 mt-4 text-sm">
	Groups are for visual organization only. Keyboard navigation moves through all leaf items
	sequentially.
</p>
