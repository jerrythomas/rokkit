<script>
	// @ts-nocheck
	import { Toolbar } from '@rokkit/ui'

	let lastAction = $state('none')

	let items = [
		{ label: 'Bold', icon: 'i-glyph:text-bold' },
		{ label: 'Italic', icon: 'i-glyph:text-italic' },
		{ label: 'Underline', icon: 'i-glyph:text-underline' },
		{ itemType: 'separator' },
		{ label: 'Align Left', icon: 'i-glyph:text-bold' },
		{ label: 'Align Center', icon: 'i-glyph:layers-minimalistic' },
		{ label: 'Align Right', icon: 'i-glyph:text-bold' }
	]
</script>

<div class="space-y-4">
	<Toolbar {items} onclick={(item) => (lastAction = item.label)} />

	<p class="text-surface-z7">
		Last action: <strong>{lastAction}</strong>
	</p>
</div>
