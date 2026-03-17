<script>
	// @ts-nocheck
	import { Toolbar } from '@rokkit/ui'

	let items = [
		{ label: 'Cut', icon: 'i-glyph:scissors' },
		{ label: 'Copy', icon: 'i-glyph:copy' },
		{ label: 'Paste', icon: 'i-glyph:clipboard' },
		{ itemType: 'separator' },
		{ label: 'Save', icon: 'i-glyph:diskette' },
		{ label: 'Download', icon: 'i-glyph:download' },
		{ itemType: 'spacer' },
		{ label: 'Settings', icon: 'i-glyph:settings' }
	]
</script>

<Toolbar {items} onclick={(item) => alert(item.label)} />

<p class="text-surface-z6 mt-4 text-sm">
	Separators create visual dividers. Spacers push items to the end. Both are skipped during keyboard
	navigation.
</p>
