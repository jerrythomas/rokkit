<script>
	// @ts-nocheck
	import { Toolbar } from '@rokkit/ui'

	let items = [
		{ label: 'Cut', icon: 'i-lucide:scissors' },
		{ label: 'Copy', icon: 'i-lucide:copy' },
		{ label: 'Paste', icon: 'i-lucide:clipboard' },
		{ itemType: 'separator' },
		{ label: 'Save', icon: 'i-lucide:save' },
		{ label: 'Download', icon: 'i-lucide:download' },
		{ itemType: 'spacer' },
		{ label: 'Settings', icon: 'i-lucide:settings' }
	]
</script>

<Toolbar {items} onclick={(item) => alert(item.label)} />

<p class="text-surface-z6 mt-4 text-sm">
	Separators create visual dividers. Spacers push items to the end. Both are skipped during keyboard
	navigation.
</p>
