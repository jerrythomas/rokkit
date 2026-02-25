<script>
	import { Toolbar } from '@rokkit/ui'

	let items = [
		{ text: 'Cut', icon: 'i-lucide:scissors' },
		{ text: 'Copy', icon: 'i-lucide:copy' },
		{ text: 'Paste', icon: 'i-lucide:clipboard' },
		{ itemType: 'separator' },
		{ text: 'Save', icon: 'i-lucide:save' },
		{ text: 'Download', icon: 'i-lucide:download' },
		{ itemType: 'spacer' },
		{ text: 'Settings', icon: 'i-lucide:settings' }
	]
</script>

<Toolbar {items} onclick={(item) => alert(item.text)} />

<p class="text-surface-z6 mt-4 text-sm">
	Separators create visual dividers. Spacers push items to the end. Both are skipped during
	keyboard navigation.
</p>
