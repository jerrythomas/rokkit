<script>
	// @ts-nocheck
	import { Toolbar } from '@rokkit/ui'

	let items = [
		{ label: 'Bold', icon: 'i-glyph:text-bold' },
		{ label: 'Italic', icon: 'i-glyph:text-italic' },
		{ itemType: 'separator' },
		{ label: 'Align Left', icon: 'i-glyph:text-bold' }
	]
</script>

<Toolbar {items} onclick={(item) => console.log(item.label)} />
